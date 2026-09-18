const fieldBySkill: Record<string, string> = {
  "HTML & CSS": "Frontend Development",
  JavaScript: "Frontend Development",
  React: "Frontend Development",
  "Next.js": "Frontend Development",
  "Node.js": "Backend Development",
  Python: "Backend Development",
  Java: "Backend Development",
  "C++": "Systems & Software Engineering",
  SQL: "Databases & Data Engineering",
  "Data Analysis": "Data & Business Intelligence",
  "Machine Learning": "Artificial Intelligence & Machine Learning",
  Networking: "Networks & Infrastructure",
  Docker: "Cloud & DevOps",
  Cybersecurity: "Cybersecurity",
  "Git & GitHub": "Software Engineering Practices",
  Communication: "Professional & Collaboration Skills",
  "Problem Solving": "Algorithms & Computer Science Foundations",
};

export function getSkillField(skillName: string): string {
  return fieldBySkill[skillName] ?? "Computer Science Foundations";
}
