#!/usr/bin/env python3
"""
scripts/train_model.py  —  ASD Prediction Model Training
─────────────────────────────────────────────────────────
Run from project root:   python scripts/train_model.py

Root-cause analysis of leakage in this dataset
───────────────────────────────────────────────
1. CASE_NO_PATIENT'S   → sequential row ID, pure memorisation
2. Who_completed_test  → admin field encoding referral pathway
3. Ethnicity           → inconsistent capitalisation in the raw CSV
                         creates phantom categories with wildly different
                         ASD rates (e.g. 'asian' 14% vs 'Asian' 80%)
                         giving the model a trivial cheat code.
                         FIX: drop the column entirely — ethnicity is not
                         a valid clinical ASD predictor anyway.
"""

import os, sys, warnings
warnings.filterwarnings("ignore")

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, PROJECT_ROOT)

import numpy as np
import pandas as pd
import joblib
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.model_selection import (train_test_split,
                                     StratifiedKFold, cross_val_score)
from sklearn.metrics import (accuracy_score, f1_score,
                              precision_score, recall_score,
                              classification_report, confusion_matrix)
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer

# ── Paths ─────────────────────────────────────────────────────────────────────
DATA_PATH  = os.path.join(PROJECT_ROOT, "data", "data_csv.csv")
MODEL_PATH = os.path.join(PROJECT_ROOT, "ml_models", "trained_model.pkl")
RANDOM_STATE = 42
TEST_SIZE    = 0.20

# ── Columns to drop (leakage / non-clinical) ──────────────────────────────────
DROP_COLS = [
    "CASE_NO_PATIENT'S",      # row ID → memorisation
    "Who_completed_the_test", # admin metadata → encodes referral pathway
    "Ethnicity",              # inconsistent capitalisation creates phantom
                              # categories; not a valid clinical ASD predictor
]

TARGET_COL = "ASD_traits"

# ── Feature definitions (exact CSV column names after stripping) ──────────────
AQ_COLS = [
    "A1", "A2", "A3", "A4", "A5",
    "A6", "A7", "A8", "A9", "A10_Autism_Spectrum_Quotient",
]

NUMERIC_COLS = AQ_COLS + [
    "Social_Responsiveness_Scale",
    "Age_Years",
    "Qchat_10_Score",
    "Childhood Autism Rating Scale",
]

BINARY_COLS = [
    "Sex",
    "Jaundice",
    "Family_mem_with_ASD",
    "Speech Delay/Language Disorder",
    "Learning disorder",
    "Genetic_Disorders",
    "Depression",
    "Global developmental delay/intellectual disability",
    "Social/Behavioural Issues",
    "Anxiety_disorder",
]

# ── Encoders ──────────────────────────────────────────────────────────────────
YN_MAP  = {"yes": 1, "no": 0, "Yes": 1, "No": 0,
           "YES": 1, "NO": 0, "1": 1, "0": 0}
SEX_MAP = {"m": 1, "M": 1, "male": 1, "Male": 1,
           "f": 0, "F": 0, "female": 0, "Female": 0}


# ─────────────────────────────────────────────────────────────────────────────
def load_and_clean(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.columns = [c.strip() for c in df.columns]

    print(f"  Loaded   : {df.shape[0]:,} rows × {df.shape[1]} columns")

    # Drop leakage columns
    drop = [c for c in DROP_COLS if c in df.columns]
    df.drop(columns=drop, inplace=True)
    print(f"  Dropped  : {drop}")

    # Encode target
    df[TARGET_COL] = (df[TARGET_COL].astype(str).str.strip().str.upper()
                      .map({"YES": 1, "NO": 0}).fillna(0).astype(int))

    # Encode binary columns
    for col in BINARY_COLS:
        if col not in df.columns:
            continue
        mapping = SEX_MAP if col == "Sex" else YN_MAP
        df[col] = df[col].astype(str).str.strip().map(mapping).fillna(0).astype(int)

    # Ensure numeric columns are numeric
    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df


def build_preprocessor(num_cols, bin_cols):
    """ColumnTransformer: scale numerics, impute binaries."""
    steps = []
    if num_cols:
        steps.append(("num", Pipeline([
            ("imp", SimpleImputer(strategy="median")),
            ("sc",  StandardScaler()),
        ]), num_cols))
    if bin_cols:
        steps.append(("bin", Pipeline([
            ("imp", SimpleImputer(strategy="most_frequent")),
        ]), bin_cols))
    return ColumnTransformer(steps, remainder="drop")


def main():
    print(f"\n{'─'*62}")
    print("  NeuroScan ASD — Model Training")
    print(f"{'─'*62}")

    df = load_and_clean(DATA_PATH)

    # Resolve which columns actually exist in this CSV
    num_cols = [c for c in NUMERIC_COLS if c in df.columns]
    bin_cols = [c for c in BINARY_COLS  if c in df.columns]
    feat_cols = num_cols + bin_cols

    missing = [c for c in NUMERIC_COLS + BINARY_COLS if c not in df.columns]
    if missing:
        print(f"  ⚠  Not in CSV (skipped) : {missing}")

    print(f"  Features : {len(feat_cols)}")
    print(f"    Numeric : {num_cols}")
    print(f"    Binary  : {bin_cols}")

    X = df[feat_cols]
    y = df[TARGET_COL]

    print(f"  Samples  : {len(X):,}")
    print(f"  Classes  : No ASD={int((y==0).sum())}  ASD={int((y==1).sum())}")

    # ── Split ────────────────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    print(f"  Split    : {len(X_train):,} train / {len(X_test):,} test")

    preprocessor = build_preprocessor(num_cols, bin_cols)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=RANDOM_STATE)

    # ── Candidates ───────────────────────────────────────────────────────
    candidates = {
        "Logistic Regression": LogisticRegression(
            max_iter=2000, C=0.5,
            class_weight="balanced", random_state=RANDOM_STATE),
        "Decision Tree": DecisionTreeClassifier(
            max_depth=8, min_samples_leaf=15,
            class_weight="balanced", random_state=RANDOM_STATE),
        "Random Forest": RandomForestClassifier(
            n_estimators=300, max_depth=None, min_samples_leaf=1,
            class_weight="balanced", random_state=RANDOM_STATE, n_jobs=-1),
        "KNN": KNeighborsClassifier(n_neighbors=9),
        "SVM": SVC(kernel="rbf", C=1.0,
                   class_weight="balanced", probability=True,
                   random_state=RANDOM_STATE),
    }

    print(f"\n{'─'*72}")
    print(f"  {'Model':<28} {'Acc':>7} {'Prec':>7} {'Rec':>7} "
          f"{'F1':>7}  {'CV-F1':>14}")
    print(f"{'─'*72}")

    results   = {}
    pipelines = {}

    for name, clf in candidates.items():
        pipe = Pipeline([("pre", preprocessor), ("clf", clf)])
        pipe.fit(X_train, y_train)
        pred = pipe.predict(X_test)

        acc  = accuracy_score(y_test, pred)
        prec = precision_score(y_test, pred, zero_division=0)
        rec  = recall_score(y_test, pred, zero_division=0)
        f1   = f1_score(y_test, pred, zero_division=0)
        cvs  = cross_val_score(pipe, X_train, y_train,
                               cv=cv, scoring="f1", n_jobs=-1)

        results[name]   = dict(acc=acc, prec=prec, rec=rec, f1=f1,
                               cv=cvs.mean(), cv_std=cvs.std())
        pipelines[name] = pipe

        flag = "  ⚠ SUSPICIOUS" if cvs.mean() > 0.99 else ""
        print(f"  {name:<28} {acc:>7.4f} {prec:>7.4f} {rec:>7.4f} "
              f"{f1:>7.4f}  {cvs.mean():.4f}±{cvs.std():.4f}{flag}")

    print(f"{'─'*72}")

    # ── Select by cross-validated F1 ─────────────────────────────────────
    best_name = max(results, key=lambda n: results[n]["cv"])
    best_res  = results[best_name]
    best_pipe = pipelines[best_name]

    print(f"\n  ★  Best (CV F1) : {best_name}")
    print(f"     Test Acc     : {best_res['acc']:.4f}")
    print(f"     Test F1      : {best_res['f1']:.4f}")
    print(f"     CV F1        : {best_res['cv']:.4f} ± {best_res['cv_std']:.4f}")

    y_pred_best = best_pipe.predict(X_test)
    print(f"\n  Classification Report — {best_name}:")
    print(classification_report(y_test, y_pred_best,
                                target_names=["No ASD", "ASD"]))

    cm = confusion_matrix(y_test, y_pred_best)
    print(f"  Confusion Matrix:")
    print(f"                Pred No   Pred Yes")
    print(f"  Actual No   {cm[0,0]:8d}  {cm[0,1]:8d}")
    print(f"  Actual Yes  {cm[1,0]:8d}  {cm[1,1]:8d}")

    # ── Save ─────────────────────────────────────────────────────────────
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    joblib.dump(best_pipe, MODEL_PATH)
    print(f"\n  ✅  Production model → {MODEL_PATH}")

    for name, pipe in pipelines.items():
        p = os.path.join(PROJECT_ROOT, "ml_models",
                         name.lower().replace(" ", "_") + ".pkl")
        joblib.dump(pipe, p)
    print(f"  ✅  All 5 models saved to ml_models/")

    _save_charts(results)

    print(f"\n{'─'*62}")
    print("  Done! Start the web app:")
    print("    cd django_app && python manage.py runserver")
    print(f"{'─'*62}\n")


def _save_charts(results):
    names  = list(results.keys())
    colors = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#ec4899"]
    x      = np.arange(len(names))

    fig, axes = plt.subplots(1, 3, figsize=(16, 4), facecolor="#0f172a")
    for ax in axes:
        ax.set_facecolor("#1e293b")
        for sp in ax.spines.values():
            sp.set_edgecolor("#334155")
        ax.tick_params(colors="#94a3b8")

    specs = [
        ("acc",    "Test Accuracy",   "Accuracy (%)"),
        ("f1",     "Test F1-Score",   "F1-Score (%)"),
        ("cv",     "5-Fold CV F1",    "CV F1 (%)"),
    ]

    for ax, (key, title, ylabel) in zip(axes, specs):
        vals = [results[n][key] * 100 for n in names]
        errs = ([results[n]["cv_std"] * 100 for n in names]
                if key == "cv" else None)
        bars = ax.bar(x, vals, color=colors, edgecolor="#0f172a", width=0.55)
        if errs:
            ax.errorbar(x, vals, yerr=errs, fmt="none",
                        color="white", capsize=5, capthick=1.5)
        for i, v in enumerate(vals):
            offset = (errs[i] if errs else 0) + 0.5
            ax.text(i, v + offset, f"{v:.1f}%",
                    ha="center", color="white", fontsize=8)
        ax.set_xticks(x)
        ax.set_xticklabels(names, rotation=15, ha="right", fontsize=8)
        ax.set_ylim(50, 107)
        ax.set_ylabel(ylabel, color="#94a3b8")
        ax.set_title(title, color="white")
        ax.axhline(100, color="#ef4444", linewidth=0.8,
                   linestyle="--", alpha=0.4, label="100% ceiling")

    plt.tight_layout()
    path = os.path.join(PROJECT_ROOT, "ml_models", "model_comparison.png")
    fig.savefig(path, dpi=120, bbox_inches="tight")
    plt.close()
    print(f"  ✅  Chart → {path}")


if __name__ == "__main__":
    main()
