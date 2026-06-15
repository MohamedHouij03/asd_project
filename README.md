<div align="center">

<img src="https://img.shields.io/badge/Mindello-ASD%20Screening%20Platform-2563EB?style=for-the-badge&logoColor=white" alt="Mindello"/>

<br/>
<br/>

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2-092E20?style=flat-square&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.4-F7931E?style=flat-square&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=flat-square)]()

<br/>

**Mindello** is a full-stack clinical decision-support platform for early Autism Spectrum Disorder (ASD) screening in children. It combines a validated Random Forest classifier (97% accuracy) with SHAP explainability, a multi-step clinical intake form, and a secure, responsive React frontend — giving parents and healthcare professionals a clear, data-driven first step toward evaluation.

<br/>

[Features](#features) · [Tech Stack](#tech-stack) · [Project Structure](#project-structure) · [Quick Start](#quick-start) · [API Reference](#api-reference) · [ML Model](#ml-model) · [Deployment](#deployment) · [Author](#author)

</div>

---

## Demo Video


<div align="center">

<!-- Option A: YouTube embed (replace VIDEO_ID) -->
[![Demo Video](https://img.youtube.com/vi/S5mU2ffHBGM/maxresdefault.jpg)](https://www.youtube.com/watch?v=S5mU2ffHBGM) 



</div>

---

## Features

| Feature | Description |
|---|---|
| **Multi-step screening form** | 4-step clinical intake: demographics, medical history, AQ-10 questionnaire, and CARS / SRS clinical scores |
| **97% accurate ML model** | Random Forest classifier trained on validated ASD screening data |
| **SHAP explainability** | Per-prediction feature attributions shown as a contribution chart — clinicians can see *why* |
| **Confidence scoring** | Model outputs calibrated probability alongside binary prediction |
| **JWT authentication** | Secure Bearer-token auth with 60-min access tokens and 30-day rotating refresh tokens |
| **Role-based access** | Parent / Guardian and Medical Professional roles with scoped permissions |
| **Screening history** | Full audit trail with search, filter, pagination, and delete |
| **Saved screenings** | Bookmark individual records to revisit or share with specialists |
| **Dashboard analytics** | Monthly bar chart, summary stats, and recent screening table |
| **Notifications** | In-app notification system per assessment event |
| **Fully responsive** | Mobile-first layout with separate sidebar (app) and top-nav (public) shells |
| **Medical disclaimer** | Prominent, contextual disclaimers throughout — this is a decision-support tool, not a diagnosis |

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| React Router | 6.28 | Client-side routing (nested layout routes) |
| Recharts | 2.13 | Dashboard bar charts |
| Axios | 1.7 | HTTP client with JWT interceptor |
| Vite | 5.4 | Build tool and dev server |
| Pure CSS Variables | — | Design system (no Tailwind) |

### Backend

| Technology | Version | Purpose |
|---|---|---|
| Django | 4.2 | Web framework |
| Django REST Framework | 3.x | REST API layer |
| SimpleJWT | latest | JWT issuance, refresh, and blacklisting |
| django-cors-headers | latest | CORS for React dev server |
| django-filter | latest | QuerySet filtering for list endpoints |
| WhiteNoise | 6.6 | Static file serving in production |

### Machine Learning

| Technology | Version | Purpose |
|---|---|---|
| scikit-learn | 1.4 | Random Forest classifier + ColumnTransformer pipeline |
| SHAP | 0.46 | TreeExplainer — local feature attributions |
| LIME | 0.2 | Supplementary local explanations |
| pandas | 2.1 | Data preprocessing |
| numpy | 1.26 | Numerical operations |
| joblib | 1.3 | Model serialization |

---

## Project Structure

```
asd_project/
│
├── django_app/                     # Django backend
│   ├── mindello/                   # Project configuration
│   │   ├── settings.py             # App settings, JWT config, CORS, REST_FRAMEWORK
│   │   ├── urls.py                 # Root URL conf (mounts /api/v1/ and ml_app)
│   │   └── wsgi.py
│   │
│   ├── core/                       # DRF REST API (v1)
│   │   ├── models.py               # ExtendedProfile, Assessment, AssessmentResult, Notification, Article, FAQ
│   │   ├── serializers.py          # CustomTokenSerializer, RegisterSerializer, AssessmentSerializers
│   │   ├── views.py                # LoginView, RegisterView, AssessmentViewSet, ProfileView, etc.
│   │   ├── urls.py                 # /api/v1/* routes
│   │   ├── ml_utils.py             # Bridges DRF → ml_app prediction logic
│   │   └── signals.py              # Auto-create ExtendedProfile on User creation
│   │
│   ├── ml_app/                     # Legacy Django session views + ML glue
│   │   ├── views.py                # predict_api() — core ML inference entry point
│   │   ├── forms.py                # ScreeningForm validation
│   │   ├── rbac.py                 # Role-based access decorators
│   │   └── templates/ml_app/       # Django HTML templates (legacy UI)
│   │
│   ├── templates/                  # Base HTML templates
│   ├── static/                     # CSS/JS for Django templates
│   └── db.sqlite3                  # SQLite database (development)
│
├── frontend/                       # React SPA (Vite)
│   ├── index.html
│   ├── vite.config.js              # Dev proxy: /api/* → localhost:8000
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                 # BrowserRouter, nested layout routes
│       ├── index.css               # Design system (CSS variables, utility classes)
│       │
│       ├── api/                    # API modules
│       │   ├── client.js           # Axios instance + JWT interceptor (auto-refresh on 401)
│       │   ├── auth.js             # login, register, logout, changePassword
│       │   ├── users.js            # getProfile, updateProfile, getStats
│       │   └── index.js            # assessments, notifications, saved, contact
│       │
│       ├── context/
│       │   └── AuthContext.jsx     # Global auth state, token storage, refreshUser
│       │
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.jsx      # Public top navigation (React Router Links)
│       │   │   ├── Footer.jsx      # Public footer
│       │   │   └── DashboardLayout.jsx  # App sidebar + top bar (Outlet-based)
│       │   └── ui/
│       │       └── Guards.jsx      # ProtectedRoute, GuestRoute, PageLoader, ErrorBoundary
│       │
│       └── pages/
│           ├── public/             # Home, About, Signs, Resources, FAQ, Contact, Privacy, Terms
│           ├── auth/               # Login, Register
│           └── app/                # Dashboard, Predict (screening form + result), History,
│                                   # Saved, Notifications, Profile, Settings, Help
│
├── ml_models/                      # ML artifacts
│   ├── trained_model.pkl           # Serialized Random Forest pipeline
│   ├── ml_model.py                 # Training and evaluation script
│   ├── preprocessing.py            # ColumnTransformer feature pipeline
│   └── xai_explainer.py           # SHAP TreeExplainer wrapper
│
├── data/
│   └── data_csv.csv                # Training dataset (University of Arkansas / Kaggle)
│
├── scripts/
│   └── train_model.py              # Retrain model from scratch
│
├── requirements.txt                # Python dependencies
└── README.md
```

---

## Quick Start

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher
- pip

---

### 1. Clone the repository

```bash
git clone https://github.com/MohamedHouij03/asd_project.git
cd asd_project
```

---

### 2. Backend setup

```bash
cd django_app

# Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# Install dependencies
pip install -r ../requirements.txt
pip install djangorestframework djangorestframework-simplejwt \
            django-cors-headers django-filter psycopg2-binary

# Apply database migrations
python manage.py migrate

# Create an admin account
python manage.py createsuperuser

# Start the development server on port 8000
python manage.py runserver
```

Backend available at: `http://localhost:8000`  
API base URL: `http://localhost:8000/api/v1/`  
Admin panel: `http://localhost:8000/admin/`

---

### 3. Frontend setup

Open a second terminal from the project root:

```bash
cd frontend

# Install Node dependencies
npm install

# Start the Vite development server on port 5173
npm run dev
```

React app available at: `http://localhost:5173`  
All `/api/*` requests are automatically proxied to the Django backend.

---

### 4. First run

1. Navigate to `http://localhost:5173`
2. Click **Get Started** to create a free account
3. Select your role (Parent/Guardian or Medical Professional)
4. Go to **New Screening** and complete the 4-step form
5. View your result, confidence score, and SHAP explanation

---

## API Reference

**Base URL:** `/api/v1/`  
**Authentication:** All protected endpoints require `Authorization: Bearer <access_token>`

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register/` | Public | Create account, returns tokens immediately |
| `POST` | `/auth/login/` | Public | Login with username + password, returns tokens |
| `POST` | `/auth/logout/` | Required | Blacklists the refresh token |
| `POST` | `/auth/token/refresh/` | Public | Exchange refresh token for new access token |
| `POST` | `/auth/change-password/` | Required | Update account password |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/users/profile/` | Required | Retrieve full user profile |
| `PATCH` | `/users/profile/` | Required | Update profile fields |
| `POST` | `/users/avatar/` | Required | Upload profile avatar |
| `GET` | `/users/stats/` | Required | Dashboard statistics (totals, monthly breakdown) |

### Assessments

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/assessments/run/` | Required | Submit screening form, returns ML prediction + SHAP |
| `GET` | `/assessments/` | Required | Paginated list of user's screening history |
| `GET` | `/assessments/{id}/` | Required | Full detail for a single assessment |
| `DELETE` | `/assessments/{id}/` | Required | Delete an assessment |
| `POST` | `/assessments/{id}/save/` | Required | Bookmark an assessment |

### Other

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/notifications/` | Required | List user notifications |
| `PATCH` | `/notifications/{id}/` | Required | Mark notification as read |
| `POST` | `/notifications/mark-all-read/` | Required | Mark all notifications read |
| `GET` | `/saved/` | Required | List bookmarked assessments |
| `DELETE` | `/saved/{id}/` | Required | Remove a bookmark |
| `GET` | `/articles/` | Public | List educational articles |
| `GET` | `/faqs/` | Public | List FAQ entries |
| `POST` | `/contact/` | Public | Submit a contact message |

### Token lifecycle

```
Login → { access (60 min), refresh (30 days) }
        ↓
Every request → Authorization: Bearer <access>
        ↓ (on 401)
POST /auth/token/refresh/ → new access token (auto-handled by Axios interceptor)
        ↓ (on logout or refresh expiry)
Redirect to /login
```

---

## ML Model

### Dataset

Training data sourced from the **University of Arkansas ASD Screening Dataset** (available on Kaggle). The dataset contains 1,054 records with 24 clinical and behavioral features derived from the AQ-10, Q-CHAT-10, and CARS screening tools.

### Model comparison

| Model | Accuracy | Notes |
|---|---|---|
| Logistic Regression | 88% | Baseline |
| K-Nearest Neighbors | 90% | Sensitive to scaling |
| Decision Tree | 91% | Prone to overfitting |
| Support Vector Machine | 92% | Good generalization |
| **Random Forest** | **97%** | Selected — best accuracy and stability |

### Feature pipeline

```
Raw form input (24 fields)
        ↓
ColumnTransformer
  ├── Numerical: StandardScaler (age, CARS score, SRS score, AQ scores)
  └── Categorical: OneHotEncoder (sex, ethnicity, jaundice, family history)
        ↓
RandomForestClassifier (n_estimators=100, max_depth=None)
        ↓
Prediction: YES / NO  +  Confidence %  +  SHAP values
```

### Top predictive features

| Rank | Feature | Contribution |
|---|---|---|
| 1 | CARS Score (childhood_autism_rating_scale) | 22% |
| 2 | Q-CHAT-10 Score (qchat_10_score) | 18% |
| 3 | AQ Item A10 — facial expression reading | 12% |
| 4 | AQ Item A7 — fiction reading interest | 10% |
| 5 | AQ Item A8 — imagining characters | 9% |

### Explainability

Every prediction runs through a **SHAP TreeExplainer** which produces local feature attributions — showing exactly how much each input pushed the prediction toward or away from a positive result. This is displayed as a contribution bar chart on the results page, giving clinicians and parents a transparent view of the model's reasoning.

---

## Deployment

### Build for production

```bash
# 1. Build the React frontend
cd frontend
npm run build
# Output: frontend/dist/

# 2. Collect Django static files
cd ../django_app
python manage.py collectstatic --noinput
```

### Environment variables

Create a `.env` file in `django_app/` before deploying:

```env
SECRET_KEY=your-long-random-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@host:5432/dbname
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your@email.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@yourdomain.com
```

### Recommended hosting

| Concern | Recommendation |
|---|---|
| Frontend | Vercel or Netlify (auto-deploy from `frontend/dist/`) |
| Backend | Railway, Render, or a VPS with Gunicorn |
| Database | PostgreSQL via Railway, Supabase, or Neon |
| Static files | WhiteNoise (already configured) or AWS S3 |
| Process manager | Gunicorn + Nginx (VPS) |
| SSL | Let's Encrypt via Certbot |

### Gunicorn command (VPS)

```bash
gunicorn mindello.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --timeout 120
```

---

## Medical Disclaimer

> Mindello is a **decision-support tool only** and is not a medical diagnostic service. Screening results are for informational purposes and should be used to inform conversations with qualified healthcare professionals. They are not a substitute for formal clinical evaluation. A positive result does not mean a child has ASD. A negative result does not rule it out. Always consult a licensed clinician for diagnosis.

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## Author

**Mohamed Houij**

[![GitHub](https://img.shields.io/badge/GitHub-MohamedHouij03-181717?style=flat-square&logo=github)](https://github.com/MohamedHouij03)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Mohamed%20Houij-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/mohamed-houij-b11a0a161/)
[![Email](https://img.shields.io/badge/Email-mohamed.houij700%40gmail.com-EA4335?style=flat-square&logo=gmail)](mailto:mohamed.houij700@gmail.com)

---

<div align="center">

Made with care for families and clinicians seeking clarity.

</div>
