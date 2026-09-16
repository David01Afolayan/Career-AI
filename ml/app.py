import os
import secrets
import json
from pathlib import Path

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
import pandas as pd
import joblib
from features import (
    MAX_SKILL_LEVEL,
    MIN_SKILL_LEVEL,
    NUMERIC_FEATURES,
    SKILL_FEATURES,
)


app = FastAPI(
    title="CareerAI ML API",
    description="Machine learning service for CareerAI",
    version="1.0.0",
)

BASE_DIR = Path(__file__).resolve().parent

ML_API_KEY = os.getenv("ML_API_KEY")
api_key_header = APIKeyHeader(name="x-ml-api-key", auto_error=False)


def verify_ml_api_key(
    api_key: str | None = Depends(api_key_header),
):
    if not ML_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML service is not configured.",
        )
    if not api_key or not secrets.compare_digest(api_key, ML_API_KEY):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized.",
        )
    return True


# =========================
# Load trained model
# =========================

try:
    model = joblib.load(BASE_DIR / "models" / "career_model.pkl")
    encoder = joblib.load(BASE_DIR / "models" / "career_encoder.pkl")

except Exception as error:
    print("Model loading error:", error)
    model = None
    encoder = None

MODEL_METADATA_PATH = BASE_DIR / "models" / "model_metadata.json"
if MODEL_METADATA_PATH.exists():
    with MODEL_METADATA_PATH.open("r", encoding="utf-8") as file:
        model_metadata = json.load(file)
else:
    model_metadata = {}


# =========================
# Feature order
# =========================

# =========================
# Request model
# =========================


class StudentProfile(BaseModel):

    CGPA: float = 0.0

    HTML_CSS: int = 0
    JavaScript: int = 0
    React: int = 0
    NextJS: int = 0
    NodeJS: int = 0
    Python: int = 0
    Java: int = 0
    Cpp: int = 0
    SQL: int = 0
    Data_Analysis: int = 0
    Machine_Learning: int = 0
    Networking: int = 0
    Cybersecurity: int = 0
    Git_GitHub: int = 0
    Communication: int = 0
    Problem_Solving: int = 0

    Projects: int = 0
    Certifications: int = 0

    Interest: str = ""


# =========================
# Home endpoint
# =========================


@app.get("/")
def home():
    return {
        "message": "CareerAI ML API is running",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model": model_metadata.get("selected_model", "unknown"),
        "modelStatus": model_metadata.get("model_status", "unknown"),
    }


@app.get("/model-info")
def model_info():
    return {
        "model": model_metadata.get("selected_model", "unknown"),
        "status": model_metadata.get("model_status", "unknown"),
        "target": model_metadata.get("target", "Recommended_Career"),
        "features": model_metadata.get("features", NUMERIC_FEATURES),
        "excludedFeatures": model_metadata.get(
            "excluded_features", ["Interest"]
        ),
        "datasetRows": model_metadata.get("dataset_rows"),
    }


# =========================
# Prediction endpoint
# =========================


@app.post("/predict", dependencies=[Depends(verify_ml_api_key)])
def predict(profile: StudentProfile):

    if model is None or encoder is None:
        raise HTTPException(
            status_code=500,
            detail="ML model is not loaded.",
        )

    try:

        data = profile.model_dump()

        data.pop("Interest", None)

        for skill in SKILL_FEATURES:
            value = getattr(profile, skill)
            if not MIN_SKILL_LEVEL <= value <= MAX_SKILL_LEVEL:
                raise HTTPException(
                    status_code=422,
                    detail=(
                        f"{skill} must be between "
                        f"{MIN_SKILL_LEVEL} and {MAX_SKILL_LEVEL}"
                    ),
                )

        dataframe = pd.DataFrame(
            [
                {
                    feature: data.get(feature, 0)
                    for feature in NUMERIC_FEATURES
                }
            ]
        )

        # Get prediction
        prediction = model.predict(
            dataframe
        )[0]

        # Get probabilities
        probabilities = model.predict_proba(
            dataframe
        )[0]

        # Decode predicted career
        predicted_career = encoder.inverse_transform(
            [prediction]
        )[0]

        # Build probability list
        careers = encoder.inverse_transform(
            list(range(len(probabilities)))
        )

        probability_map = {}
        recommendations = []

        for career, probability in zip(
            careers,
            probabilities
        ):
            confidence_value = round(float(probability), 4)
            probability_map[career] = confidence_value
            recommendations.append(
                {
                    "career": career,
                    "confidence": round(float(probability) * 100, 2),
                }
            )

        recommendations.sort(
            key=lambda item: item["confidence"],
            reverse=True,
        )

        return {
            "predictedCareer": predicted_career,
            "predicted_career": predicted_career,
            "confidence": round(float(probabilities[prediction]), 4),
            "probabilities": probability_map,
            "recommendations": recommendations,
        }

    except Exception as error:
        print("Prediction error:", error)

        if isinstance(error, HTTPException):
            raise

        raise HTTPException(
            status_code=503,
            detail="Prediction service is temporarily unavailable.",
        )
