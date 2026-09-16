# CareerAI Dataset Documentation

## Purpose

The dataset trains and evaluates models for AI-assisted career pathway
recommendation among Computer Science students.

## Collection and privacy

Responses should be collected through the institution-approved research
procedure. The ML dataset must not contain names, matriculation numbers,
emails, phone numbers, passwords, or other direct identifiers.

## Features

The model uses CGPA, 16 proficiency scores, project count, and certification
count. Skill scores are coded as Beginner `0`, Basic `1`, Intermediate `2`, or
Advanced `3`.

`Interest` is retained for research context but excluded from the primary model
features because it may leak information about the stated career choice.

## Target

`Recommended_Career` is the participant's stated reference career label, not an
objectively verified measure of career suitability.

The allowed classes are Frontend Developer, Backend Developer, Full-Stack
Developer, Data Analyst, Machine Learning Engineer, Cybersecurity Analyst,
Cloud Engineer, and Software Developer.

## Evaluation

`ml/train_final.py` performs a stratified 80/20 split, selects among Logistic
Regression, Decision Tree, KNN, and Random Forest using 5-fold cross-validation
Macro F1, and reports held-out accuracy, Macro Precision, Macro Recall, Macro
F1, classification reports, and confusion matrices.
