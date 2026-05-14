"""
ml_models/ml_model.py  —  Production inference module
"""
import os, logging
import pandas as pd

logger    = logging.getLogger(__name__)
_DIR      = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(_DIR, "trained_model.pkl")
_pipeline  = None


def load_pipeline():
    global _pipeline
    if _pipeline is not None:
        return _pipeline
    try:
        import joblib
        _pipeline = joblib.load(MODEL_PATH)
        logger.info(f"[ml_model] Loaded {MODEL_PATH}")
    except FileNotFoundError:
        logger.warning("[ml_model] trained_model.pkl not found — run train_model.py")
    except Exception as e:
        logger.error(f"[ml_model] Load error: {e}")
    return _pipeline


def _build_input_df(raw: dict) -> pd.DataFrame:
    """Map Django form cleaned_data → DataFrame with exact CSV column names."""
    return pd.DataFrame([{
        # AQ-10 (exact CSV names)
        "A1": int(raw.get("a1_score", 0)),
        "A2": int(raw.get("a2_score", 0)),
        "A3": int(raw.get("a3_score", 0)),
        "A4": int(raw.get("a4_score", 0)),
        "A5": int(raw.get("a5_score", 0)),
        "A6": int(raw.get("a6_score", 0)),
        "A7": int(raw.get("a7_score", 0)),
        "A8": int(raw.get("a8_score", 0)),
        "A9": int(raw.get("a9_score", 0)),
        "A10_Autism_Spectrum_Quotient": int(raw.get("a10_score", 0)),
        # Clinical
        "Social_Responsiveness_Scale":    float(raw.get("social_responsiveness_scale", 0)),
        "Age_Years":                      float(raw.get("age", 0)),
        "Qchat_10_Score":                 int(raw.get("qchat_10_score", 0)),
        "Childhood Autism Rating Scale":  float(raw.get("childhood_autism_rating_scale", 15)),
        # Demographics
        "Sex":       1 if raw.get("sex") == "m" else 0,
        "Ethnicity": raw.get("ethnicity", "Others"),
        "Jaundice":  1 if str(raw.get("jaundice")) == "1" else 0,
        "Family_mem_with_ASD": 1 if str(raw.get("family_mem_with_asd")) == "1" else 0,
        # Co-occurring conditions
        "Speech Delay/Language Disorder":                     1 if str(raw.get("speech_delay")) == "1" else 0,
        "Learning disorder":                                  1 if str(raw.get("learning_disorder")) == "1" else 0,
        "Genetic_Disorders":                                  1 if str(raw.get("genetic_disorders")) == "1" else 0,
        "Depression":                                         1 if str(raw.get("depression")) == "1" else 0,
        "Global developmental delay/intellectual disability":  1 if str(raw.get("global_developmental_delay")) == "1" else 0,
        "Social/Behavioural Issues":                          1 if str(raw.get("social_behavioural_issues")) == "1" else 0,
        "Anxiety_disorder":                                   1 if str(raw.get("anxiety_disorder")) == "1" else 0,
    }])


def _heuristic(raw: dict) -> dict:
    aq    = sum(int(raw.get(f"a{i}_score", 0)) for i in range(1, 11))
    qchat = int(raw.get("qchat_10_score", 0))
    srs   = float(raw.get("social_responsiveness_scale", 0))
    # SRS range 0-10, QCHAT 0-10, AQ 0-10
    risk  = (aq/10)*0.35 + (qchat/10)*0.35 + (min(srs,10)/10)*0.30
    pred  = "YES" if risk >= 0.5 else "NO"
    conf  = round((risk if pred == "YES" else 1-risk)*100, 1)
    return {"prediction": pred, "confidence": conf, "source": "heuristic"}


def predict_asd(raw: dict) -> dict:
    pipe = load_pipeline()
    if pipe is None:
        return _heuristic(raw)
    try:
        df   = _build_input_df(raw)
        pred = pipe.predict(df)[0]
        prediction = "YES" if (pred == 1 or str(pred).upper() == "YES") else "NO"
        confidence = None
        if hasattr(pipe, "predict_proba"):
            proba      = pipe.predict_proba(df)[0]
            confidence = round(float(max(proba)) * 100, 1)
        return {"prediction": prediction, "confidence": confidence, "source": "model"}
    except Exception as e:
        logger.error(f"[ml_model] Prediction error: {e}")
        return _heuristic(raw)


load_pipeline()