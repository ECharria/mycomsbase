<div align="center">
  <img src="https://raw.githubusercontent.com/ECharria/mycomsbase/master/web-frontend/public/logo.svg" alt="MycoMSBase logo" width="320"/>

  <p>
    <strong>An open-source MS/MS spectral library for fungal natural products</strong>
  </p>

  <p>
    MycoMSBase curates high-resolution tandem mass spectra alongside compound metadata —
    biosynthetic class, fungal producer, and literature references —
    to support the dereplication and discovery of fungal secondary metabolites.
  </p>

  <img alt="License" src="https://img.shields.io/badge/license-GPL--3.0-burgundy?color=%237b1c1c"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-66%25-blue"/>
  <img alt="Go" src="https://img.shields.io/badge/Go-31%25-00ADD8"/>
</div>

---

## Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Configuration reference](#configuration-reference)
- [Data format](#data-format)
- [Development](#development)
- [Citing](#citing)

---

## Architecture

MycoMSBase is deployed as a set of Docker services orchestrated with Compose:

```
Browser
  └── nginx (reverse proxy :8080)
        ├── mb3frontend   React/TypeScript web app
        ├── mb3server     Go REST API
        ├── similarity-service   Python spectral search (matchms)
        └── export-service       Java bulk export (MGF/MSP)
              └── postgres   PostgreSQL + Bingo (substructure search)
```

| Service | Technology | Role |
|---|---|---|
| `postgres` | PostgreSQL + Bingo | Stores records; enables substructure search |
| `mb3server` | Go | REST API backend |
| `similarity-service` | Python / FastAPI / matchms | Cosine spectral similarity search |
| `export-service` | Java | Bulk MGF/MSP export |
| `mb3frontend` | React / TypeScript | Web interface |
| `nginx` | nginx | Routes all services under one port |
| `mb3tool` | Go | One-shot database initialisation from a data repo |

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) ≥ 24 with Compose v2
- Git (for loading data from a repository)
- ~4 GB RAM for the full stack

---

## Quick start

### 1. Clone the repository

```bash
git clone https://github.com/ECharria/mycomsbase.git
cd mycomsbase
```

### 2. Set up the environment

Copy the annotated template and edit the key variables:

```bash
cp compose/env.dist compose/.env
```

Minimum required changes in `compose/.env`:

```env
# Where PostgreSQL data will be stored on disk
DB_LOCAL_PATH=./../data/postgres-data

# Git repository containing the MassBank .txt record files
MB_GIT_REPO="https://github.com/<your-org>/<your-data-repo>"
MB_GIT_BRANCH=main

# Local path to the record files (used by the similarity and export services)
MB_DATA_DIRECTORY="./../data/mycomsbase-data"

# Hostname or IP of the server (use localhost for local deployment)
MB3_API_HOST=localhost
MB3_FRONTEND_HOST=localhost
```

### 3. Build and launch

```bash
cd compose
docker compose build
docker compose up -d
```

### 4. Load the spectral library into the database

```bash
docker compose run --rm mb3tool
```

> The `mb3tool` service clones the data repository and imports all records into PostgreSQL.

Once all services are healthy, open **http://localhost:8080/MycoMSBase** in your browser.

---

## Configuration reference

All settings live in `compose/.env`. The fully annotated template is `compose/env.dist`.

| Variable | Default | Description |
|---|---|---|
| `DB_USER` / `DB_PASSWORD` / `DB_NAME` | `mycomsbase` / `mycomsbasepassword` / `mycomsbase` | PostgreSQL credentials |
| `DB_LOCAL_PATH` | `./../data/postgres-data` | Host path for database storage |
| `MB3_API_BASE_URL` | `/MycoMSBase-api` | API base path |
| `MB3_FRONTEND_BASE_URL` | `/MycoMSBase` | Frontend base path |
| `MB_GIT_REPO` | — | URL of the MassBank-format data repository |
| `MB_DATA_DIRECTORY` | `./../data/mycomsbase-data` | Local path to record `.txt` files |
| `COSINE_TOLERANCE` | `0.05` | Fragment mass tolerance in Da for similarity search |
| `SIMILARITY_SERVICE_VERBOSE` | `false` | Verbose logging in similarity service |
| `DISTRIBUTOR_TEXT` | — | Institution name shown on the About page |

---

## Data format

Records follow the [MassBank record format](https://github.com/MassBank/MassBank-data/blob/main/documentation/MassBank_record_format.md). MycoMSBase adds three fields to each record:

```
PUBLICATION: doi:10.xxxx/xxxxx          ← literature reference
CH$COMPOUND_CLASS: Polyketide           ← biosynthetic class
SP$SCIENTIFIC_NAME: Hypoxylon rickii    ← fungal producer
```

A reference table of all compounds (`mycomsbase_unique_compounds.csv`) is included at the repository root with the columns:

`inchikey` · `compound_name` · `compound_class` · `fungal_producer` · `n_spectra` · `doi` · `example_accession`

---

## Development

### Rebuild a single service

```bash
docker compose build mb3server           # Go backend
docker compose build mb3frontend         # React frontend
docker compose build similarity-service  # Python similarity service
docker compose up -d <service>
```

### API

The REST API is served at `http://localhost:8080/MycoMSBase-api/`.  
The full OpenAPI specification is at [`config-openapi.yaml`](config-openapi.yaml).

### Similarity service endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/similarity` | POST | Cosine similarity search against the library |
| `/export/mgf` | POST | Export selected records as MGF |
| `/version` | GET | Service version and loaded library size |

---

## Citing

If you use MycoMSBase, please cite the underlying MassBank3 infrastructure:

> Neumann S. et al. *MassBank3: the spectral reference library's next generation software product.*  
> DOI: [10.5281/zenodo.16923315](https://doi.org/10.5281/zenodo.16923315)

---

## License

Distributed under the GPL-3.0 license — see [`LICENSE`](LICENSE) for details.
