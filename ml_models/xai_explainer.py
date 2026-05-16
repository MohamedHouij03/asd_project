import logging
from typing import Dict, List, Optional

import joblib
import numpy as np
import pandas as pd


logger = logging.getLogger(__name__)


class XAIExplainer:
    """Model explanation helper for SHAP and fallback importance."""

    def __init__(self, model_path: str):
        self.model_path = model_path
        self.pipeline = None
        self.explainer = None

    def load(self) -> None:
        self.pipeline = joblib.load(self.model_path)

    @property
    def feature_names(self) -> List[str]:
        if self.pipeline is None:
            return []
        return list(getattr(self.pipeline, "feature_names_in_", []))

    def _get_model(self):
        if self.pipeline is None:
            return None
        if hasattr(self.pipeline, "named_steps"):
            return self.pipeline.named_steps.get("classifier", self.pipeline)
        return self.pipeline

    def _get_shap_explainer(self):
        if self.explainer is not None:
            return self.explainer
        try:
            import shap

            model = self._get_model()
            self.explainer = shap.TreeExplainer(model)
            return self.explainer
        except Exception as exc:
            logger.warning("SHAP not available: %s", exc)
            return None

    def explain_local(self, input_df: pd.DataFrame) -> List[Dict]:
        if self.pipeline is None:
            raise RuntimeError("Pipeline not loaded")

        names = self.feature_names or list(input_df.columns)
        input_df = input_df[names]
        values = input_df.iloc[0].to_dict()

        explainer = self._get_shap_explainer()
        if explainer is None:
            return self._fallback_local(input_df)

        try:
            shap_values = explainer.shap_values(input_df)
            if isinstance(shap_values, list):
                sv = np.asarray(shap_values[-1])[0]
            else:
                arr = np.asarray(shap_values)
                if arr.ndim == 3:
                    sv = arr[0, :, 1]
                else:
                    sv = arr[0]

            items = []
            for i, name in enumerate(names):
                c = float(sv[i])
                items.append(
                    {
                        "feature": name,
                        "value": float(values[name]),
                        "contribution": c,
                        "direction": "increase" if c >= 0 else "decrease",
                    }
                )
            items.sort(key=lambda x: abs(x["contribution"]), reverse=True)
            return items
        except Exception as exc:
            logger.warning("SHAP local explanation failed: %s", exc)
            return self._fallback_local(input_df)

    def _fallback_local(self, input_df: pd.DataFrame) -> List[Dict]:
        model = self._get_model()
        names = self.feature_names or list(input_df.columns)
        vals = input_df.iloc[0].to_dict()

        if hasattr(model, "feature_importances_"):
            imps = np.asarray(model.feature_importances_)[: len(names)]
            contrib = np.abs(imps * np.asarray([vals[n] for n in names]))
        elif hasattr(model, "coef_"):
            coefs = np.abs(np.asarray(model.coef_)[0][: len(names)])
            contrib = np.abs(coefs * np.asarray([vals[n] for n in names]))
        else:
            contrib = np.asarray([abs(float(vals[n])) for n in names])

        items = [
            {
                "feature": names[i],
                "value": float(vals[names[i]]),
                "contribution": float(contrib[i]),
                "direction": "increase",
            }
            for i in range(len(names))
        ]
        items.sort(key=lambda x: abs(x["contribution"]), reverse=True)
        return items
