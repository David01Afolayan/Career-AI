import pandas as pd


def load_data(path: str) -> pd.DataFrame:
    return pd.read_csv(path)


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df = df.dropna()
    df = df.reset_index(drop=True)
    return df


if __name__ == "__main__":
    sample = load_data("ml/dataset/sample_data.csv")
    print(clean_data(sample).head())
