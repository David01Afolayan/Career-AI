import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getSkillField } from "@/lib/skill-fields";

export const dynamic = "force-dynamic";

const QUESTIONS_PER_SKILL = 5;
const PROFESSIONAL_TRACKS = [
  {
    id: "full-stack",
    name: "Full-Stack Engineer",
    skills: ["HTML & CSS", "JavaScript", "React", "Next.js", "Node.js", "SQL"],
  },
  {
    id: "frontend",
    name: "Frontend Developer",
    skills: ["HTML & CSS", "JavaScript", "React", "Next.js", "Git & GitHub"],
  },
  {
    id: "backend",
    name: "Backend Developer",
    skills: ["Node.js", "Python", "SQL", "Git & GitHub"],
  },
  {
    id: "software",
    name: "Software Developer",
    skills: ["Python", "Java", "C++", "Git & GitHub", "Problem Solving"],
  },
  {
    id: "mobile",
    name: "Mobile App Developer",
    skills: ["Java", "C++", "Git & GitHub", "Problem Solving"],
  },
  {
    id: "android",
    name: "Android Developer",
    skills: ["Java", "C++", "Git & GitHub", "SQL"],
  },
  {
    id: "ios",
    name: "iOS Developer",
    skills: ["C++", "Java", "Git & GitHub", "Problem Solving"],
  },
  {
    id: "data",
    name: "Data Analyst",
    skills: ["Python", "SQL", "Data Analysis", "Communication"],
  },
  {
    id: "machine-learning",
    name: "Machine Learning Engineer",
    skills: ["Python", "Machine Learning", "Data Analysis", "SQL"],
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity Analyst",
    skills: ["Cybersecurity", "Networking", "Python", "Problem Solving"],
  },
  {
    id: "cloud",
    name: "Cloud Engineer",
    skills: ["Networking", "Python", "Git & GitHub", "Problem Solving", "Docker"],
  },
];

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const skillIdParam = new URL(request.url).searchParams.get("skillId");
    const track = new URL(request.url).searchParams.get("track");
    const parsedSkillId = skillIdParam === null ? null : Number(skillIdParam);
    if (
      parsedSkillId !== null &&
      (!Number.isInteger(parsedSkillId) || parsedSkillId <= 0)
    ) {
      return NextResponse.json({ error: "Invalid skill selection." }, { status: 400 });
    }
    const skillId: number | null = parsedSkillId;

    const skills = (await db.skill.findMany({
      select: { id: true, name: true, category: true },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    })).map((skill) => ({ ...skill, field: getSkillField(skill.name) }));

    if (skillId === null && track !== "full-stack") {
      return NextResponse.json({
        skills,
        tracks: PROFESSIONAL_TRACKS,
        questions: [],
        totalQuestions: 0,
      });
    }

    const selectedTrack = PROFESSIONAL_TRACKS.find((item) => item.id === track);
    const selectedSkills =
      selectedTrack
        ? skills.filter((skill) => selectedTrack.skills.includes(skill.name))
        : skills.filter((skill) => skill.id === skillId);

    if (selectedSkills.length === 0) {
      return NextResponse.json({ error: "Selected skill was not found." }, { status: 404 });
    }

    const questions = await db.assessmentQuestion.findMany({
      where: { skillId: { in: selectedSkills.map((skill) => skill.id) } },
      select: {
        id: true,
        question: true,
        options: true,
        difficulty: true,
        skill: { select: { id: true, name: true, category: true } },
      },
    });

    const finalQuestions = selectedSkills.flatMap((skill) => {
      const skillQuestions = questions.filter((question) => question.skill.id === skill.id);
      const beginner = shuffle(skillQuestions.filter((question) => question.difficulty === "Beginner"));
      const intermediate = shuffle(skillQuestions.filter((question) => question.difficulty === "Intermediate"));
      const advanced = shuffle(skillQuestions.filter((question) => question.difficulty === "Advanced"));
      return shuffle([...beginner, ...intermediate, ...advanced].slice(0, QUESTIONS_PER_SKILL));
    });

    return NextResponse.json({
      questions: finalQuestions,
      skills,
      selectedSkills,
      totalQuestions: finalQuestions.length,
      questionsPerSkill: QUESTIONS_PER_SKILL,
    });
  } catch (error) {
    console.error("Assessment questions error:", error);
    return NextResponse.json(
      { error: "Failed to load assessment questions" },
      { status: 500 }
    );
  }
}
