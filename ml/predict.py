def predict_career(features):
    return {
        "career": "Software Engineer",
        "confidence": 0.87,
        "features": features,
    }


if __name__ == "__main__":
    result = predict_career({"problem_solving": 90, "creativity": 80})
    print(result)
