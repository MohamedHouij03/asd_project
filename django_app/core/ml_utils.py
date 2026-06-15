"""
core/ml_utils.py
────────────────
Calls the existing ML prediction logic from ml_app without duplicating code.
Uses Django's RequestFactory to call predict_api with a real User, bypassing HTTP.
"""
import json
import logging

from django.test import RequestFactory

logger = logging.getLogger(__name__)


def run_prediction(user, form_data: dict) -> dict | None:
    """
    Run the ASD prediction using the existing ml_app.views.predict_api.

    Parameters
    ----------
    user      : Django User instance (authenticated)
    form_data : dict matching PredictionForm fields (all values as strings)

    Returns
    -------
    dict  with keys: prediction, confidence, note, top_factors,
                     explanation_text, contrib_chart
    None  on failure
    """
    try:
        from ml_app.views import predict_api

        factory = RequestFactory()
        request = factory.post('/predict/api/', data=form_data)
        request.user = user

        # predict_api uses request.session for nothing critical —
        # mock it so the view doesn't raise AttributeError.
        request.session = {}

        response = predict_api(request)
        result = json.loads(response.content)

        if response.status_code != 200:
            logger.warning(f"predict_api returned {response.status_code}: {result}")
            return None

        return result

    except Exception as exc:
        logger.error(f"run_prediction failed: {exc}", exc_info=True)
        return None


def risk_level_from_result(prediction: str, confidence: float | None) -> str:
    """Map YES/NO + confidence → risk level string."""
    if prediction == 'NO':
        return 'low'
    if confidence is None:
        return 'high'
    if confidence >= 80:
        return 'high'
    if confidence >= 60:
        return 'moderate'
    return 'low'


def build_recommendations(prediction: str, top_factors: list) -> list[str]:
    """Generate plain-language recommendations based on the prediction."""
    if prediction == 'NO':
        return [
            'Continue regular developmental monitoring with your paediatrician.',
            'Keep observing social interaction and communication milestones.',
            'Re-screen in 6–12 months or if new concerns arise.',
        ]
    return [
        'Consult a paediatrician, developmental psychologist, or speech therapist.',
        'Request a formal diagnostic evaluation — early intervention is most effective.',
        'Document specific behaviours and bring notes to appointments.',
        'Explore early intervention programmes and community support resources.',
        'Connect with local and online ASD family support groups.',
    ]
