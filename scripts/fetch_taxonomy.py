"""
Fetch NCBI taxonomy for all fungal producers in mycomsbase_unique_compounds.csv
and write taxonomy_info.csv with columns:
  species, taxid, genus, family, order, class, phylum
"""

import csv
import time
import xml.etree.ElementTree as ET
import requests

ENTREZ_BASE = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
EMAIL = "esteban.charriagiron@wur.nl"
RANKS_WANTED = {"genus", "family", "order", "class", "phylum"}


def search_taxid(species_name: str) -> str | None:
    resp = requests.get(
        f"{ENTREZ_BASE}/esearch.fcgi",
        params={"db": "taxonomy", "term": species_name, "retmode": "json", "email": EMAIL},
        timeout=10,
    )
    resp.raise_for_status()
    ids = resp.json().get("esearchresult", {}).get("idlist", [])
    return ids[0] if ids else None


def fetch_lineage(taxid: str) -> dict:
    resp = requests.get(
        f"{ENTREZ_BASE}/efetch.fcgi",
        params={"db": "taxonomy", "id": taxid, "retmode": "xml", "email": EMAIL},
        timeout=10,
    )
    resp.raise_for_status()
    root = ET.fromstring(resp.text)
    taxon = root.find("Taxon")
    if taxon is None:
        return {}

    lineage = {}
    for node in taxon.findall(".//LineageEx/Taxon"):
        rank = node.findtext("Rank", "").lower()
        name = node.findtext("ScientificName", "")
        if rank in RANKS_WANTED:
            lineage[rank] = name

    # Also grab genus from the taxon itself if rank is species
    own_rank = taxon.findtext("Rank", "").lower()
    own_name = taxon.findtext("ScientificName", "")
    if own_rank in RANKS_WANTED:
        lineage[own_rank] = own_name

    return lineage


def main():
    input_csv = "mycomsbase_unique_compounds.csv"
    output_csv = "taxonomy_info.csv"

    with open(input_csv) as f:
        rows = list(csv.DictReader(f))

    species_set = sorted(
        {r["fungal_producer"] for r in rows if r["fungal_producer"] not in ("NA", "")}
    )

    results = []
    for species in species_set:
        print(f"Looking up: {species} ...", end=" ", flush=True)
        try:
            taxid = search_taxid(species)
            if not taxid:
                print("NOT FOUND")
                results.append({"species": species, "taxid": "", "genus": "", "family": "",
                                 "order": "", "class": "", "phylum": ""})
                continue
            time.sleep(0.4)  # NCBI rate limit: max 3 requests/sec without API key
            lineage = fetch_lineage(taxid)
            row = {
                "species": species,
                "taxid": taxid,
                "genus": lineage.get("genus", ""),
                "family": lineage.get("family", ""),
                "order": lineage.get("order", ""),
                "class": lineage.get("class", ""),
                "phylum": lineage.get("phylum", ""),
            }
            print(f"OK (taxid={taxid}, family={row['family']}, order={row['order']})")
            results.append(row)
            time.sleep(0.4)
        except Exception as e:
            print(f"ERROR: {e}")
            results.append({"species": species, "taxid": "ERROR", "genus": "", "family": "",
                             "order": "", "class": "", "phylum": ""})

    with open(output_csv, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["species", "taxid", "genus", "family", "order", "class", "phylum"])
        writer.writeheader()
        writer.writerows(results)

    print(f"\nWritten to {output_csv}")


if __name__ == "__main__":
    main()
