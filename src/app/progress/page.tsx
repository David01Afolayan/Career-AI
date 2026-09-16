"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProgressItem = {
  id: string;
  status: string;
  completionPercentage: number;
  updatedAt: string;
  resource: {
    title: string;
    skill: {
      name: string;
    };
  };
};

type ProgressData = {
  progress: ProgressItem[];
  totalResources: number;
  completedResources: number;
  inProgressResources: number;
  overallProgress: number;
};

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProgress() {
      try {
        const response = await fetch("/api/progress");
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to load progress.");
        }

        setData(result);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Something went wrong."
        );
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-blue-500" />
          <p className="mt-4 text-slate-400">Loading your progress...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Progress Unavailable</h1>
          <p className="mt-3 text-slate-400">{error}</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
          >
            Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-2xl font-bold">
            Career<span className="text-blue-400">AI</span>
          </Link>
          <div className="flex gap-4">
            <Link
              href="/roadmap"
              className="text-sm font-medium text-slate-300 hover:text-white"
            >
              Roadmap
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-300 hover:text-white"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="font-semibold uppercase tracking-widest text-blue-400">Learning progress</p>
        <h1 className="mt-2 text-4xl font-bold text-white">
          Track Your Progress
        </h1>
        <p className="mt-3 max-w-2xl text-slate-400">
          Monitor the resources you have started and completed on your
          personalized career roadmap.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-4">
          <ProgressStat label="Overall Progress" value={`${data.overallProgress}%`} accent="text-blue-600" />
          <ProgressStat label="Total Resources" value={data.totalResources} accent="text-white" />
          <ProgressStat label="Completed" value={data.completedResources} accent="text-green-400" />
          <ProgressStat label="In Progress" value={data.inProgressResources} accent="text-yellow-400" />
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900 p-7">
          <div className="flex justify-between">
            <h2 className="font-bold text-white">Overall Learning Progress</h2>
            <span className="font-bold text-blue-400">{data.overallProgress}%</span>
          </div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${data.overallProgress}%` }}
            />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-white">Learning Activity</h2>
          {data.progress.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
              <div className="text-5xl">📚</div>
              <h3 className="mt-4 text-xl font-bold">No learning activity yet</h3>
              <p className="mt-2 text-slate-400">
                Start a resource from your personalized roadmap to begin
                tracking your progress.
              </p>
              <Link
                href="/roadmap"
                className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white"
              >
                Open Roadmap
              </Link>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {data.progress.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/10 bg-slate-900 p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-400">
                        {item.resource.skill.name}
                      </p>
                      <h3 className="mt-1 font-bold text-white">
                        {item.resource.title}
                      </h3>
                    </div>
                    <span
                      className={`rounded-full px-4 py-2 text-sm font-semibold ${
                        item.status === "COMPLETED"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-yellow-500/10 text-yellow-400"
                      }`}
                    >
                      {item.status === "COMPLETED"
                        ? "✓ Completed"
                        : "● In Progress"}
                    </span>
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-sm">
                      <span className="text-slate-400">Completion</span>
                      <span className="font-semibold">
                        {item.completionPercentage}%
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{ width: `${item.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ProgressStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
