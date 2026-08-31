# REGISTRY_MIRROR lets us pull base images through a mirror (e.g. on China
# networks). Default is empty = Docker Hub. Set via docker-compose build args.
ARG REGISTRY_MIRROR=
FROM ${REGISTRY_MIRROR}python:3.12-slim

WORKDIR /app

# Install dependencies first for better layer caching.
COPY requirements.txt .
# Aliyun PyPI mirror for China networks (drop the -i flag for standard networks).
RUN pip install --no-cache-dir -i https://mirrors.aliyun.com/pypi/simple/ -r requirements.txt

# Copy source and data.
COPY . .

# Bake the trained model into the image at build time.
RUN python -m training.train

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
