import os
import sys
import json
import base64
import io
import logging

import numpy as np
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.conf import settings
from django.db.models import Q

from .forms import PredictionForm, SignUpForm, LoginForm
from .models import PredictionRecord, UserProfile

logger = logging.getLogger(__name__)

# Add ML models directory to sys.path
ML_MODELS_DIR = str(settings.ML_MODELS_DIR)
if ML_MODELS_DIR not in sys.path:
    sys.path.insert(0, ML_MODELS_DIR)

# ─── Lazy-load the ML pipeline ────────────────────────────────────────────────
_pipeline = None

def get_pipeline():
    """Load ML pipeline once and cache it (singleton pattern)."""
    global _pipeline
    if _pipeline is None:
        try:
            import joblib
            model_path = os.path.join(ML_MODELS_DIR, 'trained_model.pkl')
            _pipeline = joblib.load(model_path)
            logger.info("ML pipeline loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load ML model: {e}")
            _pipeline = None
    return _pipeline


def _fig_to_base64(fig):
    """Convert matplotlib figure to base64 string for embedding in HTML."""
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=120, facecolor='#0f172a')
    buf.seek(0)
    img_bytes = buf.read()
    buf.close()
    plt.close(fig)
    return base64.b64encode(img_bytes).decode('utf-8')


# ─── AUTHENTICATION VIEWS ─────────────────────────────────────────────────────

def signup_view(request):
    """User registration with role selection."""
    if request.user.is_authenticated:
        return redirect('ml_app:dashboard')
    
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('ml_app:dashboard')
    else:
        form = SignUpForm()
    
    return render(request, 'auth/signup.html', {'form': form})


def login_view(request):
    """User login."""
    if request.user.is_authenticated:
        return redirect('ml_app:dashboard')
    
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            password = form.cleaned_data['password']
            # Allow login by email or username
            try:
                user = User.objects.get(email=username)
                username = user.username
            except User.DoesNotExist:
                pass
            user = authenticate(request, username=username, password=password)
            if user is not None:
                login(request, user)
                return redirect('ml_app:dashboard')
            else:
                form.add_error(None, 'Invalid username or password.')
    else:
        form = LoginForm()
    
    return render(request, 'auth/login.html', {'form': form})


def logout_view(request):
    """User logout."""
    logout(request)
    return redirect('auth:home')


# ─── Chart generators ─────────────────────────────────────────────────────────


def _get_dataset_stats():
    data_path = settings.DATA_PATH

    print("DATA PATH:", data_path)

    try:
        df = pd.read_csv(data_path)
        return df
    except Exception as e:
        print("Dataset error:", e)
        return None


def _chart_asd_distribution(df):
    """Pie chart: ASD class distribution."""
    fig, ax = plt.subplots(figsize=(5, 4), facecolor='#0f172a')
    ax.set_facecolor('#0f172a')
    counts = df['ASD_traits'].value_counts()
    colors = ['#10b981', '#ef4444']
    wedges, texts, autotexts = ax.pie(
        counts.values,
        labels=['No ASD', 'ASD'],
        colors=colors,
        autopct='%1.1f%%',
        startangle=90,
        wedgeprops={'edgecolor': '#1e293b', 'linewidth': 2}
    )
    for text in texts + autotexts:
        text.set_color('white')
        text.set_fontsize(11)
    ax.set_title('ASD Class Distribution', color='white', fontsize=13, pad=15)
    return _fig_to_base64(fig)


def _chart_age_distribution(df):
    """Histogram: Age distribution."""
    fig, ax = plt.subplots(figsize=(6, 4), facecolor='#0f172a')
    ax.set_facecolor('#1e293b')
    ax.hist(df['Age_Years'].dropna() / 12, bins=20, color='#6366f1', edgecolor='#0f172a', alpha=0.85)
    ax.set_xlabel('Age (years)', color='#94a3b8')
    ax.set_ylabel('Count', color='#94a3b8')
    ax.set_title('Age Distribution of Children', color='white', fontsize=13)
    ax.tick_params(colors='#94a3b8')
    for spine in ax.spines.values():
        spine.set_edgecolor('#334155')
    fig.tight_layout()
    return _fig_to_base64(fig)


def _chart_gender_asd(df):
    """Bar chart: ASD by gender."""
    fig, ax = plt.subplots(figsize=(5, 4), facecolor='#0f172a')
    ax.set_facecolor('#1e293b')
    sex_map = {'m': 'Male', 'f': 'Female'}
    df2 = df.copy()
    df2['Sex'] = df2['Sex'].map(sex_map).fillna(df2['Sex'])
    data = df2.groupby(['Sex', 'ASD_traits']).size().unstack(fill_value=0)
    bar_colors = ['#10b981', '#ef4444']
    data.plot(kind='bar', ax=ax, color=bar_colors, edgecolor='#0f172a', width=0.6)
    ax.set_xlabel('', color='#94a3b8')
    ax.set_ylabel('Count', color='#94a3b8')
    ax.set_title('ASD Cases by Gender', color='white', fontsize=13)
    ax.tick_params(colors='#94a3b8', rotation=0)
    ax.legend(['No ASD', 'ASD'], labelcolor='white', facecolor='#1e293b', edgecolor='#334155')
    for spine in ax.spines.values():
        spine.set_edgecolor('#334155')
    fig.tight_layout()
    return _fig_to_base64(fig)


def _chart_correlation_heatmap(df):
    """Heatmap: Correlation matrix of numeric features."""
    numeric_cols = [c for c in df.columns if df[c].dtype in [np.int64, np.float64]][:12]
    fig, ax = plt.subplots(figsize=(9, 7), facecolor='#0f172a')
    ax.set_facecolor('#0f172a')
    corr = df[numeric_cols].corr()
    mask = np.triu(np.ones_like(corr, dtype=bool))
    sns.heatmap(
        corr, mask=mask, ax=ax,
        cmap='RdYlGn', center=0,
        annot=True, fmt='.2f', annot_kws={'size': 8, 'color': 'white'},
        linewidths=0.5, linecolor='#0f172a',
        cbar_kws={'shrink': 0.8}
    )
    ax.set_title('Feature Correlation Heatmap', color='white', fontsize=13, pad=10)
    ax.tick_params(colors='#94a3b8', labelsize=8)
    plt.setp(ax.get_xticklabels(), rotation=45, ha='right')
    fig.tight_layout()
    return _fig_to_base64(fig)


def _chart_model_comparison():
    """Bar chart: Model accuracy comparison (static data from training)."""
    models = ['Logistic\nRegression', 'Decision\nTree', 'Random\nForest', 'KNN', 'SVM']
    accuracies = [0.88, 0.91, 0.97, 0.90, 0.92]
    colors = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899']

    fig, ax = plt.subplots(figsize=(7, 4), facecolor='#0f172a')
    ax.set_facecolor('#1e293b')
    bars = ax.bar(models, [a * 100 for a in accuracies], color=colors, edgecolor='#0f172a', width=0.55)
    for bar, acc in zip(bars, accuracies):
        ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.5,
                f'{acc*100:.1f}%', ha='center', va='bottom', color='white', fontsize=10)
    ax.set_ylim(80, 100)
    ax.set_ylabel('Accuracy (%)', color='#94a3b8')
    ax.set_title('Model Accuracy Comparison', color='white', fontsize=13)
    ax.tick_params(colors='#94a3b8')
    for spine in ax.spines.values():
        spine.set_edgecolor('#334155')
    fig.tight_layout()
    return _fig_to_base64(fig)


def _chart_feature_importance():
    """Horizontal bar chart of top features."""
    features = [
        'CARS Score', 'Q-CHAT Score', 'A10 Score', 'A7 Score',
        'A8 Score', 'Social Issues', 'Speech Delay', 'A3 Score',
        'Family ASD', 'Age'
    ]
    importances = [0.22, 0.18, 0.12, 0.10, 0.09, 0.07, 0.06, 0.05, 0.04, 0.03]

    fig, ax = plt.subplots(figsize=(7, 5), facecolor='#0f172a')
    ax.set_facecolor('#1e293b')
    colors = plt.cm.RdYlGn(np.linspace(0.3, 0.9, len(features)))
    bars = ax.barh(features[::-1], importances[::-1], color=colors[::-1], edgecolor='#0f172a')
    for bar, val in zip(bars, importances[::-1]):
        ax.text(bar.get_width() + 0.003, bar.get_y() + bar.get_height() / 2,
                f'{val:.2f}', va='center', color='white', fontsize=9)
    ax.set_xlabel('Importance Score', color='#94a3b8')
    ax.set_title('Top Feature Importances (Random Forest)', color='white', fontsize=12)
    ax.tick_params(colors='#94a3b8', labelsize=9)
    for spine in ax.spines.values():
        spine.set_edgecolor('#334155')
    fig.tight_layout()
    return _fig_to_base64(fig)


# ─── Views ────────────────────────────────────────────────────────────────────

def home(request):
    """Landing page with project overview."""
    df = _get_dataset_stats()
    stats = {}
    if df is not None:
        stats = {
            'total_records': len(df),
            'asd_cases': int((df['ASD_traits'] == 'YES').sum()) if 'ASD_traits' in df.columns else 0,
            'features': len(df.columns),
            'age_range': f"0–{int(df['Age_Years'].max()) if 'Age_Years' in df.columns else 18} yrs",
        }
    return render(request, 'ml_app/home.html', {'stats': stats})


def about(request):
    """About page explaining the ML project."""
    return render(request, 'ml_app/about.html')


def dashboard(request):
    """Dashboard with data visualizations."""
    if not request.user.is_authenticated:
        return redirect('auth:login')
    
    df = _get_dataset_stats()
    charts = {}
    table_data = []
    stats = {}

    if df is not None:
        try:
            charts['asd_dist'] = _chart_asd_distribution(df)
            charts['age_dist'] = _chart_age_distribution(df)
            charts['gender_asd'] = _chart_gender_asd(df)
            charts['heatmap'] = _chart_correlation_heatmap(df)
            charts['model_comparison'] = _chart_model_comparison()
            charts['feature_importance'] = _chart_feature_importance()

            stats = {
                'total': len(df),
                'asd_yes': int((df['ASD_traits'] == 'YES').sum()) if 'ASD_traits' in df.columns else 'N/A',
                'asd_no': int((df['ASD_traits'] == 'NO').sum()) if 'ASD_traits' in df.columns else 'N/A',
                'features': len(df.columns) - 1,
            }

            # Recent 10 rows for the table
            display_cols = ['Age_Years', 'Sex', 'Qchat-10-Score', 'ASD_traits']
            display_cols = [c for c in display_cols if c in df.columns]
            table_data = df[display_cols].head(10).to_dict('records')

        except Exception as e:
            logger.error(f"Dashboard chart error: {e}")

    return render(request, 'ml_app/dashboard.html', {
        'charts': charts,
        'stats': stats,
        'table_data': table_data,
    })


def predict(request):
    """Prediction page with interactive form."""
    if not request.user.is_authenticated:
        return redirect('auth:login')
    
    form = PredictionForm()
    return render(request, 'ml_app/predict.html', {'form': form})


@require_POST
def predict_api(request):
    """API endpoint: receives form data, returns prediction JSON."""
    if not request.user.is_authenticated:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    form = PredictionForm(request.POST)
    if not form.is_valid():
        return JsonResponse({'error': 'Invalid form data', 'details': form.errors}, status=400)

    data = form.cleaned_data
    pipeline = get_pipeline()

    if pipeline is None:
        # Fallback heuristic when model not yet trained
        aq_total = sum(int(data[f'a{i}_score']) for i in range(1, 11))
        qchat = int(data['qchat_10_score'])
        cars = float(data['childhood_autism_rating_scale'])
        risk_score = (aq_total / 10) * 0.4 + (qchat / 10) * 0.35 + ((cars - 15) / 45) * 0.25
        prediction = 'YES' if risk_score >= 0.5 else 'NO'
        confidence = round(risk_score * 100 if prediction == 'YES' else (1 - risk_score) * 100, 1)
        note = 'demo'
    else:
        try:
            # Build feature vector matching training columns
            input_dict = {
                'A1': int(data['a1_score']),
                'A2': int(data['a2_score']),
                'A3': int(data['a3_score']),
                'A4': int(data['a4_score']),
                'A5': int(data['a5_score']),
                'A6': int(data['a6_score']),
                'A7': int(data['a7_score']),
                'A8': int(data['a8_score']),
                'A9': int(data['a9_score']),
                'A10': int(data['a10_score']),
                'A10_Autism_Spectrum_Quotient': int(data['a10_score']),
                'Age_Mons': float(data['age']) * 12,
                'Age_Years': float(data['age']),
                'Qchat-10-Score': int(data['qchat_10_score']),
                'Qchat_10_Score': int(data['qchat_10_score']),
                'Social_Responsiveness_Scale': float(data.get('social_responsiveness_scale') or 0),
                'Sex': 1 if data['sex'] == 'm' else 0,
                'Ethnicity': data['ethnicity'],
                'Jaundice': 1 if data['jaundice'] == '1' else 0,
                'Family_mem_with_ASD': 1 if data['family_mem_with_asd'] == '1' else 0,
                'Speech Delay/Language Disorder': 1 if data['speech_delay'] == '1' else 0,
                'Learning disorder': 1 if data['learning_disorder'] == '1' else 0,
                'Genetic_Disorders': 1 if data['genetic_disorders'] == '1' else 0,
                'Depression': 1 if data['depression'] == '1' else 0,
                'Global developmental delay/intellectual disability': 1 if data['global_developmental_delay'] == '1' else 0,
                'Social/Behavioural Issues': 1 if data['social_behavioural_issues'] == '1' else 0,
                'Childhood Autism Rating Scale (CARS)': float(data['childhood_autism_rating_scale']),
                'Childhood Autism Rating Scale': float(data['childhood_autism_rating_scale']),
                'Anxiety disorder': 1 if data['anxiety_disorder'] == '1' else 0,
                'Anxiety_disorder': 1 if data['anxiety_disorder'] == '1' else 0,
            }
            input_df = pd.DataFrame([input_dict])
            pred = pipeline.predict(input_df)[0]
            prediction = 'YES' if pred == 1 or str(pred).upper() == 'YES' else 'NO'
            if hasattr(pipeline, 'predict_proba'):
                proba = pipeline.predict_proba(input_df)[0]
                confidence = round(float(max(proba)) * 100, 1)
            else:
                confidence = None
            note = 'model'
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return JsonResponse({'error': f'Prediction failed: {str(e)}'}, status=500)

    # Save to DB
    try:
        PredictionRecord.objects.create(
            user=request.user,
            a1_score=int(data['a1_score']),
            a2_score=int(data['a2_score']),
            a3_score=int(data['a3_score']),
            a4_score=int(data['a4_score']),
            a5_score=int(data['a5_score']),
            a6_score=int(data['a6_score']),
            a7_score=int(data['a7_score']),
            a8_score=int(data['a8_score']),
            a9_score=int(data['a9_score']),
            a10_score=int(data['a10_score']),
            qchat_10_score=int(data['qchat_10_score']),
            age=float(data['age']),
            sex=data['sex'],
            ethnicity=data['ethnicity'],
            jaundice=data['jaundice'],
            family_mem_with_asd=data['family_mem_with_asd'],
            speech_delay=data['speech_delay'],
            learning_disorder=data['learning_disorder'],
            genetic_disorders=data['genetic_disorders'],
            depression=data['depression'],
            global_developmental_delay=data['global_developmental_delay'],
            social_behavioural_issues=data['social_behavioural_issues'],
            childhood_autism_rating_scale=float(data['childhood_autism_rating_scale']),
            anxiety_disorder=data['anxiety_disorder'],
            prediction=prediction,
            confidence=confidence,
        )
    except Exception as e:
        logger.warning(f"DB save failed: {e}")

    return JsonResponse({
        'prediction': prediction,
        'confidence': confidence,
        'note': note,
    })


def history(request):
    """Prediction history page."""
    if not request.user.is_authenticated:
        return redirect('auth:login')
    
    records = request.user.predictions.all()[:50]
    return render(request, 'ml_app/history.html', {'records': records})

from django.conf import settings
import os

def _get_dataset_stats():
    data_path = settings.DATA_PATH

    print("\n[DEBUG] DATA PATH:", data_path)
    print("[DEBUG] EXISTS:", os.path.exists(data_path))

    try:
        df = pd.read_csv(data_path)
        print("[DEBUG] LOADED OK:", df.shape)
        return df
    except Exception as e:
        print("[DEBUG] ERROR:", e)
        return None
