import os

import joblib
import matplotlib.pyplot as plt
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    ConfusionMatrixDisplay,
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import (
    StratifiedKFold,
    cross_val_score,
    train_test_split,
)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.tree import DecisionTreeClassifier
from features import (
    EXCLUDED_FEATURES,
    MAX_SKILL_LEVEL,
    MIN_SKILL_LEVEL,
    NUMERIC_FEATURES,
    SKILL_FEATURES,
    TARGET_COLUMN,
)


DATA_PATH = "data/career_dataset.csv"

df = pd.read_csv(DATA_PATH)

print("\n======================================")
print("CAREERAI ML TRAINING SYSTEM")
print("======================================")
print("\nDataset shape:")
print(df.shape)
print("\nDataset columns:")
print(list(df.columns))

print("\nValidating dataset...")

required_columns = NUMERIC_FEATURES + EXCLUDED_FEATURES + [TARGET_COLUMN]
missing_columns = [
    column for column in required_columns if column not in df.columns
]
if missing_columns:
    raise ValueError(
        "Dataset is missing required columns: " + ", ".join(missing_columns)
    )
print("Required columns are present.")

if df[TARGET_COLUMN].isnull().any():
    raise ValueError("Target column contains missing values.")
print("Target column contains no missing values.")

for column in SKILL_FEATURES:
    invalid_values = df[
        ~df[column].between(MIN_SKILL_LEVEL, MAX_SKILL_LEVEL)
    ]
    if len(invalid_values) > 0:
        raise ValueError(
            f"{column} contains proficiency values outside "
            f"{MIN_SKILL_LEVEL}-{MAX_SKILL_LEVEL}."
        )
print("Skill proficiency values are valid.")

numeric_missing = df[NUMERIC_FEATURES].isnull().sum()
if numeric_missing.sum() > 0:
    print("\nMissing numeric values detected.")
    for column in NUMERIC_FEATURES:
        if df[column].isnull().any():
            df[column] = df[column].fillna(df[column].median())
    print("Missing numeric values replaced using column medians.")
else:
    print("No missing numeric values.")

X = df[NUMERIC_FEATURES].copy()
y = df[TARGET_COLUMN].copy()

print("\nFinal ML features:")
for feature in NUMERIC_FEATURES:
    print(f"- {feature}")

print("\nChecking for obvious target leakage...")
for column in EXCLUDED_FEATURES:
    if column in df.columns:
        print(f"Excluded: {column} ({df[column].nunique()} unique values)")
print("\nInterest is excluded from the development model to reduce the risk of target leakage.")

print("\nFeatures used:")
print(list(X.columns))
print("\nTarget classes:")
print(sorted(y.unique()))

encoder = LabelEncoder()
y_encoded = encoder.fit_transform(y)

print("\nEncoded career classes:")
for index, career in enumerate(encoder.classes_):
    print(f"{index} = {career}")

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.33,
    random_state=42,
    stratify=y_encoded,
)

print("\nTraining samples:", len(X_train))
print("Testing samples:", len(X_test))

models = {
    "Logistic Regression": Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            (
                "classifier",
                LogisticRegression(max_iter=2000, class_weight="balanced"),
            ),
        ]
    ),
    "Decision Tree": DecisionTreeClassifier(
        random_state=42,
        class_weight="balanced",
    ),
    "KNN": Pipeline(
        steps=[
            ("scaler", StandardScaler()),
            ("classifier", KNeighborsClassifier(n_neighbors=3)),
        ]
    ),
    "Random Forest": RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced",
    ),
}

minimum_class_count = y.value_counts().min()
cv_splits = min(5, minimum_class_count)

if cv_splits < 2:
    raise ValueError("At least two records per career class are required for cross-validation.")

if cv_splits < 5:
    print("\nWARNING")
    print(f"The smallest career class contains only {minimum_class_count} records.")
    print(f"Using {cv_splits}-fold cross-validation for this development dataset.")
    print("Final research dataset should contain enough records per career for 5-fold CV.")
else:
    print("\nUsing 5-fold cross-validation.")

cv = StratifiedKFold(n_splits=cv_splits, shuffle=True, random_state=42)

os.makedirs("models", exist_ok=True)
os.makedirs("evaluation", exist_ok=True)

results = []
trained_models = {}
reports = {}

for model_name, model in models.items():
    print("\n")
    print("======================================")
    print(model_name)
    print("======================================")
    print("Training...")

    model.fit(X_train, y_train)
    trained_models[model_name] = model
    print("Training completed.")

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(
        y_test, y_pred, average="weighted", zero_division=0
    )
    recall = recall_score(y_test, y_pred, average="weighted", zero_division=0)
    f1 = f1_score(y_test, y_pred, average="weighted", zero_division=0)

    cv_scores = cross_val_score(
        model,
        X,
        y_encoded,
        cv=cv,
        scoring="f1_weighted",
    )
    cv_mean = cv_scores.mean()
    cv_std = cv_scores.std()

    print(f"\nAccuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1 Score:  {f1:.4f}")
    print(f"CV F1:     {cv_mean:.4f} +/- {cv_std:.4f}")

    report = classification_report(
        y_test,
        y_pred,
        target_names=encoder.classes_,
        zero_division=0,
    )
    reports[model_name] = report
    print("\nClassification Report:")
    print(report)

    cm = confusion_matrix(y_test, y_pred)
    display = ConfusionMatrixDisplay(
        confusion_matrix=cm,
        display_labels=encoder.classes_,
    )
    fig, ax = plt.subplots(figsize=(10, 8))
    display.plot(ax=ax, xticks_rotation=45)
    ax.set_title(f"{model_name} - Confusion Matrix")
    plt.tight_layout()
    filename = model_name.lower().replace(" ", "_") + "_confusion_matrix.png"
    plt.savefig(f"evaluation/{filename}", dpi=150)
    plt.close()

    results.append(
        {
            "Model": model_name,
            "Accuracy": round(accuracy, 4),
            "Precision": round(precision, 4),
            "Recall": round(recall, 4),
            "F1_Score": round(f1, 4),
            "CV_F1_Mean": round(cv_mean, 4),
            "CV_F1_Std": round(cv_std, 4),
        }
    )

results_df = pd.DataFrame(results).sort_values(by="F1_Score", ascending=False)

print("\n")
print("======================================")
print("MODEL COMPARISON")
print("======================================")
print(results_df.to_string(index=False))

results_df.to_csv("evaluation/model_comparison.csv", index=False)
print("\nModel comparison saved: evaluation/model_comparison.csv")

selected_model_name = results_df.iloc[0]["Model"]
selected_model = trained_models[selected_model_name]

print("\n")
print("======================================")
print("SELECTED DEVELOPMENT MODEL")
print("======================================")
print(f"Model: {selected_model_name}")
print("Selection criterion: weighted F1 Score")
print("\nWARNING: This is only a development-stage selection using the current synthetic dataset.")
print("The final research model must be selected after training on the documented research dataset.")

joblib.dump(selected_model, "models/career_model.pkl")
joblib.dump(encoder, "models/career_encoder.pkl")

metadata = {
    "model": selected_model_name,
    "target": TARGET_COLUMN,
    "features": NUMERIC_FEATURES,
    "excluded_features": EXCLUDED_FEATURES,
    "skill_min": MIN_SKILL_LEVEL,
    "skill_max": MAX_SKILL_LEVEL,
    "dataset_rows": len(df),
    "dataset_columns": len(df.columns),
    "development_only": True,
}
joblib.dump(metadata, "models/model_metadata.pkl")
print("models/model_metadata.pkl")

with open("evaluation/classification_reports.txt", "w", encoding="utf-8") as file:
    file.write("CareerAI Model Evaluation Reports\n")
    file.write("=================================\n\n")
    for model_name, report in reports.items():
        file.write(f"\n{model_name}\n")
        file.write("-" * len(model_name))
        file.write("\n")
        file.write(report)
        file.write("\n\n")

print("\n======================================")
print("TRAINING COMPLETE")
print("======================================")
print("\nGenerated:")
print("Model comparison, metrics, cross-validation, classification reports, confusion matrices, and career prediction model.")
print("\nWARNING: The current dataset is synthetic and development-only.")
