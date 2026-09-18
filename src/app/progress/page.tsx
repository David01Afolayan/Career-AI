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
  rating: number;
  bookmarked: boolean;
};
type ProgressResponse = {
  resources: Resource[];
  totalResources: number;
  completedResources: number;
  inProgressResources: number;
  overallProgress: number;
  weeklyGoal: number;
  weeklyCompletedResources: number;
  currentStreak: number;
};

export default function ProgressPage() {
  const [data, setData] = useState<ProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [goal, setGoal] = useState("");
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; readAt: string | null }[]>([]);

  async function loadProgress() {
    try {
      setLoading(true);
      const response = await fetch("/api/progress");
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to load progress.");
      setData(result);
      setGoal(String(result.weeklyGoal));
      const notificationResponse = await fetch("/api/notifications");
      if (notificationResponse.ok) setNotifications((await notificationResponse.json()).notifications);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }

  }

  useEffect(() => {
    loadProgress();
  }, []);

  async function updateGoal(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weeklyLearningGoal: Number(goal) }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Unable to update weekly goal.");
      return;
    }
    await loadProgress();
  }

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

  async function rate(resourceId: string, rating: number) {
    await fetch(`/api/resources/${resourceId}/feedback`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating }) });
    await loadProgress();
  }

  async function bookmark(resourceId: string) {
    await fetch(`/api/resources/${resourceId}/feedback`, { method: "PUT" });
    await loadProgress();
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
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Weekly learning goal</p>
            <form onSubmit={updateGoal} className="mt-3 flex items-center gap-3">
              <input type="number" min="1" max="50" value={goal} onChange={(event) => setGoal(event.target.value)} className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white" />
              <span className="text-slate-400">resources</span>
              <button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold">Save</button>
            </form>
            <p className="mt-3 text-sm text-slate-400">{data.weeklyCompletedResources} of {data.weeklyGoal} completed this week</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Current learning streak</p>
            <p className="mt-2 text-3xl font-bold text-orange-400">{data.currentStreak} day{data.currentStreak === 1 ? "" : "s"}</p>
            <p className="mt-1 text-sm text-slate-400">Keep updating resources to build your streak.</p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-slate-900 p-7">
          <div className="flex justify-between"><h2 className="font-bold">Overall Learning Progress</h2><span className="font-bold text-blue-400">{data.overallProgress}%</span></div>
          <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500 transition-all" style={{ width: `${data.overallProgress}%` }} /></div>
        </div>
        {notifications.length > 0 && <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6"><div className="flex items-center justify-between"><h2 className="font-bold">Progress notifications</h2><button onClick={async () => { await fetch("/api/notifications", { method: "PATCH" }); setNotifications([]); }} className="text-sm text-cyan-300">Mark all read</button></div><div className="mt-3 space-y-2">{notifications.slice(0, 3).map((notification) => <p key={notification.id} className={`rounded-lg p-3 text-sm ${notification.readAt ? "bg-slate-900 text-slate-400" : "bg-cyan-500/10 text-cyan-100"}`}><strong>{notification.title}:</strong> {notification.message}</p>)}</div></div>}

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
                  <div className="mt-4 flex items-center gap-2 text-sm"><span className="text-slate-400">Rate:</span>{[1, 2, 3, 4, 5].map((value) => <button key={value} onClick={() => rate(resource.id, value)} className={value <= resource.rating ? "text-yellow-300" : "text-slate-600"} aria-label={`Rate ${value} stars`}>★</button>)}<button onClick={() => bookmark(resource.id)} className={`ml-auto rounded-lg border px-3 py-1 ${resource.bookmarked ? "border-cyan-400 text-cyan-300" : "border-slate-700 text-slate-400"}`}>{resource.bookmarked ? "★ Bookmarked" : "☆ Bookmark"}</button></div>
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
