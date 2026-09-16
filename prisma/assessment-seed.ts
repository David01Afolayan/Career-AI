import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const questions = [
  ["HTML & CSS", "Which HTML element is used to create a hyperlink?", ["<link>", "<a>", "<href>", "<url>"], 1],
  ["HTML & CSS", "Which CSS property changes the text color?", ["font-style", "background", "color", "text-style"], 2],
  ["JavaScript", "Which keyword declares a block-scoped variable that can be reassigned?", ["var", "let", "const", "static"], 1],
  ["JavaScript", "Which method converts a JSON string into a JavaScript object?", ["JSON.parse()", "JSON.stringify()", "JSON.object()", "JSON.convert()"], 0],
  ["React", "Which hook is commonly used to manage state in a React component?", ["useState", "useRoute", "useClass", "useComponent"], 0],
  ["React", "What is used to pass data from a parent component to a child?", ["Props", "Routes", "Reducers", "Events only"], 0],
  ["Next.js", "Which framework is Next.js built on?", ["Vue", "Angular", "React", "Django"], 2],
  ["Next.js", "Which folder is commonly used for the App Router?", ["pages", "app", "routes", "views"], 1],
  ["Node.js", "What is Node.js primarily used for?", ["Server-side JavaScript", "CSS styling", "Database design only", "Image editing"], 0],
  ["Python", "Which symbol is used to create a comment in Python?", ["//", "#", "<!--", "/*"], 1],
  ["SQL", "Which SQL statement retrieves data from a table?", ["GET", "FETCH", "SELECT", "READ"], 2],
  ["Git & GitHub", "Which Git command creates a commit?", ["git save", "git commit", "git push", "git upload"], 1],
  ["Machine Learning", "Which task predicts a category such as 'Frontend Developer'?", ["Classification", "Regression", "Clustering only", "Sorting"], 0],
  ["Data Analysis", "Which Python library is widely used for tabular data analysis?", ["Pandas", "Flask", "Requests", "Tkinter"], 0],
  ["Networking", "What does IP stand for?", ["Internet Protocol", "Internal Program", "Internet Process", "Information Port"], 0],
  ["Cybersecurity", "What does phishing commonly attempt to steal?", ["User credentials", "Screen brightness", "Keyboard layout", "Monitor resolution"], 0],
  ["Communication", "Which is an important part of effective technical communication?", ["Clarity", "Using unnecessary jargon", "Avoiding questions", "Ignoring feedback"], 0],
  ["Problem Solving", "What should generally happen before implementing a solution to a programming problem?", ["Understand and analyze the problem", "Delete the project", "Skip testing", "Write random code"], 0],
] as const;

async function main() {
  console.log("Seeding assessment questions...");
  for (const [skillName, question, options, correctAnswer] of questions) {
    const skill = await db.skill.findUnique({ where: { name: skillName } });
    if (!skill) {
      console.log(`Skill not found: ${skillName}`);
      continue;
    }
    const existing = await db.assessmentQuestion.findFirst({
      where: { skillId: skill.id, question },
    });
    if (!existing) {
      await db.assessmentQuestion.create({
        data: { skillId: skill.id, question, options, correctAnswer },
      });
    }
  }
  console.log(`Assessment questions available: ${await db.assessmentQuestion.count()}`);
}

main().catch(console.error).finally(() => db.$disconnect());
