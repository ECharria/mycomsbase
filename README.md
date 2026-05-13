# MycoMSBase

**MycoMSBase** is an open-source MS/MS spectral library for fungal natural products. It curates high-resolution tandem mass spectra alongside compound metadata — biosynthetic class, fungal producer, and literature references — to support the dereplication and discovery of fungal secondary metabolites.

The platform is built on [MassBank3](https://github.com/MassBank/MassBank3) infrastructure and deployed as a set of Docker services.

---

## Architecture

| Service | Description |
|---|---|
| `postgres` | PostgreSQL + Bingo extension for substructure search |
| `mb3server` | Go REST API backend |
| `similarity-service` | Python (FastAPI + matchms) spectral similarity search |
| `export-service` | Java service for bulk MGF/MSP export |
| `mb3frontend` | React/TypeScript web frontend |
| `nginx` | Reverse proxy routing all services |
| `mb3tool` | One-shot tool for database initialisation from a data repository |

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24 with Compose v2
- Git (for data loading from a repository)
- ~4 GB RAM for the full stack

---

## Quick start

### 1. Clone the repository

```bash
git clone <this-repo>
cd mycomsbase
```

### 2. Configure the environment

```bash
cp compose/env.dist compose/.env
```

Edit `compose/.env` and set at minimum:

```env
# Path where PostgreSQL data will be persisted
DB_LOCAL_PATH=./../data/postgres-data

# Git repository containing MassBank .txt records
MB_GIT_REPO="https://github.com/<your-org>/<your-data-repo>"
MB_GIT_BRANCH=main

# Local path to the record files (used by similarity-service and export-service)
MB_DATA_DIRECTORY="./../data/mycomsbase-data"

# Public hostname/IP of the server
MB3_API_HOST=localhost
MB3_FRONTEND_HOST=localhost
```

### 3. Build and start

```bash
cd compose
docker compose build
docker compose up -d
```

### 4. Load data into the database

The `mb3tool` service clones the data repository and imports all records:

```bash
docker compose run --rm mb3tool
```

The frontend will be available at `http://localhost:8080/MycoMSBase` once all services are healthy.

---

## Configuration reference

All settings are controlled via `compose/.env`. A fully annotated template is provided in `compose/env.dist`.

| Variable | Default | Description |
|---|---|---|
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `mycomsbase` / `mycomsbasepassword` / `mycomsbase` | PostgreSQL credentials |
| `MB3_API_BASE_URL` | `/MycoMSBase-api` | API base path |
| `MB3_FRONTEND_BASE_URL` | `/MycoMSBase` | Frontend base path |
| `MB_GIT_REPO` | — | URL of the MassBank data repository |
| `MB_DATA_DIRECTORY` | `./../data/mycomsbase-data` | Local path to record `.txt` files |
| `COSINE_TOLERANCE` | `0.05` | Fragment mass tolerance (Da) for similarity search |
| `SIMILARITY_SERVICE_VERBOSE` | `false` | Enable verbose logging in similarity service |
| `DISTRIBUTOR_TEXT` | — | Institution text shown on the About page |

---

## Data format

Records follow the [MassBank record format](https://github.com/MassBank/MassBank-data/blob/main/documentation/MassBank_record_format.md). MycoMSBase extends the standard with three additional fields:

```
PUBLICATION: doi:10.xxxx/xxxxx
CH$COMPOUND_CLASS: Polyketide
SP$SCIENTIFIC_NAME: Hypoxylon rickii
```

A reference CSV of all compounds in the library (`mycomsbase_unique_compounds.csv`) is included at the repository root with columns: `inchikey`, `compound_name`, `compound_class`, `fungal_producer`, `n_spectra`, `doi`, `example_accession`.

---

## Development

### Rebuild a single service after code changes

```bash
docker compose build mb3server           # Go backend
docker compose build mb3frontend         # React frontend
docker compose build similarity-service  # Python similarity service
docker compose up -d <service>
```

### API

The REST API is available at `http://localhost:8080/MycoMSBase-api/`. The OpenAPI specification is at `config-openapi.yaml`.

### Similarity service

The Python service (`similarity-service/`) loads all library spectra at startup using [matchms](https://github.com/matchms/matchms) and exposes:

| Endpoint | Method | Description |
|---|---|---|
| `/similarity` | POST | Cosine similarity search against the library |
| `/export/mgf` | POST | Export selected records as MGF |
| `/version` | GET | Service version and library size |

---

## Citing

If you use MycoMSBase, please cite the underlying MassBank3 infrastructure:

> Neumann S. et al. *MassBank3: the spectral reference library's next generation software product.* DOI: [10.5281/zenodo.16923315](https://doi.org/10.5281/zenodo.16923315)

---

## License

GPL-3.0 — see [LICENSE](LICENSE).
