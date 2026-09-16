from pathlib import Path

import pandas as pd

from features import NUMERIC_FEATURES, SKILL_FEATURES, TARGET_COLUMN


BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "data" / "career_dataset_final.csv"

EXPECTED_CAREERS = [
    "Frontend Developer",
    "Backend Developer",
    "Full-Stack Developer",
    "Data Analyst",
    "Machine Learning Engineer",
    "Cybersecurity Analyst",
    "Cloud Engineer",
    "Software Developer",
]

REQUIRED_COLUMNS = [*NUMERIC_FEATURES, "Interest", TARGET_COLUMN]


def main() -> None:
    if not DATASET_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATASET_PATH}")

    df = pd.read_csv(DATASET_PATH)
    print("=" * 60)
    print("CareerAI Final Dataset Validation")
    print("=" * 60)
    print(f"\nRows: {len(df)}")
    print(f"Columns: {len(df.columns)}")

    missing_columns = [column for column in REQUIRED_COLUMNS if column not in df]
    if missing_columns:
        raise ValueError(f"Missing columns: {missing_columns}")
    print("\n[OK] All required columns exist.")

    if df.empty:
        raise ValueError("Dataset contains no participant responses.")
    if df[TARGET_COLUMN].isna().any():
        raise ValueError(f"{TARGET_COLUMN} contains missing values.")
    unknown_careers = set(df[TARGET_COLUMN].dropna().unique()) - set(EXPECTED_CAREERS)
    if unknown_careers:
        raise ValueError(f"Unknown career labels: {unknown_careers}")
    print("[OK] Career labels are valid.")

    for column in SKILL_FEATURES:
        values = pd.to_numeric(df[column], errors="coerce")
        if values.isna().any() or not values.between(0, 3).all():
            raise ValueError(f"{column} contains values outside 0-3 or non-numeric values.")
    print("[OK] All skill values are between 0 and 3.")

    cgpa = pd.to_numeric(df["CGPA"], errors="coerce")
    if cgpa.isna().any() or not cgpa.between(0, 5).all():
        raise ValueError("CGPA contains values outside 0-5 or non-numeric values.")
    print("[OK] CGPA values are valid.")

    for column in ("Projects", "Certifications"):
        values = pd.to_numeric(df[column], errors="coerce")
        if values.isna().any() or not values.ge(0).all():
            raise ValueError(f"{column} contains invalid values.")
    print("[OK] Projects and certifications are valid.")

    print("\nCareer distribution:")
    print(df[TARGET_COLUMN].value_counts())
    print("\nMissing values:")
    print(df[REQUIRED_COLUMNS].isna().sum())
    print("\nDuplicate rows:", df.duplicated().sum())
    print("\n[OK] Dataset validation completed.")


if __name__ == "__main__":
    main()
