# Pocket Pallet — Backend Deploy Guide

This guide documents a clean, repeatable path to deploy the **FastAPI + SQLAlchemy + Alembic** backend locally and on **Render**.

---

## 0) Repository Layout (relevant bits)

```
PP_MVP/backend/
├── app/
├── alembic/
│   ├── env.py
│   └── versions/
│       ├── 001_add_producer_column.py      # revision = a1b2c3d4e5f6, down_revision = None
│       ├── 002_add_ocr_feedback_table.py   # revision = b2c3d4e5f6g7, down_revision = a1b2c3d4e5f6
│       └── 003_add_tasting_notes_and_wine_ownership.py
│                                           # revision = c3d4e5f6g7h8, down_revision = b2c3d4e5f6g7
├── alembic.ini                             # script_location = alembic
├── requirements.txt                        # (Render uses this)
└── pyproject.toml (optional, for Poetry)
```

> **Important:** The Alembic chain is **linear**: `001 → 002 → 003`. No bootstrap/shim files.

---

## 1) Required environment variables

Create `PP_MVP/backend/.env` (used locally and as source of truth for Render env vars):

```dotenv
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>
SECRET_KEY=<64-hex>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Generate a secret key (locally)

```bash
python - <<'PY'
import secrets; print(secrets.token_hex(32))
PY
```

> On **Render**, add the **same** keys under **Service ➜ Environment ➜ Environment Variables**.

---

## 2) Local setup & sanity checks

From `PP_MVP/backend/`:

```bash
# 2.1 Create venv and install
python3 -m venv venv && source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# 2.2 Load env
set -a; source .env; set +a

# 2.3 Check DB connectivity
python - <<'PY'
import os
from sqlalchemy import create_engine, text
eng = create_engine(os.environ["DATABASE_URL"], pool_pre_ping=True)
with eng.connect() as c:
    print("DB ok:", c.execute(text("select version()"))).scalar()
PY

# 2.4 Alembic health
alembic heads -v        # expect one head: c3d4e5f6g7h8
alembic history         # see 001 -> 002 -> 003

# 2.5 Apply migrations
alembic upgrade head

# 2.6 Run the API locally
uvicorn app.main:app --reload
```

---

## 3) Render configuration

### 3.1 Python version

Add a file at repo root **or** `PP_MVP/backend/` (Render will detect either):

**`runtime.txt`**

```
python-3.11.9
```

> 3.11.x is broadly supported. Avoid 3.13 for now.

### 3.2 Build command & Start command

In your Render **Web Service** → **Settings** → **Build & Deploy**:

* **Build Command**

  * If using `requirements.txt` (current setup):

    ```
    pip install -r PP_MVP/backend/requirements.txt && cd PP_MVP/backend && alembic upgrade head
    ```
  * If you switch to Poetry later:

    ```
    cd PP_MVP/backend && poetry install --no-root && alembic upgrade head
    ```

* **Start Command**

  ```
  cd PP_MVP/backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
  ```

### 3.3 Environment Variables (Render UI)

Add the following under **Environment**:

* `DATABASE_URL` = your external PostgreSQL URL from Render (copy–paste full URL)
* `SECRET_KEY` = the 64-hex string
* `ALGORITHM` = `HS256`
* `ACCESS_TOKEN_EXPIRE_MINUTES` = `30`

> Do **not** commit secrets to Git. Use Render's env UI.

---

## 4) Migration policy (how to add future schema changes)

1. Modify your SQLAlchemy models.
2. Create a migration:

   ```bash
   alembic revision -m "<short description>"
   # edit the generated migration if needed
   ```
3. Apply locally:

   ```bash
   alembic upgrade head
   ```
4. Commit & push the new file under `alembic/versions/`.
5. Render will run `alembic upgrade head` during build/deploy.

> **Never** create "shim" or ad‑hoc bootstrap revisions again. Keep a **single, linear chain**.

---

## 5) Operational checks (after each deploy)

```bash
# confirm Alembic head in logs or manually:
cd PP_MVP/backend && set -a; source .env; set +a
alembic current     # expect c3d4e5f6g7h8

# quick health endpoint (if you have one)
# curl https://<your-render-host>/healthz
```

Tag the repo when a deploy is stable:

```bash
git tag -a v0.1.0-backend-stable -m "Stable backend deploy"
git push origin v0.1.0-backend-stable
```

---

## 6) Troubleshooting (the greatest hits)

### A) `Can't locate revision identified by 'add_ocr_feedback_table'`

You're referencing a deleted or missing revision. Fix the headers to a linear chain **or** (as a last resort) align the DB's `alembic_version` to the nearest valid revision and re-run:

```sql
-- In psql or via SQLAlchemy engine
UPDATE alembic_version SET version_num='b2c3d4e5f6g7' WHERE version_num='add_ocr_feedback_table';
```

Then run:

```bash
alembic upgrade head
```

### B) Multiple Alembic heads / branchpoint

Edit `down_revision` values so there's exactly one path: `001 → 002 → 003 → …`.

### C) `Could not parse SQLAlchemy URL from string ''` or `driver://user@...`

* Ensure `.env` is loaded locally (`set -a; source .env; set +a`).
* Ensure Render **Environment Variables** includes a correct `DATABASE_URL` (copy from Render Postgres page → External Connection String).

### D) `psycopg2` build error / `pg_config` missing

Use the wheel: pin `psycopg2-binary==2.9.x` (already in `requirements.txt`).

### E) Wrong Python version on Render

Add/update `runtime.txt` to a supported version (e.g., `python-3.11.9`).

---

## 7) Quick reference commands

```bash
# List heads/history
alembic heads -v
alembic history

# Upgrade / downgrade
alembic upgrade head
alembic downgrade -1

# Generate new migration skeleton
alembic revision -m "<msg>"
```

---

## 8) Support notes

* Keep `script_location = alembic` in `alembic.ini`.
* Keep migration files only under `alembic/versions/`.
* Prefer one PR per schema change for clean deploys.

---

Happy shipping! 🚀

