# Khagolshastra (खगोलशास्त्र)
### *The International Journal of Astronomy & Spaceflight*

**Khagolshastra** is a digital broadsheet newspaper and academic research portal designed for astrophysicists, planetary scientists, aerospace engineers, students, and stargazers. It unifies breaking space exploration news, peer-reviewed scientific literature, and real-time deep-space telemetry into a single, beautifully crafted Monocle-inspired editorial platform.

---

## 🌌 What is Khagolshastra?

Khagolshastra serves as the single source of truth for all major developments across our solar system and the observable universe. The platform bridges the gap between fast-moving aerospace journalism and deep academic research by combining real-time astronomical dispatches with direct access to landmark scientific preprints and journal repositories.

---

## 🔭 What You’ll Find on the Platform

### 1. Space Journalism & Editorial Dispatches
Curated editorial coverage across every major discipline of astronomy and space exploration:
* **Solar System & Planetary Dynamics**: Surface discoveries on Mars, subsurface oceans on Europa and Enceladus, comets, asteroids, and lunar missions.
* **Exoplanetary Systems**: Atmospheric characterization of super-Earths, habitable zone transits, and biosignature searches.
* **Stellar Evolution & Supernovae**: Magnetars, neutron star mergers, white dwarfs, and gamma-ray bursts.
* **Galactic Astronomy & Cosmology**: Structure of the Milky Way, dark matter distribution, cosmic expansion, and cosmic dawn observations.
* **Rocket Launches & Orbital Manifests**: Weekly launch manifests, heavy-lift rocketry (Starship, Falcon 9, SLS, Ariane 6), and commercial spaceflight.
* **Human & Robotic Spaceflight**: Artemis deep-space missions, the International Space Station, Mars rovers, and outer planet probes.
* **Historical Retrospectives**: *Today in Astronomy History* and *This Week in the Cosmos*.

---

### 2. Peer-Reviewed Academic Research Portal (`/research`)
A comprehensive scientific library indexing authentic peer-reviewed research papers, preprint manuscripts, DOIs, and Harvard/SAO ADS bibcodes across major astronomical repositories:
* **Astronomy & Astrophysics (A&A)**: European peer-reviewed journal published by EDP Sciences.
* **International Academic Astronomy Research Journal (IAARJ)**: Open-access scientific research across modern astrophysics and solar dynamics.
* **arXiv Astrophysics (`astro-ph`)**: Rapid preprints direct from Cornell University covering exoplanets, high-energy astrophysics, and cosmology.
* **NASA ADS (Astrophysics Data System)**: Authoritative digital library portal hosted by the Harvard-Smithsonian Center for Astrophysics.
* **Interactive Scientific Tools**: In-depth abstract reader modal and instant citation generator for **BibTeX**, **APA 7th Edition**, and MLA styles.

---

### 3. Live Observatory Telemetry
* **James Webb Space Telescope (JWST) Live Tracker**: Real-time instruments telemetry, sub-kelvin cryogenic temperatures, current observation targets, and distance from Earth.

---

### 4. Astronomy Radio & Audio Intelligence
* **Integrated Radio Player**: Seamless audio streaming featuring in-depth educational discussions on cosmos history, general relativity, stellar nucleosynthesis, and observational techniques.

---

## 🔒 Security & Deployment Advisory

> [!WARNING]
> **CRITICAL SECRET ROTATION NOTICE FOR PRODUCTION DEPLOYMENTS:**  
> If any API key, database password, or secret token was previously hardcoded or committed to git history, consider that key compromised. **You must immediately rotate and invalidate any previous credentials across all external service providers** (NASA ADS, NASA API, PostgreSQL, Redis, Cloudflare, Supabase, Stripe, etc.) before deploying to a live production domain.

### 🛡️ Production Security Architecture:
1. **Zero Hardcoded Secrets**: All credentials, database URLs, and master keys are strictly decoupled into environment variables loaded via `.env` (which is excluded in `.gitignore`).
2. **Fail-Safe Startup Verification**: The backend startup sequence refuses to boot in `production` mode if insecure default development keys are detected (`Settings.validate_production_readiness()`).
3. **Defense-in-Depth HTTP Security Headers**: Both FastAPI backend and Next.js frontend inject strict enterprise security headers on every response:
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
   - `Referrer-Policy: strict-origin-when-cross-origin`
   - `Content-Security-Policy: default-src 'self' ...`
   - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
4. **Sliding-Window Rate Limiting**: Sensitive endpoints (`/api/newsletter/*`, `/api/privacy/*`, `/api/admin/*`) enforce a strict sliding-window rate limit (10 requests/minute per client IP) to block abuse and brute-force attacks.
5. **GDPR / CCPA Right to Erasure**: Complete zero-trace data deletion endpoint implemented at `POST /api/privacy/delete-data`.
6. **Zero PII Logging**: All subscriber emails are automatically masked (`j***@domain.com`) in server logs to prevent PII leakage.

---

## 🚀 Deployment Checklist

Before taking the application live on production infrastructure:
1. Copy `.env.example` to `.env` and supply production values:
   ```bash
   SECRET_KEY=$(openssl rand -hex 32)
   ENVIRONMENT=production
   DATABASE_URL=postgresql://user:password@db-host:5432/khagolshastra
   ```
2. Build and verify static generation across all pages:
   ```bash
   cd frontend
   npm run build
   ```
3. Launch with production process supervisor or Docker:
   ```bash
   docker-compose up -d
   ```

