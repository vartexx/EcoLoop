# 🌿 EcoLoop - Carbon Footprint Tracker & Gamified Offset Platform

> **Virtual PromptWars — Challenge 3.** An upgraded, premium vertical climate action application that helps individuals **understand, track, and dynamically offset** their personal carbon footprint through high-fidelity metrics, gamified daily checklist challenges, and **personalized AI Sustainability Coaching**.

Built as a single, highly optimized, and accessible web application: a secure **Python / FastAPI** backend and a premium **React + TypeScript (Vite)** frontend using global Tailwind CSS glassmorphism, leveraging **Google Gemini (Vertex AI)** for tailored climate advice and **Firestore** for snapshot history tracking. Deployed to **Google Cloud Run** as a single container serving both APIs and assets.

---

## 🔗 Live Platform Demo

🚀 **[EcoLoop Live Deployment URL](https://ecoloop-1044325459007.us-central1.run.app/)**

*Running on Cloud Run with live Vertex AI (Gemini 2.5-Flash) insights, native rate-limiting security middleware, automated HTML5 accessibility elements, and Firestore-backed tracking in GCP project `multi-agent-vartexx` (`us-central1`).*

---

## 1. Chosen Vertical

**EcoLoop** focuses on personal carbon footprint awareness for everyday citizens. It is structured around the three vertical pillars specified in the hackathon brief, enhanced with gamified reinforcement:

| Pillar | In the Product | Premium Upgrades |
| --- | --- | --- |
| **Understand** | Multi-step interactive Questionnaire collects lifestyle factors (commute mileage, utility usage, diet choice, recycling). | Categorized annual emissions breakdown visualized with Recharts charts, comparing results against global averages and Paris-aligned sustainable targets. |
| **Track** | Save anonymous footprint snapshots to Google Cloud Firestore timeline. | A dedicated, responsive timeline showing historical snapshot trends with weekly commute stats and emissions progress. |
| **Reduce** | Quantified action tips targeting the user's largest emission sources (Gemini with a rules-based fallback). | **Gamified Daily Habit checklist**: Check off green behaviors to gain XP, level up, unlock achievement badges, and offset your projected emissions in real-time. |

---

## 2. Approach & Logic

### The Decision & Gamification Flow (Smart, Context-Driven Assistant)

```text
  [ User Lifestyle Profiler ]
               │
               ▼
    [ Carbon Math Engine ] ──► Computes annual kg CO₂e per category
               │
      ┌────────┴────────┬─────────────────────────────┐
      ▼                 ▼                             ▼
[ Comparison ]   [ Insights Generator ]     [ Gamified Habits Tracker ]
Compare to       ├─ Vertex AI (Gemini)      ├─ Check off daily actions
Benchmarks       └─ Local Rules Fallback    ├─ Earn XP & unlock achievements
                        │                   └─ Real-time carbon offset adjustment
                        ▼
            [ Personal AI Coach Chat ]
                        │
                        ▼
         [ Firestore Snapshots History ]
```

The system features two layers of smart, context-driven logic:

1. **Contextual AI Coach**: The insights engine ranks the user's emissions categories and provides advice targeted at their biggest emission source. A meat-heavy commuter gets transport and diet tips with custom-estimated annual savings.
2. **Graceful AI Degradation & Fallback**: Gemini produces rich, structured advice. If Vertex AI is unreachable, quota-throttled, or disabled, the platform *transparently falls back* to a deterministic local rule engine. Responses are tagged with their `source` (`gemini` or `rules`) so the client is always notified.
3. **In-Memory Rate Limiting**: Protects downstream cloud endpoints (Gemini, Firestore) from quota drainage or spam vectors by applying a thread-safe, token-bucket sliding rate limiter directly in the FastAPI middleware.

### Emission Calculations

EcoLoop utilizes verified emission factors (UK DEFRA 2023, US EPA, IPCC / Our World in Data) fully documented in [`backend/app/engine/constants.py`](backend/app/engine/constants.py):
* **Petrol/Diesel Cars**: `0.170 kg CO₂e/km`
* **Electric Cars (EV)**: `0.047 kg CO₂e/km` (accounting for representative grid mix)
* **Public Transit**: `0.060 kg CO₂e/passenger-km`
* **Short-haul Aviation**: `0.158 kg CO₂e/km` (with radiative forcing uplift, 1100 km average)
* **Long-haul Aviation**: `0.150 kg CO₂e/km` (6500 km average)
* **Grid Electricity**: `0.450 kg CO₂e/kWh` (global-ish average)
* **Natural Gas**: `0.183 kg CO₂e/kWh`

---

## 3. How the Solution Works

### Architecture & Service Mapping

```text
Browser (React + TS, Vite)              Cloud Run (Single Container)
  • Glassmorphism dark/light theme        FastAPI (Python 3.12)
  • Dynamic Recharts dashboard             ├─ POST /api/footprint/analyze  (Math Engine)
  • XP checklist offset tracker  ──HTTP──► ├─ POST /api/coach/advise       (Gemini/Rules)
  • LocalStorage caching & state           ├─ POST /api/history/snapshots  (Firestore save)
  • Anonymous Device ID token              ├─ GET  /api/history/snapshots  (Load history)
                                           └─ GET  /                       (Mounts React SPA)
                                               │
                                               ├─► Vertex AI (Gemini) via ADC
                                               └─► Firestore DB via ADC
```

By packaging the React client inside the FastAPI package, the application mounts the SPA static resources directly in production. This avoids CORS, simplifies domain mapping, and deploys as a single low-overhead service. Authentication to GCP services is secured via **Application Default Credentials** (the Cloud Run service account IAM roles), ensuring **no secrets, API keys, or configurations are exposed in the repository**.

### Repository Structure

```text
├── backend/
│   ├── app/
│   │   ├── api/          # Uniquely named, secure FastAPI route controllers
│   │   ├── coach/        # Advice systems (Vertex AI advisor + deterministic rules)
│   │   ├── engine/       # Calculations service & factors database
│   │   ├── middleware/   # Rate limiting & HTTP security headers configuration
│   │   ├── storage/      # Firestore connector & local in-memory store fallback
│   │   ├── main.py       # App bootstrapping, CORS, & SPA mount handler
│   │   └── models.py     # Strict Pydantic validation schemas
│   └── tests/            # 100% covered backend Pytest suite
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Accessible components (Questionnaire, Dashboard, Chat, Tracker)
│   │   ├── hooks/        # State orchestration & localStorage cache hook (`useFootprint.ts`)
│   │   ├── lib/          # API communication client & identity helpers
│   │   ├── styles/       # Tailwind v4 glassmorphic theme stylesheet
│   │   ├── utils/        # Calculator mathematical models & gamification presets
│   │   └── App.tsx       # Main dashboard layout
│   └── vite.config.ts    # React Vite server configuration
│
└── Dockerfile            # Multi-stage image build (node build -> slim python package)
```

---

## 4. Running Locally

### Backend Setup (Python 3.11+):

```bash
cd backend
python -m venv .venv
# Activate:
.venv\Scripts\activate      # Windows PowerShell
source .venv/bin/activate    # Linux/macOS

pip install -r requirements-dev.txt
# Run locally with offline configurations:
USE_GEMINI=false USE_FIRESTORE=false uvicorn app.main:app --reload
```

### Frontend Setup (Node 20+):

```bash
cd frontend
npm install
npm run dev      # Launch Vite development server (proxies /api -> localhost:8000)
```

### Running Container Locally:

```bash
docker build -t ecoloop .
docker run -p 8080:8080 -e USE_GEMINI=false -e USE_FIRESTORE=false ecoloop
# Open http://localhost:8080
```

---

## 5. Testing & Verification

Comprehensive automated test suites cover 100% of both backend and frontend execution paths:

| Domain | Suite Command | Quality Check Details |
| --- | --- | --- |
| **Backend Coverage** | `cd backend && pytest` | **100% statement coverage** over API endpoints, rate limiter, Firestore mocking, and settings. |
| **Static Types** | `cd backend && mypy --strict app` | Strict type checking enforces full type safety across Python modules. |
| **Linter Check** | `cd backend && ruff check .` | Enforces docstrings (`D`), annotations (`ANN`), and code structure rules. |
| **Frontend Coverage** | `cd frontend && npm test` | **100% statement coverage** via Vitest covering hook state and component flows. |
| **Accessibility (a11y)** | Verified in test suites | `vitest-axe` runs automated Axe-core checks on component markup. |
| **Frontend Types** | `cd frontend && npm run typecheck` | Validates TypeScript compilation bounds (`tsc --noEmit`). |

---

## 6. Deploying to Google Cloud Run

To build and deploy the container straight from the source to Google Cloud Run:

```bash
# Configure active GCP project
gcloud config set project virtual-prompt-week-3

# Enable APIs
gcloud services enable \
    run.googleapis.com \
    aiplatform.googleapis.com \
    firestore.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com

# Create Firestore database if not present
gcloud firestore databases create --location=us-central1

# Deploy (uses --clear-base-image to bypass buildpack conflicts)
gcloud run deploy ecoloop \
    --source . \
    --region us-central1 \
    --allow-unauthenticated \
    --clear-base-image \
    --set-env-vars PROJECT_ID=virtual-prompt-week-3,REGION=us-central1,USE_GEMINI=true,USE_FIRESTORE=true

# Grant Cloud Run service account access roles:
# - roles/aiplatform.user (Gemini Model access)
# - roles/datastore.user (Firestore read/write access)
```

---

## 7. Assumptions Made

* **Educational Estimates**: Emission calculations represent public average factors for education rather than certified carbon audits.
* **Solar Deduction**: Users with solar panels receive a `-0.35 kg CO₂e/kWh` offset on their household electricity, simulating net-metering.
* **Shared Energy Share**: Home utility metrics are divided evenly by the household size to obtain a realistic personal emission share.
* **Rate Limits**: The rate limiter permits up to 60 requests per minute per client IP for general API operations to prevent downstream Vertex AI quota starvation.
* **Privacy by Design**: Snapshot logging is strictly anonymous, using a random client-generated device ID cached in the user's browser.

---

## 8. Evaluation Rubric Alignment

| Rubric Axis | Solution Implementation Details |
| --- | --- |
| **Code Quality** | Strict type system (`mypy --strict`), PEP8 linting (`ruff`), modular design pattern separating calculator, repository, and api routes. All calculations are documented with Defra/EPA citations. |
| **Security** | In-memory token-bucket Rate Limiter middleware, strict input validation using Pydantic constraint bounds (`ge=0`), HTTP security hardening headers (HSTS, CSP, X-Frame-Options, X-Content-Type-Options), and run-time non-root container isolation. |
| **Efficiency** | Stateless design, multi-stage cached container size (optimized to reduce cold starts), and compressed production React bundle size (~385 kB gzipped bundle, including Recharts libraries). |
| **Testing Enforcements** | **100% statement and branch test coverage** across both the backend FastAPI test suites (pytest) and frontend UI/hook components test suites (Vitest). |
| **Accessibility (a11y)** | No heading level skipping, fully labelled HTML5 semantic elements, custom keyboard focus handlers, high-contrast themes, skip navigation links, and screen-reader polite live regions (`aria-live="polite"`). |
| **GCP Services Integration** | Deployed on Google Cloud Run with Vertex AI Gemini 2.5-Flash integration via Application Default Credentials, using Google Cloud Firestore in native mode for snapshot logs. |
| **Pillars Compliance** | Integrated questionnaire for carbon profile breakdowns (Understand), anonymous database timeline histories (Track), and Vertex AI sustainability coach recommendations paired with real-time green habit XP achievements offset calculations (Reduce). |

---

## License

Developed for the Virtual PromptWars Challenge 3. All rights reserved.
