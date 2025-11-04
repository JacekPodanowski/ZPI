# --- ETAP 1: "Builder" ---
FROM python:3.13-slim-bookworm AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install build dependencies (needed for psycopg2 and others)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .

# 💡 Add django-extensions, pydot, and graphviz to requirements.txt instead of manually here.
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt


# --- ETAP 2: "Final" ---
FROM python:3.13-slim-bookworm AS final

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# --- SYSTEM DEPENDENCIES ---
# Graphviz is needed for generating model diagrams with django-extensions + pydot.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    dos2unix \
    graphviz \
    && rm -rf /var/lib/apt/lists/*

# --- CREATE NON-ROOT USER ---
RUN useradd --create-home --shell /bin/bash appuser
ENV PATH="/home/appuser/.local/bin:${PATH}"

# --- INSTALL BUILT PYTHON PACKAGES ---
WORKDIR /home/appuser/app
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*

# --- COPY APPLICATION FILES ---
COPY --chown=appuser:appuser . .

# --- FIX ENTRYPOINT LINE ENDINGS & PERMISSIONS ---
RUN dos2unix entrypoint.sh && chmod +x entrypoint.sh

# --- SWITCH USER ---
USER appuser

# --- EXPOSE PORT ---
EXPOSE 8000

# --- DEFAULT CMD (można nadpisać w docker-compose) ---
CMD ["gunicorn", "--workers", "3", "--bind", "0.0.0.0:8000", "site_project.wsgi:application"]
