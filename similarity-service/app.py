import os
import logging
import numpy as np
from contextlib import asynccontextmanager
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI
from fastapi.responses import Response
from pydantic import BaseModel
from matchms import Spectrum
from matchms.filtering.default_pipelines import DEFAULT_FILTERS
from matchms.filtering.SpectrumProcessor import SpectrumProcessor
from matchms.similarity.FlashSimilarity import FlashSimilarity
from specreboot.library.library_matching import score_candidates, confidence_aware_match

logger = logging.getLogger("uvicorn")

_library: list[Spectrum] = []
_similarity: FlashSimilarity | None = None

_FOCUSED_ION_MAP = {
    "precursor_m/z": "precursor_mz",
    "precursor_type": "adduct",
}

_MS_MAP = {
    "ion_mode": "ionmode",
    "ms_type": "ms_level",
    "collision_energy": "collision_energy",
}


def _parse_massbank_file(path: Path) -> Spectrum | None:
    metadata: dict = {}
    mz_list: list[float] = []
    int_list: list[float] = []
    in_peak_block = False

    try:
        for line in path.read_text(encoding="utf-8").splitlines():
            if line.startswith("//"):
                break
            if in_peak_block:
                parts = line.strip().split()
                if len(parts) >= 2:
                    try:
                        mz_list.append(float(parts[0]))
                        int_list.append(float(parts[1]))
                    except ValueError:
                        pass
                continue
            if line.startswith("PK$PEAK:"):
                in_peak_block = True
                continue

            if ":" not in line or line.startswith(" "):
                continue

            key, _, value = line.partition(":")
            key = key.strip()
            value = value.strip()

            if key == "ACCESSION":
                metadata["accession"] = value
            elif key == "RECORD_TITLE":
                metadata["compound_name"] = value
            elif key == "CH$FORMULA":
                metadata["formula"] = value
            elif key == "CH$EXACT_MASS":
                try:
                    metadata["exact_mass"] = float(value)
                except ValueError:
                    pass
            elif key == "CH$SMILES":
                metadata["smiles"] = value
            elif key == "CH$IUPAC":
                metadata["inchi"] = value
            elif key == "AC$MASS_SPECTROMETRY":
                sub_key, _, sub_val = value.partition(" ")
                mapped = _MS_MAP.get(sub_key.lower())
                if mapped == "ionmode":
                    metadata["ionmode"] = sub_val.strip().lower()
                elif mapped == "ms_level":
                    try:
                        metadata["ms_level"] = int(sub_val.strip().replace("MS", ""))
                    except ValueError:
                        pass
                elif mapped:
                    metadata[mapped] = sub_val.strip()
            elif key == "MS$FOCUSED_ION":
                sub_key, _, sub_val = value.partition(" ")
                mapped = _FOCUSED_ION_MAP.get(sub_key.lower())
                if mapped == "precursor_mz":
                    try:
                        metadata["precursor_mz"] = float(sub_val.strip())
                    except ValueError:
                        pass
                elif mapped:
                    metadata[mapped] = sub_val.strip()
    except Exception as e:
        logger.warning(f"Failed to parse {path}: {e}")
        return None

    if not mz_list:
        return None

    mz = np.array(mz_list, dtype="float32")
    intensities = np.array(int_list, dtype="float32")
    return Spectrum(mz=mz, intensities=intensities, metadata=metadata)


def _load_massbank_dir(data_dir: str) -> list[Spectrum]:
    spectra = []
    for txt_file in sorted(Path(data_dir).rglob("*.txt")):
        s = _parse_massbank_file(txt_file)
        if s is not None:
            spectra.append(s)
    logger.info(f"Loaded {len(spectra)} raw spectra from {data_dir}")
    return spectra


def _build_library(data_dir: str, tolerance: float) -> tuple[list[Spectrum], FlashSimilarity]:
    raw = _load_massbank_dir(data_dir)

    processor = SpectrumProcessor(DEFAULT_FILTERS)
    cleaned, _ = processor.process_spectra(
        raw,
        cleaned_spectra_file="/tmp/library_cleaned.mgf",
        create_report=False,
    )

    for s in cleaned:
        acc = s.metadata.get("accession")
        if acc:
            s.set("spectrum_id", str(acc))

    logger.info(f"Library ready: {len(cleaned)} spectra")
    metric = FlashSimilarity(score_type="cosine", matching_mode="fragment", tolerance=tolerance)
    return cleaned, metric


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _library, _similarity
    data_dir = os.environ.get("MB_DATA_DIRECTORY", "/mycomsbase-data")
    tolerance = float(os.environ.get("COSINE_TOLERANCE", "0.05"))
    _library, _similarity = _build_library(data_dir, tolerance)
    yield


app = FastAPI(lifespan=lifespan)


class Peak(BaseModel):
    mz: float
    intensity: float


class SimilarityRequest(BaseModel):
    peak_list: List[Peak]
    reference_spectra_list: Optional[List[str]] = []


@app.post("/similarity")
def similarity_search(request: SimilarityRequest):
    peaks = sorted(request.peak_list, key=lambda p: p.mz)
    mz = np.array([p.mz for p in peaks], dtype="float32")
    intensities = np.array([p.intensity for p in peaks], dtype="float32")
    query = Spectrum(mz=mz, intensities=intensities)

    if request.reference_spectra_list:
        acc_set = set(request.reference_spectra_list)
        search_lib = [s for s in _library if s.metadata.get("spectrum_id") in acc_set]
        if not search_lib:
            search_lib = _library
    else:
        search_lib = _library

    bootstrap_replicates = int(os.environ.get("BOOTSTRAP_REPLICATES", "50"))
    score_threshold = float(os.environ.get("SCORE_THRESHOLD", "0.7"))

    try:
        result = confidence_aware_match(
            query_spectrum=query,
            library_spectra=search_lib,
            similarity_metric=_similarity,
            B=bootstrap_replicates,
            top_n=min(100, len(search_lib)),
            score_threshold=score_threshold,
            decimals=2,
            seed=42,
            precursor_mz_tolerance_da=0.02,
            analog_search=False,
        )
        return {
            "similarity_score_list": [
                {
                    "accession": row["candidate_id"],
                    "similarity_score": row["original_score"],
                    "match_support": row["match_support"],
                }
                for _, row in result.candidate_stats.iterrows()
                if row["original_score"] > 0
            ]
        }
    except Exception as e:
        logger.warning(f"confidence_aware_match failed ({e}), falling back to score_candidates")
        matches = score_candidates(query, search_lib, _similarity)
        return {
            "similarity_score_list": [
                {"accession": m.candidate_id, "similarity_score": m.original_score, "match_support": 0.0}
                for m in matches
                if m.original_score > 0
            ]
        }


class ExportRequest(BaseModel):
    record_list: Optional[List[str]] = []


@app.post("/export/mgf")
def export_mgf(request: ExportRequest):
    import tempfile, os
    from matchms.exporting import save_as_mgf

    if request.record_list:
        acc_set = set(request.record_list)
        spectra = [s for s in _library if s.metadata.get("spectrum_id") in acc_set]
    else:
        spectra = list(_library)

    with tempfile.NamedTemporaryFile(suffix=".mgf", delete=False, mode="w") as f:
        tmp_path = f.name
    try:
        save_as_mgf(spectra, tmp_path)
        with open(tmp_path, "rb") as f:
            content = f.read()
    finally:
        os.unlink(tmp_path)

    return Response(
        content=content,
        media_type="application/octet-stream",
        headers={"Content-Disposition": 'attachment; filename="mycomsbase_export.mgf"'},
    )


@app.get("/version")
def version():
    return {"version": "1.0.0-specreboot", "library_size": len(_library)}
