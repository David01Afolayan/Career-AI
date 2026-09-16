"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const skills = [
  {
    name: "HTML & CSS",
    category: "Frontend",
  },
  {
    name: "JavaScript",
    category: "Frontend",
  },
  {
    name: "React",
    category: "Frontend",
  },
  {
    name: "Next.js",
    category: "Frontend",
  },
  {
    name: "Node.js",
    category: "Backend",
  },
  {
    name: "Python",
    category: "Programming",
  },
  {
    name: "Java",
    category: "Programming",
  },
  {
    name: "C++",
    category: "Programming",
  },
  {
    name: "SQL",
    category: "Database",
  },
  {
    name: "Data Analysis",
    category: "Data",
  },
  {
    name: "Machine Learning",
    category: "AI",
  },
  {
    name: "Networking",
    category: "Infrastructure",
  },
  {
    name: "Cybersecurity",
    category: "Security",
  },
  {
    name: "Git & GitHub",
    category: "Development Tools",
  },
  {
    name: "Communication",
    category: "Soft Skills",
  },
  {
    name: "Problem Solving",
    category: "Soft Skills",
  },
];

const levels = [
  {
    value: 0,
    label: "Beginner",
    description: "Little or no experience",
  },
  {
    value: 1,
    label: "Basic",
    description: "Understand the fundamentals",
  },
  {
    value: 2,
    label: "Intermediate",
    description: "Can build projects independently",
  },
  {
    value: 3,
    label: "Advanced",
    description: "Strong practical experience",
  },
];

export default function AssessmentPage() {
  const router = useRouter();

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const skill = skills[current];

  function selectLevel(level: number) {
    setAnswers({
      ...answers,
      [skill.name]: level,
    });
  }

  function nextQuestion() {
    if (answers[skill.name] === undefined) {
      alert("Please select your skill level.");
      return;
    }

    if (current < skills.length - 1) {
      setCurrent(current + 1);
    }
  }

  function previousQuestion() {
    if (current > 0) {
      setCurrent(current - 1);
    }
  }

  async function submitAssessment() {
    if (answers[skill.name] === undefined) {
      alert("Please select your skill level.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: answers,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Something went wrong.");
        return;
      }

      router.push("/ai-result");
      router.refresh();
    } catch {
      alert("Unable to submit assessment.");
    } finally {
      setLoading(false);
    }
  }

  const progress = ((current + 1) / skills.length) * 100;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        {/* HEADER */}

        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-400 hover:text-blue-300"
        >
          ← Back to Dashboard
        </Link>

        <div className="mb-10 text-center">
          <p className="text-sm font-medium text-blue-400">
            CAREERAI ASSESSMENT
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Evaluate Your Technical Skills
          </h1>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Rate your current ability in each skill. Your responses
            will help CareerAI identify suitable career paths.
          </p>
        </div>

        {/* PROGRESS */}

        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-400">
              Question {current + 1} of {skills.length}
            </span>

            <span className="text-blue-400">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* QUESTION CARD */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="mb-8">
            <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400">
              {skill.category}
            </span>

            <h2 className="mt-5 text-2xl font-bold">
              How would you rate your {skill.name} skill?
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Select the level that best represents your current
              practical ability.
            </p>
          </div>

          {/* LEVEL OPTIONS */}

          <div className="space-y-4">
            {levels.map((level) => {
              const selected =
                answers[skill.name] === level.value;

              return (
                <button
                  key={level.value}
                  onClick={() => selectLevel(level.value)}
                  className={`w-full rounded-xl border p-5 text-left transition ${
                    selected
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-slate-700 bg-slate-800 hover:border-slate-600"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border ${
                        selected
                          ? "border-blue-500 bg-blue-600"
                          : "border-slate-600"
                      }`}
                    >
                      {selected ? "✓" : level.value + 1}
                    </div>

                    <div>
                      <h3 className="font-semibold">
                        {level.label}
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        {level.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* BUTTONS */}

          <div className="mt-8 flex justify-between gap-4">
            <button
              onClick={previousQuestion}
              disabled={current === 0}
              className="rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Previous
            </button>

            {current === skills.length - 1 ? (
              <button
                onClick={submitAssessment}
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold hover:bg-blue-500 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : "Complete Assessment"}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold hover:bg-blue-500"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}