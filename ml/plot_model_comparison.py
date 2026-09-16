from pathlib import Path

import matplotlib.pyplot as plt
import pandas as pd


BASE_DIR = Path(__file__).resolve().parent
RESULTS_FILE = BASE_DIR / "evaluation" / "final_model_comparison.csv"
OUTPUT_FILE = BASE_DIR / "evaluation" / "model_comparison.png"


def main() -> None:
    if not RESULTS_FILE.exists():
        raise FileNotFoundError("final_model_comparison.csv not found.")

    results = pd.read_csv(RESULTS_FILE)
    metrics = ["Accuracy", "Macro Precision", "Macro Recall", "Macro F1"]
    figure, axis = plt.subplots(figsize=(12, 7))
    positions = range(len(results))
    width = 0.18
    for index, metric in enumerate(metrics):
        offsets = [
            position + (index - (len(metrics) - 1) / 2) * width
            for position in positions
        ]
        axis.bar(offsets, results[metric], width=width, label=metric)
    axis.set_xlabel("Machine Learning Algorithm")
    axis.set_ylabel("Score")
    axis.set_title("CareerAI Machine Learning Algorithm Comparison")
    axis.set_xticks(list(positions), results["Model"], rotation=20, ha="right")
    axis.set_ylim(0, 1)
    axis.legend()
    figure.tight_layout()
    figure.savefig(OUTPUT_FILE, dpi=200)
    plt.close(figure)
    print(f"[OK] Chart saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
