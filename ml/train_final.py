import json
from pathlib import Path

import joblib
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier

from features import NUMERIC_FEATURES, TARGET_COLUMN


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "data" / "career_dataset_final.csv"
MODEL_DIR = BASE_DIR / "models"
EVALUATION_DIR = BASE_DIR / "evaluation"


def create_preprocessor() -> ColumnTransformer:
    return ColumnTransformer(
        transformers=[
            (
                "numeric",
                Pipeline(
                    [
                        ("imputer", SimpleImputer(strategy="median")),
                        ("scaler", StandardScaler()),
                    ]
                ),
                NUMERIC_FEATURES,
            )
        ]
    )


def build_models() -> dict[str, Pipeline]:
    def pipeline(model):
        return Pipeline([("preprocessor", create_preprocessor()), ("model", model)])

    return {
        "Logistic Regression": pipeline(
            LogisticRegression(max_iter=2000, class_weight="balanced", random_state=42)
        ),
        "Decision Tree": pipeline(
            DecisionTreeClassifier(class_weight="balanced", random_state=42)
        ),
        "KNN": pipeline(KNeighborsClassifier(n_neighbors=5)),
        "Random Forest": pipeline(
            RandomForestClassifier(
                n_estimators=500,
                class_weight="balanced",
                random_state=42,
                n_jobs=-1,
            )
        ),
    }


def save_confusion_matrix(model_name, y_true, y_pred, labels) -> None:
    matrix = confusion_matrix(y_true, y_pred)
    figure, axis = plt.subplots(figsize=(10, 8))
    axis.imshow(matrix)
    axis.set_title(f"{model_name} Confusion Matrix")
    axis.set_xlabel("Predicted")
    axis.set_ylabel("Actual")
    axis.set_xticks(range(len(labels)), labels, rotation=45, ha="right")
    axis.set_yticks(range(len(labels)), labels)
    for row in range(matrix.shape[0]):
        for column in range(matrix.shape[1]):
            axis.text(column, row, matrix[row, column], ha="center", va="center")
    figure.tight_layout()
    filename = model_name.lower().replace(" ", "_") + "_confusion_matrix.png"
    figure.savefig(EVALUATION_DIR / filename, dpi=200)
    plt.close(figure)


def main() -> None:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    if len(df) == 0:
        raise ValueError("Dataset contains no participant responses.")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    EVALUATION_DIR.mkdir(parents=True, exist_ok=True)

    X = df[NUMERIC_FEATURES].copy()
    encoder = LabelEncoder()
    y = encoder.fit_transform(df[TARGET_COLUMN])
    class_counts = df[TARGET_COLUMN].value_counts()
    if class_counts.min() < 5:
        raise ValueError("Every career class needs at least 5 observations for 5-fold cross-validation.")

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    models = build_models()
    comparison = []
    reports = {}

    for model_name, model in models.items():
        cv_scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="f1_macro")
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        comparison.append(
            {
                "Model": model_name,
                "Accuracy": accuracy_score(y_test, predictions),
                "Macro Precision": precision_score(y_test, predictions, average="macro", zero_division=0),
                "Macro Recall": recall_score(y_test, predictions, average="macro", zero_division=0),
                "Macro F1": f1_score(y_test, predictions, average="macro", zero_division=0),
                "CV Macro F1 Mean": cv_scores.mean(),
                "CV Macro F1 Std": cv_scores.std(),
            }
        )
        reports[model_name] = classification_report(
            y_test, predictions, target_names=encoder.classes_, zero_division=0
        )
        save_confusion_matrix(model_name, y_test, predictions, encoder.classes_)
    results = pd.DataFrame(comparison).sort_values("CV Macro F1 Mean", ascending=False)
    best_model_name = results.iloc[0]["Model"]

    print(f"\nSelected model: {best_model_name}")
    print("Retraining selected model on the complete dataset...")
    final_model = build_models()[best_model_name]
    final_model.fit(X, y)
    joblib.dump(final_model, MODEL_DIR / "career_model.pkl")
    joblib.dump(encoder, MODEL_DIR / "career_encoder.pkl")
    print("[OK] Production model trained on complete dataset.")
    results.to_csv(EVALUATION_DIR / "final_model_comparison.csv", index=False)

    metadata = {
        "selected_model": best_model_name,
        "selection_metric": "5-fold cross-validation Macro F1",
        "dataset": str(DATASET_PATH),
        "dataset_rows": len(df),
        "training_rows": len(X_train),
        "testing_rows": len(X_test),
        "features": NUMERIC_FEATURES,
        "excluded_features": ["Interest"],
        "target": TARGET_COLUMN,
        "classes": encoder.classes_.tolist(),
        "test_split": 0.20,
        "random_state": 42,
        "development_only": False,
        "model_status": "final_research_model",
        "training_strategy": (
            "Model selected using cross-validation on training data and "
            "retrained on complete validated dataset after final evaluation."
        ),
    }
    (MODEL_DIR / "model_metadata.json").write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    with (EVALUATION_DIR / "classification_reports.txt").open("w", encoding="utf-8") as file:
        for model_name, report in reports.items():
            file.write(f"\n{'=' * 70}\n{model_name}\n{'=' * 70}\n{report}")

    research_results = {
        "dataset_rows": int(len(df)),
        "training_rows": int(len(X_train)),
        "testing_rows": int(len(X_test)),
        "test_size": 0.20,
        "random_state": 42,
        "cv_folds": 5,
        "selection_metric": "CV Macro F1",
        "selected_model": best_model_name,
        "models": comparison,
        "classes": encoder.classes_.tolist(),
    }
    (EVALUATION_DIR / "research_results.json").write_text(
        json.dumps(research_results, indent=2),
        encoding="utf-8",
    )

    print(results.to_string(index=False))
    print("[OK] Evaluation files saved.")


if __name__ == "__main__":
    main()
