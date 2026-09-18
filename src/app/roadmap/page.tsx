"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Resource = {
  id: string;
  title: string;
  description: string;
  url: string;
  resourceType: string;
  difficulty: string;
  progressStatus?: string;
};

type RoadmapItem = {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  importance: number;
  resources: Resource[];
};

type RoadmapData = {
  career: { id: string; name: string };
  roadmap: RoadmapItem[];
  completedSkills: {
    skill: string;
    currentLevel: number;
    requiredLevel: number;
  }[];
  totalLearningAreas: number;
};

function levelName(level: number) {
  return ["Beginner", "Intermediate", "Advance", "Professional"][level] || "Beginner";
}

export default function RoadmapPage() {
  const [data, setData] = useState<RoadmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingResource, setUpdatingResource] =
    useState<string | null>(null);

  async function updateProgress(
    resourceId: string,
    status: string
  ) {
    try {
      setUpdatingResource(resourceId);

      const response = await fetch(
        "/api/progress",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resourceId,
            status,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "Failed to update progress."
        );
      }

      const roadmapResponse =
        await fetch("/api/roadmap");
      const roadmapData =
        await roadmapResponse.json();

      setData(roadmapData);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Failed to update progress."
      );
    } finally {
      setUpdatingResource(null);
    }
  }

  useEffect(() => {
    async function loadRoadmap() {
      try {
        const response = await fetch("/api/roadmap");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to load roadmap.");
        }

        setData(result);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadRoadmap();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />
          <p className="mt-4 text-slate-400">
            Generating your personalized roadmap...
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
          <div className="text-5xl">⚠️</div>
          <h1 className="mt-4 text-2xl font-bold">Roadmap Unavailable</h1>
          <p className="mt-3 text-slate-400">
            {error || "Unable to load roadmap."}
          </p>
          <Link
            href="/assessment"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Take Assessment
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold">
            Career<span className="text-blue-400">AI</span>
          </Link>
          <div className="flex gap-4">
            <Link href="/dashboard" className="rounded-lg px-4 py-2 text-sm text-slate-300 hover:text-white">
              Dashboard
            </Link>
            <Link href="/skill-gap" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-500">
              Skill Gaps
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <Link
          href="/dashboard"
          className="inline-flex items-center rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-400 hover:text-blue-300"
        >
          ← Back to Dashboard
        </Link>

        <p className="font-semibold uppercase tracking-[0.2em] text-blue-400">PERSONALIZED LEARNING</p>
        <h1 className="mt-2 text-4xl font-bold text-white">
          Your Career Roadmap
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          A learning plan generated from your current skill level and your recommended career.
        </p>

        <div className="mt-8 rounded-3xl border border-blue-400/20 bg-blue-500/10 p-8 text-white">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
            TARGET CAREER
          </p>
          <h2 className="mt-2 text-3xl font-bold">{data.career.name}</h2>
          <p className="mt-3 text-blue-200">
            Focus on the learning areas below to close your current skill gaps.
          </p>
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm">Learning areas remaining</p>
            <p className="mt-1 text-3xl font-bold">{data.totalLearningAreas}</p>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-white">
            Recommended Learning Path
          </h2>
          <div className="mt-6 space-y-6">
            {data.roadmap.map((item, index) => {
              const progress = item.requiredLevel
                ? Math.min(
                    Math.round((item.currentLevel / item.requiredLevel) * 100),
                    100
                  )
                : 0;

              return (
                <div key={item.skill} className="rounded-3xl border border-white/10 bg-slate-900 p-7">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-400/10 font-bold text-blue-400">
                        {index + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{item.skill}</h3>
                        <p className="text-sm text-slate-400">
                          {levelName(item.currentLevel)} → {levelName(item.requiredLevel)}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-300">
                      Gap: {item.gap}
                    </span>
                  </div>

                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-400">Current progress</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-7">
                    <h4 className="font-bold text-white">Recommended Resources</h4>
                    {item.resources.length > 0 ? (
                      <div className="mt-4 grid gap-4 md:grid-cols-2">
                        {item.resources.map((resource) => (
                          <div
                            key={resource.id}
                            className="rounded-2xl border border-white/10 bg-slate-950/50 p-5 transition hover:border-blue-400 hover:shadow-md"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <h5 className="font-bold text-white">{resource.title}</h5>
                              <span className="text-xs font-semibold text-blue-600">
                                {resource.difficulty}
                              </span>
                            </div>
                            {resource.progressStatus && (
                              <span
                                className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                                  resource.progressStatus ===
                                  "COMPLETED"
                                    ? "bg-green-400/10 text-green-300"
                                    : "bg-yellow-400/10 text-yellow-300"
                                }`}
                              >
                                {resource.progressStatus ===
                                "COMPLETED"
                                  ? "✓ Completed"
                                  : "● In Progress"}
                              </span>
                            )}
                            <p className="mt-2 text-sm leading-6 text-slate-400">
                              {resource.description}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                              <a
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                              >
                                Open Resource →
                              </a>

                              <button
                                onClick={() =>
                                  updateProgress(
                                    resource.id,
                                    "IN_PROGRESS"
                                  )
                                }
                                disabled={
                                  updatingResource ===
                                  resource.id
                                }
                                className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50"
                              >
                                {updatingResource ===
                                resource.id
                                  ? "Updating..."
                                  : "Start Learning"}
                              </button>

                              <button
                                onClick={() =>
                                  updateProgress(
                                    resource.id,
                                    "COMPLETED"
                                  )
                                }
                                disabled={
                                  updatingResource ===
                                  resource.id
                                }
                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                              >
                                ✓ Complete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">
                        No resources are available for this skill yet.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {data.completedSkills.length > 0 && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-slate-900 p-7">
            <h2 className="text-2xl font-bold text-white">
              Skills You&apos;ve Already Completed
            </h2>
            <div className="mt-5 flex flex-wrap gap-3">
              {data.completedSkills.map((skill) => (
                <span
                  key={skill.skill}
                  className="rounded-full bg-green-400/10 px-4 py-2 text-sm font-semibold text-green-300"
                >
                  ✓ {skill.skill}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col justify-between gap-5 rounded-3xl border border-blue-400/20 bg-blue-500/10 p-7 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Keep improving your profile</h2>
            <p className="mt-1 text-slate-400">
              Update your assessment whenever you develop new skills.
            </p>
          </div>
          <Link
            href="/assessment"
            className="rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white hover:bg-blue-700"
          >
            Update Skills
          </Link>
        </div>
      </section>
    </main>
  );
}
