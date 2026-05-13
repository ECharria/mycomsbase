FROM python:3.12-slim

RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install --no-cache-dir \
    "matchms==0.31.0" \
    "fastapi>=0.110" \
    "uvicorn[standard]>=0.27" \
    "git+https://github.com/ECharria/SpecReBoot.git@library_matching"

COPY app.py .

EXPOSE 8080

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
