# CareerAI Student Career Guidance Research Questionnaire

## Introduction

This questionnaire collects anonymous information about Computer Science
students' academic background, technical skills, and career interests for the
development and evaluation of an AI-powered career guidance and skill
recommendation system.

Participation is voluntary. The information collected will be used for
academic research and system development. Do not provide a password, phone
number, matriculation number, name, email address, or other direct identifier.

## Section A — Academic Information

1. **What is your current CGPA?**  
   Enter a value from 0.00 to 5.00.

2. **What is your current level?**  
   Select one: 100, 200, 300, or 400.

## Section B — Technical Skills

Use this scale for every skill:

- Beginner (0)
- Basic (1)
- Intermediate (2)
- Advanced (3)

Rate your proficiency in:

- HTML & CSS
- JavaScript
- React
- Next.js
- Node.js
- Python
- Java
- C++
- SQL
- Data Analysis
- Machine Learning
- Networking
- Cybersecurity
- Git & GitHub
- Communication
- Problem Solving

## Section C — Experience

3. **How many software or technical projects have you completed?**  
   Select one: 0, 1, 2, 3, 4, or 5+. Code 5+ as `5` in the dataset.

4. **How many relevant certifications do you have?**  
   Select one: 0, 1, 2, 3, 4, or 5+. Code 5+ as `5` in the dataset.

## Section D — Interest

5. **Which technology area are you most interested in?**

- Web Development
- Data Science
- Artificial Intelligence
- Cybersecurity
- Cloud Computing
- Software Development
- Mobile Development
- Other

Keep this response in the `Interest` column, but exclude it from the primary
ML feature set because it may be closely associated with the selected career
label and introduce target leakage.

## Section E — Reference Career Label

6. **Which technology career would you most likely pursue?**

Select exactly one:

- Frontend Developer
- Backend Developer
- Full-Stack Developer
- Data Analyst
- Machine Learning Engineer
- Cybersecurity Analyst
- Cloud Engineer
- Software Developer

This response is the `Recommended_Career` reference label. It represents the
participant's stated career choice; it should not be described as an
objectively correct or objectively suitable career.
