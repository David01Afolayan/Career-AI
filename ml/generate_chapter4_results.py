import json
from pathlib import Path

import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
EVALUATION_DIR = BASE_DIR / "evaluation"
RESULTS_FILE = EVALUATION_DIR / "research_results.json"
COMPARISON_FILE = EVALUATION_DIR / "final_model_comparison.csv"
OUTPUT_FILE = EVALUATION_DIR / "chapter4_ml_results.md"


def percentage(value: float) -> str:
    return f"{value * 100:.2f}%"


def main() -> None:
    if not RESULTS_FILE.exists() or not COMPARISON_FILE.exists():
        raise FileNotFoundError(
            "Run train_final.py before generating Chapter Four results."
        )

    results = json.loads(RESULTS_FILE.read_text(encoding="utf-8"))
    comparison = pd.read_csv(COMPARISON_FILE)
    lines = [
        "# Chapter Four — Machine Learning Results\n",
        "## 4.X Dataset Summary\n",
        (
            f"The final dataset contained **{results['dataset_rows']} valid "
            f"observations**. A stratified 80:20 split produced "
            f"**{results['training_rows']} training** and "
            f"**{results['testing_rows']} independent test observations**.\n"
        ),
        "## 4.X Algorithm Comparison\n",
        "| Algorithm | Accuracy | Macro Precision | Macro Recall | Macro F1 | CV Macro F1 |\n",
        "|---|---:|---:|---:|---:|---:|\n",
    ]
    for _, row in comparison.iterrows():
        lines.append(
            f"| {row['Model']} | {percentage(row['Accuracy'])} | "
            f"{percentage(row['Macro Precision'])} | "
            f"{percentage(row['Macro Recall'])} | "
            f"{percentage(row['Macro F1'])} | "
            f"{percentage(row['CV Macro F1 Mean'])} |\n"
        )
    lines.extend(
        [
            "\n## 4.X Model Selection\n",
            (
                f"The selected model was **{results['selected_model']}**, "
                "chosen using five-fold cross-validation Macro F1 on the "
                "training subset. The test subset remained independent for "
                "final evaluation.\n"
            ),
            "## 4.X Limitations\n",
            (
                "Results depend on dataset quality, size, representativeness, "
                "and class balance. CareerAI is a recommendation aid and does "
                "not determine a student's career.\n"
            ),
        ]
    )
    OUTPUT_FILE.write_text("".join(lines), encoding="utf-8")
    print(f"[OK] Chapter Four results written to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
