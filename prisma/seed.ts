import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const careers = [
  {
    title: "Frontend Developer",
    category: "Frontend",
    description:
      "Develop responsive and interactive user interfaces for web applications.",
    requiredSkills: "HTML & CSS, JavaScript, React, Next.js, Git & GitHub",
    salaryRange: "$60,000 - $110,000",
  },
  {
    title: "Backend Developer",
    category: "Backend",
    description:
      "Build APIs, server-side applications, databases, and backend systems.",
    requiredSkills: "Node.js, Python, SQL, APIs, Git & GitHub",
    salaryRange: "$70,000 - $130,000",
  },
  {
    title: "Full-Stack Developer",
    category: "Engineering",
    description:
      "Develop both frontend and backend components of web applications.",
    requiredSkills:
      "HTML & CSS, JavaScript, React, Next.js, Node.js, SQL, Git & GitHub",
    salaryRange: "$75,000 - $140,000",
  },
  {
    title: "Data Analyst",
    category: "Data",
    description:
      "Collect, clean, analyze, and visualize data to support decision making.",
    requiredSkills: "Python, SQL, Data Analysis, Communication",
    salaryRange: "$65,000 - $120,000",
  },
  {
    title: "Machine Learning Engineer",
    category: "AI",
    description:
      "Design and develop machine learning systems and predictive models.",
    requiredSkills: "Python, Machine Learning, Data Analysis, SQL",
    salaryRange: "$90,000 - $180,000",
  },
  {
    title: "Cybersecurity Analyst",
    category: "Security",
    description:
      "Monitor systems and help identify and respond to cybersecurity threats.",
    requiredSkills: "Cybersecurity, Networking, Python, Problem Solving",
    salaryRange: "$80,000 - $150,000",
  },
  {
    title: "Cloud Engineer",
    category: "Infrastructure",
    description:
      "Design, deploy, and maintain applications and infrastructure in cloud environments.",
    requiredSkills: "Networking, Python, Git & GitHub, Problem Solving",
    salaryRange: "$85,000 - $160,000",
  },
  {
    title: "Software Developer",
    category: "Engineering",
    description:
      "Design, develop, test, and maintain software applications.",
    requiredSkills: "Python, Java, C++, Git & GitHub, Problem Solving",
    salaryRange: "$70,000 - $135,000",
  },
];

async function main() {
  console.log("Starting database seed...");

  for (const career of careers) {
    const existingCareer = await db.career.findFirst({
      where: {
        title: career.title,
      },
    });

    if (existingCareer) {
      await db.career.update({
        where: {
          id: existingCareer.id,
        },
        data: career,
      });
    } else {
      await db.career.create({
        data: career,
      });
    }
  }

  // ================================
  // Learning Resources
  // ================================

  const resources = [
    {
      skill: "HTML & CSS",
      title: "HTML & CSS Fundamentals",
      description:
        "Learn semantic HTML, CSS fundamentals, layouts, responsive design, Flexbox and Grid.",
      url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content",
      resourceType: "Documentation",
      difficulty: "Beginner",
    },
    {
      skill: "JavaScript",
      title: "JavaScript Guide",
      description:
        "Learn variables, functions, arrays, objects, DOM manipulation, asynchronous JavaScript and modern ES6+ features.",
      url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
      resourceType: "Documentation",
      difficulty: "Beginner",
    },
    {
      skill: "React",
      title: "React Learn",
      description:
        "Learn React components, props, state, hooks and modern React development.",
      url: "https://react.dev/learn",
      resourceType: "Documentation",
      difficulty: "Intermediate",
    },
    {
      skill: "Next.js",
      title: "Next.js Learn",
      description:
        "Learn the Next.js App Router, layouts, pages, server components and full-stack features.",
      url: "https://nextjs.org/learn",
      resourceType: "Course",
      difficulty: "Intermediate",
    },
    {
      skill: "Node.js",
      title: "Node.js Learn",
      description:
        "Learn server-side JavaScript, APIs, asynchronous programming and backend development.",
      url: "https://nodejs.org/en/learn",
      resourceType: "Documentation",
      difficulty: "Intermediate",
    },
    {
      skill: "Python",
      title: "Python Tutorial",
      description:
        "Learn Python programming fundamentals, data structures, functions and modules.",
      url: "https://docs.python.org/3/tutorial/",
      resourceType: "Documentation",
      difficulty: "Beginner",
    },
    {
      skill: "SQL",
      title: "SQL Fundamentals",
      description:
        "Learn relational databases, queries, joins, filtering, grouping and database operations.",
      url: "https://www.postgresql.org/docs/current/tutorial.html",
      resourceType: "Tutorial",
      difficulty: "Beginner",
    },
    {
      skill: "Data Analysis",
      title: "Pandas Documentation",
      description:
        "Learn data manipulation, cleaning, analysis and visualization preparation using Pandas.",
      url: "https://pandas.pydata.org/docs/",
      resourceType: "Documentation",
      difficulty: "Intermediate",
    },
    {
      skill: "Machine Learning",
      title: "Scikit-learn User Guide",
      description:
        "Learn supervised learning, classification, regression, preprocessing and model evaluation.",
      url: "https://scikit-learn.org/stable/user_guide.html",
      resourceType: "Documentation",
      difficulty: "Intermediate",
    },
    {
      skill: "Networking",
      title: "Computer Networking Fundamentals",
      description:
        "Learn networking concepts including TCP/IP, DNS, HTTP, routing and network security fundamentals.",
      url: "https://www.cloudflare.com/learning/network-layer/what-is-a-protocol/",
      resourceType: "Tutorial",
      difficulty: "Beginner",
    },
    {
      skill: "Cybersecurity",
      title: "Cybersecurity Fundamentals",
      description:
        "Learn security fundamentals, common threats, authentication and defensive security concepts.",
      url: "https://www.cisa.gov/topics/cyber-threats-and-advisories",
      resourceType: "Learning",
      difficulty: "Beginner",
    },
    {
      skill: "Git & GitHub",
      title: "Git Documentation",
      description:
        "Learn Git version control, branches, commits, merging and collaborative development.",
      url: "https://git-scm.com/doc",
      resourceType: "Documentation",
      difficulty: "Beginner",
    },
    {
      skill: "Communication",
      title: "Professional Communication",
      description:
        "Improve technical communication, documentation, teamwork and professional presentation skills.",
      url: "https://www.coursera.org/articles/communication-skills",
      resourceType: "Article",
      difficulty: "Beginner",
    },
    {
      skill: "Problem Solving",
      title: "Problem Solving Practice",
      description:
        "Practice algorithms, logical thinking and programming problem solving.",
      url: "https://leetcode.com/problemset/",
      resourceType: "Practice",
      difficulty: "Intermediate",
    },
    {
      skill: "Java",
      title: "Java Documentation",
      description:
        "Learn Java syntax, object-oriented programming, collections and application development.",
      url: "https://dev.java/learn/",
      resourceType: "Tutorial",
      difficulty: "Beginner",
    },
    {
      skill: "C++",
      title: "C++ Documentation",
      description:
        "Learn C++ programming, object-oriented programming and core language concepts.",
      url: "https://cplusplus.com/doc/tutorial/",
      resourceType: "Tutorial",
      difficulty: "Beginner",
    },
  ];

  for (const skillName of [...new Set(resources.map((resource) => resource.skill))]) {
    await db.skill.upsert({
      where: {
        name: skillName,
      },
      update: {},
      create: {
        name: skillName,
      },
    });
  }

  for (const resource of resources) {
    const skill = await db.skill.findUnique({
      where: {
        name: resource.skill,
      },
    });

    if (!skill) {
      console.log(`⚠️ Skill not found: ${resource.skill}`);
      continue;
    }

    await db.learningResource.upsert({
      where: {
        id: `${skill.id}-${resource.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`,
      },
      update: {
        title: resource.title,
        description: resource.description,
        url: resource.url,
        resourceType: resource.resourceType,
        difficulty: resource.difficulty,
      },
      create: {
        id: `${skill.id}-${resource.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}`,
        skillId: skill.id,
        title: resource.title,
        description: resource.description,
        url: resource.url,
        resourceType: resource.resourceType,
        difficulty: resource.difficulty,
      },
    });
  }

  console.log(`✅ ${resources.length} learning resources created.`);

  console.log(`Seeded ${careers.length} career records.`);

  const adminPassword = await bcrypt.hash(
    "Admin@12345",
    10
  );

  const admin = await db.user.upsert({
    where: {
      email: "admin@careerai.com",
    },
    update: {
      role: "ADMIN",
    },
    create: {
      name: "CareerAI Administrator",
      email: "admin@careerai.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin account ready: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
