"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
type Resource = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  resourceType: string;
  difficulty: string;
  skill: { id: number; name: string; category: string };
  status: Status;
  completionPercentage: number;
};
type ProgressResponse = {
  resources: Resource[];
  totalResources: number;
  completedResources: number;
  inProgressResources: number;
  overallProgress: number;
};

export default function ProgressPage() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadProgress() {
    try {
      setLoading(true);
      const response = await fetch("/api/progress");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load progress.");
      setData(result);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProgress();
  }, []);

  async function updateProgress(resourceId: string, status: Status) {
    try {
      setUpdatingId(resourceId);
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to update progress.");
      await loadProgress();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update progress.");
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">Loading your progress...</main>;
  }

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
          <h1 className="text-2xl font-bold">Progress Unavailable</h1>
          <p className="mt-3 text-slate-400">{error || "No progress data available."}</p>
          <Link href="/dashboard" className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-3 font-semibold">Dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="text-2xl font-bold">Career<span className="text-blue-400">AI</span></Link>
          <div className="flex gap-4 text-sm text-slate-300">
            <Link href="/roadmap" className="hover:text-white">Roadmap</Link>
            <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <p className="font-semibold uppercase tracking-widest text-blue-400">Learning progress</p>
        <h1 className="mt-2 text-4xl font-bold">Track Your Progress</h1>
        <p className="mt-3 max-w-2xl text-slate-400">Monitor resources and update completion as you learn.</p>

        <div className="mt-8 grid gap-5 md:grid-cols-4">
          <ProgressStat label="Overall Progress" value={`${data.overallProgress}%`} accent="text-blue-400" />
          <ProgressStat label="Total Resources" value={data.totalResources} accent="text-white" />
          <ProgressStat label="Completed" value={data.completedResources} accent="text-green-400" />
          <ProgressStat label="In Progress" value={data.inProgressResources} accent="text-yellow-400" />
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900 p-7">
          <div className="flex justify-between"><h2 className="font-bold">Overall Learning Progress</h2><span className="font-bold text-blue-400">{data.overallProgress}%</span></div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${data.overallProgress}%` }} /></div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold">Learning Resources</h2>
          {data.resources.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-8 text-center text-slate-400">No learning resources are available yet.</div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {data.resources.map((resource) => (
                <article key={resource.id} className="rounded-2xl border border-white/10 bg-slate-900 p-6">
                  <p className="text-sm font-semibold text-blue-400">{resource.skill.name}</p>
                  <h3 className="mt-1 text-xl font-bold">{resource.title}</h3>
                  <p className="mt-2 text-sm text-slate-400">{resource.description}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-blue-400/10 px-3 py-1 text-blue-300">{resource.resourceType}</span><span className="rounded-full bg-slate-950 px-3 py-1 text-slate-300">{resource.difficulty}</span></div>
                  <div className="mt-5 flex justify-between text-sm"><span className="text-slate-400">Completion</span><span>{resource.completionPercentage}%</span></div>
                  <div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${resource.completionPercentage}%` }} /></div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <a href={resource.url} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-white/5">Open Resource</a>
                    <button disabled={updatingId === resource.id} onClick={() => updateProgress(resource.id, "IN_PROGRESS")} className="rounded-lg border border-yellow-400/40 px-3 py-2 text-sm text-yellow-300 disabled:opacity-50">In Progress</button>
                    <button disabled={updatingId === resource.id} onClick={() => updateProgress(resource.id, "COMPLETED")} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold disabled:opacity-50">Complete</button>
                    <button disabled={updatingId === resource.id} onClick={() => updateProgress(resource.id, "NOT_STARTED")} className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 disabled:opacity-50">Reset</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function ProgressStat({ label, value, accent }: { label: string; value: number | string; accent: string }) {
  return <div className="rounded-2xl border border-white/10 bg-slate-900 p-6"><p className="text-sm text-slate-400">{label}</p><p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p></div>;
}
