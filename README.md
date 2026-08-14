# Khagolshastra — The International Journal of Astronomy & Spaceflight

A high-fidelity editorial newspaper and academic preprint portal aggregating space news, research papers, and live observatory telemetry across global space institutions.

---

## 🔒 Security & Secret Safety Notice

> [!CAUTION]
> **MANDATORY SECRET ROTATION WARNING (Git History)**:
> If any secret, token, or database password was previously committed during initial prototyping, that value remains permanently in your repository's git commit history.
> **You MUST rotate all production credentials immediately prior to deployment.**
> - Never commit `.env`, `.env.local`, or any `.pem` / credentials files to source control.
> - Ensure all secrets are injected via secure runtime environment variables (e.g., Docker secrets, AWS Secrets Manager, Vercel Env, or system environment variables).

---

## 🛡️ User Personal Data Movement & Privacy Architecture

Khagolshastra is engineered with a strict **Privacy-First & Data Sovereignty** paradigm:

| Data Type | Collection Point | Where it Travels | Where it is Stored | External Sharing | Retention & Erasure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Email Address** | Homepage `#subscribe-dispatch` Form | Sent via HTTPS to `POST /api/newsletter/subscribe` | Stored in isolated `subscribers` database table | **Zero (0)** third-party sharing. Never sent to ad networks or data brokers. | Retained until user unsubscribes or triggers **GDPR Right to Erasure** via `POST /api/privacy/delete-data`. |
| **Search Queries** | Search input on Header & `/research` | Sent via query string `?query=...` | Processed in-memory for article/paper filtering; **never persisted to disk**. | None. | Ephemeral (destroyed after response). |
| **IP Addresses & Device Telemetry** | HTTP Request Headers | Processed ephemerally by web server for reverse proxy routing | Server logs strictly mask / truncate IP addresses; **zero user tracking cookies**. | None. | Ephemeral connection lifetime. |
| **Passwords / Admin Keys** | Admin Login / Authorization Headers | Sent via `Authorization: Bearer <token>` or `X-Admin-Key` header | Stored as hashed/salted secrets; validated using constant-time `secrets.compare_digest`. | None. | Server configuration only. |

### Privacy & GDPR Rights Endpoints
- **Subscribe**: `POST /api/newsletter/subscribe`
- **Unsubscribe / Opt-Out**: `POST /api/newsletter/unsubscribe`
- **Permanent Data Deletion**: `POST /api/privacy/delete-data`
- **Privacy Policy Summary**: `GET /api/privacy/summary`

---

## 🏛️ Platform Architecture

- **Frontend**: Next.js 14.2.35 (App Router, Tailwind CSS, Monocle Editorial Design System)
- **Backend**: FastAPI + SQLAlchemy + Celery + SQLite / PostgreSQL
- **Academic Ingestion**:
  - **Astronomy & Astrophysics (A&A)** (`https://www.aanda.org/`)
  - **International Academic Astronomy Research Journal (IAARJ)** (`https://journaliaarj.com/index.php/IAARJ`)
  - **arXiv Astrophysics (astro-ph)** (`https://arxiv.org/archive/astro-ph`)
  - **NASA ADS (Astrophysics Data System)** (`https://ui.adsabs.harvard.edu/`)
- **Live Observatory Proxy**: James Webb Space Telescope (JWST) telemetry proxy with zero CORS rejections.
- **Audio Radio**: Astronomy Cast 2-day automatic rotating podcast player.

---

## 🚀 Quick Start

### 1. Environment Setup
```bash
cp .env.example .env
```

### 2. Run with Docker Compose
```bash
docker compose up --build
```

### 3. Run Locally (Development)
```bash
# Backend (Port 8000)
cd backend
python -m uvicorn app.main:app --port 8000 --reload

# Frontend (Port 3000)
cd frontend
npm install
npm run dev
```
