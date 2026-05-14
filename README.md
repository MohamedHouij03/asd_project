# 🧠 NeuroScan ASD — ML-Powered Autism Screening Web App

> An end-to-end machine learning project for screening Autism Spectrum Disorder (ASD) indicators in children — featuring a Django web application, 4 research Jupyter notebooks, and a production-ready Random Forest pipeline.

---

## 📁 Project Structure

```
asd_project/
│
├── django_app/              # Django web application
│   ├── manage.py
│   ├── project_name/        # Django config (settings, urls, wsgi)
│   ├── ml_app/              # Main app (views, forms, models, templates)
│   ├── templates/           # Shared base template
│   └── static/              # CSS, JS, images
│
├── ml_models/               # Production ML logic
│   ├── trained_model.pkl    # ← Saved after running train_model.py
│   ├── ml_model.py          # Model loader + predict_asd()
│   └── preprocessing.py     # Shared preprocessing logic
│
├── notebooks/               # Research Jupyter notebooks
│   ├── 01_eda.ipynb         # Exploratory Data Analysis
│   ├── 02_preprocessing.ipynb
│   ├── 03_modeling.ipynb    # Train 5 classifiers
│   └── 04_evaluation.ipynb  # Evaluation + model selection
│
├── data/
│   └── data_csv.csv         # ← Download from Kaggle (see below)
│
├── scripts/
│   └── train_model.py       # Standalone training script
│
├── requirements.txt
└── README.md
```

---

## ⚡ Quick Start

### 1. Clone & Create Virtual Environment

```bash
git clone <repo-url>
cd asd_project
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Download the Dataset

Download `data_csv.csv` from Kaggle:
```
https://www.kaggle.com/datasets/uppulurimadhuri/dataset?select=data_csv.csv
```
Place it at:
```
asd_project/data/data_csv.csv
```

### 3. Train the Model

```bash
# From project root
python scripts/train_model.py
```

This will:
- Load and clean the dataset
- Train 5 classifiers with cross-validation
- Select the best model (Random Forest, ~97% accuracy)
- Save the pipeline to `ml_models/trained_model.pkl`

### 4. Set Up Django

```bash
cd django_app
python manage.py migrate
python manage.py runserver
```

Open your browser at: **http://127.0.0.1:8000/**

---

## 📓 Running Jupyter Notebooks

```bash
# From project root
jupyter notebook notebooks/
```

Open notebooks in order:
1. `01_eda.ipynb` — Explore the dataset
2. `02_preprocessing.ipynb` — Clean and encode features
3. `03_modeling.ipynb` — Train all 5 models
4. `04_evaluation.ipynb` — Compare and select the best model

---

## 🌐 Web Application Pages

| Page | URL | Description |
|---|---|---|
| Home | `/` | Landing page with project overview |
| Dashboard | `/dashboard/` | Charts, heatmaps, model comparison |
| Prediction | `/predict/` | Interactive ASD screening form |
| About | `/about/` | Project and dataset documentation |
| History | `/history/` | Past prediction log |

---

## 🤖 ML Pipeline

| Stage | Details |
|---|---|
| Algorithm | Random Forest (200 trees) |
| Preprocessing | StandardScaler + OHE (via sklearn Pipeline) |
| Features | 20+ clinical and behavioral features |
| Training data | University of Arkansas ASD dataset |
| Accuracy | ~97% on test set |
| Serialization | joblib (.pkl) |

---

## 🧪 Tech Stack

- **Backend:** Django 4.2, Python 3.10+
- **ML:** scikit-learn, Pandas, NumPy
- **Visualisation:** Matplotlib, Seaborn
- **Frontend:** Bootstrap 5, custom CSS
- **Notebooks:** Jupyter, ipykernel
- **Serialization:** joblib

---

## ⚠️ Disclaimer

This tool is for **research and educational purposes only**.  
It is **not** a clinical diagnostic tool and should not replace professional medical evaluation.  
Always consult a qualified healthcare provider for diagnosis.

---

## 📄 Dataset Citation

University of Arkansas Computer Science Department  
Autism Research Dataset — collected via AUTISM RESEARCH initiative.  
Available on Kaggle: https://www.kaggle.com/datasets/uppulurimadhuri/dataset
