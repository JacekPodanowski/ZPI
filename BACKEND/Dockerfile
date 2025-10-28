# --- ETAP 1: "Builder" ---
FROM python:3.13-slim-bookworm AS builder

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip wheel --no-cache-dir --wheel-dir /wheels -r requirements.txt


# --- ETAP 2: "Final" ---
FROM python:3.13-slim-bookworm AS final

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# KROK 1: Jako `root`, instalujemy zależności systemowe, w tym dos2unix
RUN apt-get update && apt-get install -y libpq5 dos2unix && rm -rf /var/lib/apt/lists/*

# KROK 2: Tworzymy użytkownika nie-root i katalog domowy
RUN useradd --create-home --shell /bin/bash appuser

# KROK 3: Ustawiamy zmienną PATH, aby wskazywała na katalog,
# gdzie pip instaluje programy takie jak gunicorn.
ENV PATH="/home/appuser/.local/bin:${PATH}"

# KROK 4: Kopiujemy "skompilowane" pakiety z etapu "builder" i instalujemy je
# Nadal jako `root`, ale instalujemy je w katalogu domowym przyszłego użytkownika.
WORKDIR /home/appuser/app
COPY --from=builder /wheels /wheels
RUN pip install --no-cache-dir /wheels/*

# KROK 5: Kopiujemy resztę plików aplikacji i ZMIENIAMY ICH WŁAŚCICIELA na `appuser`
COPY --chown=appuser:appuser . .

# 🆕 KROK 5.5: Generujemy migracje podczas budowania obrazu (opcjonalne)
# Uwaga: To zadziała tylko jeśli masz już pliki modeli w projekcie
# Jeśli wolisz generować migracje w entrypoint.sh, zakomentuj te linie
# RUN python manage.py makemigrations --noinput || true

# KROK 5.6: Naprawiamy zakończenia linii w skrypcie entrypoint
# Używamy dos2unix, aby zapewnić, że skrypt ma zakończenia linii w formacie Unix (LF)
# i nadajemy mu uprawnienia do wykonywania.
RUN dos2unix entrypoint.sh && chmod +x entrypoint.sh

# KROK 6: Dopiero teraz, gdy wszystko jest gotowe, przełączamy się na użytkownika nie-root
USER appuser

# Informujemy Dockera, na którym porcie będzie działać serwer Gunicorn
EXPOSE 8000

# Definiujemy skrypt startowy (jest już w WORKDIR i ma nadane uprawnienia)
ENTRYPOINT ["sh", "./entrypoint.sh"]

# Domyślna komenda, która zostanie przekazana do entrypoint.sh.
CMD ["gunicorn", "--workers", "3", "--bind", "0.0.0.0:8000", "site_project.wsgi:application"]