"""CareerAI ML feature configuration."""

NUMERIC_FEATURES = [
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

TARGET_COLUMN = "Recommended_Career"

EXCLUDED_FEATURES = [
    "Interest",
]

SKILL_FEATURES = [
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
]

MIN_SKILL_LEVEL = 0
MAX_SKILL_LEVEL = 3
