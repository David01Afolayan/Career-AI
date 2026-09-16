from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import joblib


app = FastAPI(
    title="CareerAI ML API",
    description="Machine learning service for CareerAI",
    version="1.0.0",
)


# =========================
# Load trained model
# =========================

try:
    model = joblib.load("models/career_model.pkl")
    encoder = joblib.load("models/career_encoder.pkl")

except Exception as error:
    print("Model loading error:", error)
    model = None
    encoder = None


# =========================
# Feature order
# =========================

FEATURE_COLUMNS = [
    "CGPA",
    "HTML_CSS",
    "JavaScript",
    "React",
    "NextJS",
    "NodeJS",
    "Python",
    "Java",
    "Cpp",
    "SQL",
    "Data_Analysis",
    "Machine_Learning",
    "Networking",
    "Cybersecurity",
    "Git_GitHub",
    "Communication",
    "Problem_Solving",
    "Projects",
    "Certifications",
]


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
    return {"status": "healthy"}


# =========================
# Prediction endpoint
# =========================


@app.post("/predict")
def predict(profile: StudentProfile):

    if model is None or encoder is None:
        raise HTTPException(
            status_code=500,
            detail="ML model is not loaded.",
        )

    try:

        data = profile.model_dump()

        data.pop("Interest", None)

        # Ensure correct feature order
        dataframe = pd.DataFrame(
            [data]
        )[FEATURE_COLUMNS]

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

        print(
            "Prediction error:",
            error
        )

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )
