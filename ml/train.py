import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix,
)
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.pipeline import Pipeline


# =========================
# 1. Load dataset
# =========================

df = pd.read_csv("data/career_dataset.csv")

print("Dataset shape:", df.shape)
print("Columns:", list(df.columns))


# =========================
# 2. Prepare features
# =========================

# Interest is text and is not yet encoded.
# We temporarily exclude it from the model.
X = df.drop(columns=["Recommended_Career", "Interest"])

y = df["Recommended_Career"]


# =========================
# 3. Encode target
# =========================

encoder = LabelEncoder()

y_encoded = encoder.fit_transform(y)

print("\nCareer classes:")
for index, career in enumerate(encoder.classes_):
    print(index, "=", career)


# =========================
# 4. Train/test split
# =========================

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.33,
    random_state=42,
    stratify=y_encoded,
)


# =========================
# 5. Create model
# =========================

model = Pipeline(
    steps=[
        (
            "classifier",
            RandomForestClassifier(
                n_estimators=200,
                random_state=42,
                class_weight="balanced",
            ),
        )
    ]
)


# =========================
# 6. Train model
# =========================

print("\nTraining model...")

model.fit(X_train, y_train)

print("Model training completed.")


# =========================
# 7. Make predictions
# =========================

y_pred = model.predict(X_test)


# =========================
# 8. Evaluate model
# =========================

accuracy = accuracy_score(y_test, y_pred)

precision = precision_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0,
)

recall = recall_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0,
)

f1 = f1_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0,
)

print("\n==============================")
print("MODEL EVALUATION")
print("==============================")

print(f"Accuracy:  {accuracy:.4f}")
print(f"Precision: {precision:.4f}")
print(f"Recall:    {recall:.4f}")
print(f"F1 Score:  {f1:.4f}")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        y_pred,
        target_names=encoder.classes_,
        zero_division=0,
    )
)

print("Confusion Matrix:")
print(confusion_matrix(y_test, y_pred))


# =========================
# 9. Save model
# =========================

joblib.dump(
    model,
    "models/career_model.pkl",
)

joblib.dump(
    encoder,
    "models/career_encoder.pkl",
)

print("\n==============================")
print("MODEL SAVED")
print("==============================")
print("models/career_model.pkl")
print("models/career_encoder.pkl")

print("\n⚠️ IMPORTANT:")
print(
    "This synthetic dataset is for development/testing only. "
    "Do not use these metrics as final research results."
)
