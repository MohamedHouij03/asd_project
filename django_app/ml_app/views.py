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
from sklearn.inspection import PartialDependenceDisplay

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
_shap_explainer = None

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


def get_shap_explainer():
    """Lazy-load SHAP explainer for the classifier in the pipeline."""
    global _shap_explainer
    if _shap_explainer is not None:
        return _shap_explainer

    pipeline = get_pipeline()
    if pipeline is None:
        return None

    try:
        import shap
        model = pipeline.named_steps.get('classifier') if hasattr(pipeline, 'named_steps') else pipeline
        _shap_explainer = shap.TreeExplainer(model)
    except Exception as e:
        logger.warning(f"SHAP explainer unavailable: {e}")
        _shap_explainer = None
    return _shap_explainer


def _fig_to_base64(fig):
    """Convert matplotlib figure to base64 string for embedding in HTML."""
    buf = io.BytesIO()
    fig.savefig(buf, format='png', bbox_inches='tight', dpi=120, facecolor='#0f172a')
    buf.seek(0)
    img_bytes = buf.read()
    buf.close()
    plt.close(fig)
    return base64.b64encode(img_bytes).decode('utf-8')


def _pipeline_feature_row(data):
    """Build exactly the feature row expected by the trained pipeline."""
    row = {
        'A1': int(data['a1_score']),
        'A2': int(data['a2_score']),
        'A3': int(data['a3_score']),
        'A4': int(data['a4_score']),
        'A5': int(data['a5_score']),
        'A6': int(data['a6_score']),
        'A7': int(data['a7_score']),
        'A8': int(data['a8_score']),
        'A9': int(data['a9_score']),
        'A10_Autism_Spectrum_Quotient': int(data['a10_score']),
        'Social_Responsiveness_Scale': float(data.get('social_responsiveness_scale') or 0),
        'Age_Years': float(data['age']),
        'Qchat_10_Score': int(data['qchat_10_score']),
        'Childhood Autism Rating Scale': float(data['childhood_autism_rating_scale']),
        'Sex': 1 if data['sex'] == 'm' else 0,
        'Jaundice': 1 if data['jaundice'] == '1' else 0,
        'Family_mem_with_ASD': 1 if data['family_mem_with_asd'] == '1' else 0,
        'Speech Delay/Language Disorder': 1 if data['speech_delay'] == '1' else 0,
        'Learning disorder': 1 if data['learning_disorder'] == '1' else 0,
        'Genetic_Disorders': 1 if data['genetic_disorders'] == '1' else 0,
        'Depression': 1 if data['depression'] == '1' else 0,
        'Global developmental delay/intellectual disability': 1 if data['global_developmental_delay'] == '1' else 0,
        'Social/Behavioural Issues': 1 if data['social_behavioural_issues'] == '1' else 0,
        'Anxiety_disorder': 1 if data['anxiety_disorder'] == '1' else 0,
    }
    return pd.DataFrame([row])


def _get_feature_names(pipeline, input_df):
    names = list(getattr(pipeline, 'feature_names_in_', []))
    if names:
        return names
    return list(input_df.columns)


def _xai_fallback_from_importance(pipeline, input_df):
    model = pipeline.named_steps.get('classifier') if hasattr(pipeline, 'named_steps') else pipeline
    names = _get_feature_names(pipeline, input_df)
    values = input_df.iloc[0].to_dict()

    if hasattr(model, 'feature_importances_'):
        base_imp = np.asarray(model.feature_importances_)
        contrib = np.abs(base_imp[:len(names)] * np.asarray([values[n] for n in names]))
    elif hasattr(model, 'coef_'):
        coefs = np.abs(np.asarray(model.coef_)[0][:len(names)])
        contrib = np.abs(coefs * np.asarray([values[n] for n in names]))
    else:
        contrib = np.asarray([abs(float(values[n])) for n in names])

    items = []
    for i, name in enumerate(names):
        items.append({'feature': name, 'value': float(values[name]), 'contribution': float(contrib[i]), 'direction': 'increase'})
    items.sort(key=lambda x: abs(x['contribution']), reverse=True)
    return items


def _xai_local_explanation(pipeline, input_df):
    """Return feature contributions for one prediction using SHAP when available."""
    feature_names = _get_feature_names(pipeline, input_df)
    values = input_df[feature_names].iloc[0].to_dict()

    explainer = get_shap_explainer()
    if explainer is None:
        return _xai_fallback_from_importance(pipeline, input_df)

    try:
        X = input_df[feature_names]
        shap_vals = explainer.shap_values(X)
        if isinstance(shap_vals, list):
            sv = np.asarray(shap_vals[-1])[0]
        else:
            arr = np.asarray(shap_vals)
            if arr.ndim == 3:
                sv = arr[0, :, -1]
            else:
                sv = arr[0]

        items = []
        for i, name in enumerate(feature_names):
            val = float(values[name])
            c = float(sv[i])
            items.append({
                'feature': name,
                'value': val,
                'contribution': c,
                'direction': 'increase' if c >= 0 else 'decrease',
            })
        items.sort(key=lambda x: abs(x['contribution']), reverse=True)
        return items
    except Exception as e:
        logger.warning(f"SHAP local explanation failed: {e}")
        return _xai_fallback_from_importance(pipeline, input_df)


def _chart_local_contrib(contrib_items, title='Feature Contribution (Local Explanation)'):
    top = contrib_items[:10]
    labels = [t['feature'] for t in reversed(top)]
    vals = [float(t['contribution']) for t in reversed(top)]
    colors = ['#10b981' if v >= 0 else '#ef4444' for v in vals]

    fig, ax = plt.subplots(figsize=(8, 4.6), facecolor='#0f172a')
    ax.set_facecolor('#1e293b')
    ax.barh(labels, vals, color=colors, edgecolor='#0f172a')
    ax.axvline(0, color='#94a3b8', linewidth=1)
    ax.set_title(title, color='white', fontsize=12)
    ax.set_xlabel('Contribution', color='#94a3b8')
    ax.tick_params(colors='#94a3b8', labelsize=8)
    for spine in ax.spines.values():
        spine.set_edgecolor('#334155')
    fig.tight_layout()
    return _fig_to_base64(fig)


def _chart_shap_summary(df, pipeline):
    """Global SHAP summary bar chart on sampled dataset."""
    feature_names = list(getattr(pipeline, 'feature_names_in_', []))
    if not feature_names:
        return None
    missing = [f for f in feature_names if f not in df.columns]
    if missing:
        return None
    sample = df[feature_names].dropna().head(200)
    if sample.empty:
        return None

    explainer = get_shap_explainer()
    if explainer is None:
        return None
    try:
        shap_vals = explainer.shap_values(sample)
        if isinstance(shap_vals, list):
            arr = np.asarray(shap_vals[-1])
        else:
            arr = np.asarray(shap_vals)
            if arr.ndim == 3:
                arr = arr[:, :, -1]
        mean_abs = np.abs(arr).mean(axis=0)
        order = np.argsort(mean_abs)[-12:]
        labels = [feature_names[i] for i in order]
        vals = [mean_abs[i] for i in order]

        fig, ax = plt.subplots(figsize=(8, 4.8), facecolor='#0f172a')
        ax.set_facecolor('#1e293b')
        ax.barh(labels, vals, color='#60a5fa', edgecolor='#0f172a')
        ax.set_title('SHAP Summary (mean |SHAP|)', color='white', fontsize=12)
        ax.set_xlabel('Global impact', color='#94a3b8')
        ax.tick_params(colors='#94a3b8', labelsize=8)
        for spine in ax.spines.values():
            spine.set_edgecolor('#334155')
        fig.tight_layout()
        return _fig_to_base64(fig)
    except Exception as e:
        logger.warning(f"SHAP summary chart failed: {e}")
        return None


def _chart_shap_beeswarm(df, pipeline):
    """Approximate beeswarm-style scatter using SHAP values."""
    feature_names = list(getattr(pipeline, 'feature_names_in_', []))
    if not feature_names:
        return None
    missing = [f for f in feature_names if f not in df.columns]
    if missing:
        return None
    sample = df[feature_names].dropna().head(180)
    if sample.empty:
        return None

    explainer = get_shap_explainer()
    if explainer is None:
        return None

    try:
        shap_vals = explainer.shap_values(sample)
        if isinstance(shap_vals, list):
            arr = np.asarray(shap_vals[-1])
        else:
            arr = np.asarray(shap_vals)
            if arr.ndim == 3:
                arr = arr[:, :, -1]

        mean_abs = np.abs(arr).mean(axis=0)
        top_idx = np.argsort(mean_abs)[-8:]
        top_features = [feature_names[i] for i in top_idx]

        fig, ax = plt.subplots(figsize=(9, 5), facecolor='#0f172a')
        ax.set_facecolor('#1e293b')
        y_positions = np.arange(len(top_features))
        for yi, fi in enumerate(top_idx):
            xs = arr[:, fi]
            ys = np.random.normal(loc=y_positions[yi], scale=0.08, size=len(xs))
            ax.scatter(xs, ys, s=15, alpha=0.5, color='#4ade80')

        ax.set_yticks(y_positions)
        ax.set_yticklabels(top_features, color='#94a3b8')
        ax.set_xlabel('SHAP value', color='#94a3b8')
        ax.set_title('SHAP Beeswarm (Top Features)', color='white', fontsize=12)
        ax.tick_params(colors='#94a3b8')
        for spine in ax.spines.values():
            spine.set_edgecolor('#334155')
        fig.tight_layout()
        return _fig_to_base64(fig)
    except Exception as e:
        logger.warning(f"SHAP beeswarm chart failed: {e}")
        return None


def _chart_pdp_age(df, pipeline):
    feature_names = list(getattr(pipeline, 'feature_names_in_', []))
    if 'Age_Years' not in feature_names:
        return None
    missing = [f for f in feature_names if f not in df.columns]
    if missing:
        return None
    sample = df[feature_names].dropna().head(300)
    if sample.empty:
        return None
    try:
        fig, ax = plt.subplots(figsize=(7, 4), facecolor='#0f172a')
        ax.set_facecolor('#1e293b')
        PartialDependenceDisplay.from_estimator(pipeline, sample, ['Age_Years'], ax=ax)
        ax.set_title('Partial Dependence: Age_Years', color='white', fontsize=12)
        ax.tick_params(colors='#94a3b8')
        for spine in ax.spines.values():
            spine.set_edgecolor('#334155')
        fig.tight_layout()
        return _fig_to_base64(fig)
    except Exception as e:
        logger.warning(f"PDP chart failed: {e}")
        return None


def _demo_prediction_from_form(data):
    """Heuristic fallback prediction when model inference fails."""
    aq_total = sum(int(data[f'a{i}_score']) for i in range(1, 11))
    qchat = int(data['qchat_10_score'])
    cars = float(data['childhood_autism_rating_scale'])
    risk_score = (aq_total / 10) * 0.4 + (qchat / 10) * 0.35 + ((cars - 15) / 45) * 0.25
    prediction = 'YES' if risk_score >= 0.5 else 'NO'
    confidence = round(risk_score * 100 if prediction == 'YES' else (1 - risk_score) * 100, 1)
    xai_items = [
        {'feature': 'AQ Total', 'value': aq_total, 'contribution': round((aq_total / 10) * 0.4, 4), 'direction': 'increase'},
        {'feature': 'Qchat_10_Score', 'value': qchat, 'contribution': round((qchat / 10) * 0.35, 4), 'direction': 'increase'},
        {'feature': 'Childhood Autism Rating Scale', 'value': cars, 'contribution': round(((cars - 15) / 45) * 0.25, 4), 'direction': 'increase'},
    ]
    return prediction, confidence, xai_items


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

            pipeline = get_pipeline()
            if pipeline is not None:
                charts['shap_summary'] = _chart_shap_summary(df, pipeline)
                charts['shap_beeswarm'] = _chart_shap_beeswarm(df, pipeline)
                charts['pdp_age'] = _chart_pdp_age(df, pipeline)

                if 'shap_summary' in charts and charts['shap_summary']:
                    try:
                        sample_row = df.head(1).copy()
                        fnames = list(getattr(pipeline, 'feature_names_in_', []))
                        if fnames and all(c in sample_row.columns for c in fnames):
                            local_items = _xai_local_explanation(pipeline, sample_row[fnames])
                            charts['shap_waterfall'] = _chart_local_contrib(local_items, 'SHAP Waterfall-style Local Explanation')
                    except Exception as e:
                        logger.warning(f"Waterfall chart generation failed: {e}")

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
        prediction, confidence, xai_items = _demo_prediction_from_form(data)
        note = 'demo'
    else:
        try:
            input_df = _pipeline_feature_row(data)
            pred = pipeline.predict(input_df)[0]
            prediction = 'YES' if pred == 1 or str(pred).upper() == 'YES' else 'NO'
            if hasattr(pipeline, 'predict_proba'):
                proba = pipeline.predict_proba(input_df)[0]
                confidence = round(float(max(proba)) * 100, 1)
            else:
                confidence = None
            note = 'model'
            xai_items = _xai_local_explanation(pipeline, input_df)
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            prediction, confidence, xai_items = _demo_prediction_from_form(data)
            note = 'demo'

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

    top3 = xai_items[:3]
    top3_names = [t['feature'] for t in top3]
    explanation_text = f"The top 3 contributing factors were: {', '.join(top3_names)}."
    contrib_chart = _chart_local_contrib(xai_items)

    return JsonResponse({
        'prediction': prediction,
        'confidence': confidence,
        'note': note,
        'top_factors': top3,
        'explanation_text': explanation_text,
        'contrib_chart': contrib_chart,
    })


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
