"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type DashboardData = {
  user: { name: string; email: string; role: string; profileImage: string | null };
  profileCompletion: number;
  latestAssessment: { score: number; date: string } | null;
  assessmentStats: { total: number; averageScore: number; latestScore: number | null };
  assessmentScores: { id: number; score: number; date: string }[];
  latestPrediction: { career: string; confidence: number; careerId: number; date: string } | null;
  careerHistory: { id: number; career: string; confidence: number; careerId: number; date: string }[];
  skills: { skill: string; level: number; category: string }[];
  strongestSkills: { skill: string; level: number }[];
  improvementSkills: { skill: string; level: number }[];
  learning: { totalResources: number; completedResources: number; inProgressResources: number; progress: number; weeklyGoal: number; weeklyCompletedResources: number; currentStreak: number };
  nextAction: { title: string; description: string; href: string };
};

function levelName(level: number) {
  return level === 3 ? "Professional" : level === 2 ? "Advance" : level === 1 ? "Intermediate" : "Beginner";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load dashboard.");
        setData(result);
      })
      .catch((requestError) => {
        setError(requestError instanceof Error ? requestError.message : "Unable to load dashboard.");
      });
  }, []);

  if (!data && !error) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading dashboard...</main>;
  }
  if (!data) {
    return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-center text-white"><div><h1 className="text-2xl font-bold">Dashboard Error</h1><p className="mt-2 text-red-300">{error}</p><button onClick={() => window.location.reload()} className="mt-5 rounded-lg bg-white px-5 py-3 font-semibold text-slate-900">Try Again</button></div></main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {navigationOpen && (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setNavigationOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/70"
          />
        )}
        <aside
          className={`fixed right-0 top-0 z-50 h-full w-80 max-w-[90vw] transform border-l border-slate-800 bg-slate-900 p-6 shadow-2xl transition-transform duration-300 ${
            navigationOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-4xl font-bold text-white ring-2 ring-blue-400/40">
                {data.user.profileImage ? (
                  <img src={data.user.profileImage} alt={`${data.user.name}'s profile`} className="h-full w-full object-cover" />
                ) : (
                  data.user.name.trim().charAt(0).toUpperCase() || "U"
                )}
              </div>
              <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">Account Menu</p>
              <p className="mt-1 font-semibold">{data.user.name}</p>
              </div>
            </div>
            <button type="button" aria-label="Close navigation" onClick={() => setNavigationOpen(false)} className="rounded-lg p-2 text-2xl text-slate-400 hover:bg-slate-800 hover:text-white">×</button>
          </div>
          <nav className="mt-6 space-y-2" aria-label="Student navigation">
            {[
              ["Dashboard", "/dashboard"],
              ["Profile", "/profile"],
              ["Skill Assessment", "/assessment"],
              ["Assessment History", "/assessment/history"],
              ["Career Recommendations", "/ai-result"],
              ["Careers", "/careers"],
              ["Skill Gap", "/skill-gap"],
              ["Learning Roadmap", "/roadmap"],
              ["Progress", "/progress"],
            ].map(([label, href]) => (
              <Link key={href} href={href} onClick={() => setNavigationOpen(false)} className="block rounded-xl px-4 py-3 font-medium text-slate-300 hover:bg-blue-500/10 hover:text-white">{label}</Link>
            ))}
          </nav>
          <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="mt-8 w-full rounded-xl border border-red-500/40 px-4 py-3 text-left font-semibold text-red-300 hover:bg-red-500/10">Sign Out</button>
        </aside>
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-blue-400">Student Dashboard</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Welcome, {data.user.name}</h1><p className="mt-2 text-slate-400">Track your skills, assessments, recommendations and learning progress.</p></div>
          <div className="flex items-center gap-3">
            <button type="button" aria-label="Open profile navigation" onClick={() => setNavigationOpen(true)} className="flex h-28 w-28 items-center justify-center rounded-full bg-blue-600 text-4xl font-bold text-white ring-2 ring-blue-400/40 transition hover:bg-blue-500">
              {data.user.profileImage ? <img src={data.user.profileImage} alt={`${data.user.name}'s profile`} className="h-full w-full rounded-full object-cover" /> : data.user.name.trim().charAt(0).toUpperCase() || "U"}
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat title="Profile Completion" value={`${data.profileCompletion}%`} detail="Profile completeness" progress={data.profileCompletion} />
          <Stat title="Latest Assessment" value={data.latestAssessment ? `${data.latestAssessment.score}%` : "—"} detail={`${data.assessmentStats.total} assessment${data.assessmentStats.total === 1 ? "" : "s"}`} />
          <Stat title="Learning Progress" value={`${data.learning.progress}%`} detail={`${data.learning.completedResources} completed`} />
          <Stat title="AI Career Match" value={data.latestPrediction?.career || "Not available"} detail={data.latestPrediction ? `${data.latestPrediction.confidence}% confidence` : "Complete an assessment"} />
        </section>

        <section className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6"><p className="text-sm font-semibold uppercase tracking-wider text-yellow-400">Recommended Next Step</p><h2 className="mt-2 text-2xl font-bold">{data.nextAction.title}</h2><p className="mt-2 text-slate-400">{data.nextAction.description}</p><Link href={data.nextAction.href} className="mt-5 inline-block rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-950">Continue →</Link></section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <ChartCard title="Assessment Performance" empty={data.assessmentScores.length === 0}><ResponsiveContainer width="100%" height={280}><LineChart data={data.assessmentScores}><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis dataKey="date" stroke="#94a3b8" /><YAxis domain={[0, 100]} stroke="#94a3b8" /><Tooltip /><Line type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={3} /></LineChart></ResponsiveContainer></ChartCard>
          <ChartCard title="Skill Proficiency" empty={data.skills.length === 0}><ResponsiveContainer width="100%" height={280}><BarChart data={data.skills} layout="vertical"><CartesianGrid strokeDasharray="3 3" stroke="#334155" /><XAxis type="number" domain={[0, 3]} ticks={[0, 1, 2, 3]} stroke="#94a3b8" /><YAxis type="category" dataKey="skill" width={110} stroke="#94a3b8" /><Tooltip /><Bar dataKey="level" fill="#3b82f6" /></BarChart></ResponsiveContainer></ChartCard>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <SkillList title="Strongest Skills" items={data.strongestSkills} tone="green" />
          <SkillList title="Skills to Improve" items={data.improvementSkills} tone="yellow" />
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><h2 className="text-xl font-bold">Career Recommendation History</h2><p className="text-sm text-slate-400">Previous AI career recommendations.</p></div><Link href="/ai-result" className="text-sm font-semibold text-blue-400">Get New Recommendation →</Link></div>{data.careerHistory.length === 0 ? <p className="mt-5 text-slate-400">No career recommendations yet.</p> : <div className="mt-5 overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-slate-700 text-sm text-slate-400"><th className="px-3 py-3">Career</th><th className="px-3 py-3">Confidence</th><th className="px-3 py-3">Date</th></tr></thead><tbody>{data.careerHistory.map((item) => <tr key={item.id} className="border-b border-slate-800 last:border-0"><td className="px-3 py-4 font-medium">{item.career}</td><td className="px-3 py-4">{item.confidence}%</td><td className="px-3 py-4 text-slate-400">{item.date}</td></tr>)}</tbody></table></div>}</section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="text-xl font-bold">Learning Progress</h2><p className="mt-1 text-sm text-slate-400">Continue working through your roadmap resources.</p></div><Link href="/roadmap" className="rounded-lg bg-blue-600 px-5 py-3 text-center font-semibold">Open Roadmap →</Link></div><div className="mt-6 flex justify-between text-sm"><span>Overall Progress</span><span>{data.learning.progress}%</span></div><div className="mt-2 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${data.learning.progress}%` }} /></div><div className="mt-5 grid gap-4 sm:grid-cols-5">{[["Resources", data.learning.totalResources], ["Completed", data.learning.completedResources], ["In Progress", data.learning.inProgressResources], ["Weekly Goal", `${data.learning.weeklyCompletedResources}/${data.learning.weeklyGoal}`], ["Streak", `${data.learning.currentStreak} day${data.learning.currentStreak === 1 ? "" : "s"}`]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-950 p-4"><p className="text-2xl font-bold">{value}</p><p className="text-sm text-slate-400">{label}</p></div>)}</div></section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{[["Assessment", "/assessment"], ["History", "/assessment/history"], ["Careers", "/careers"], ["Skill Gap", "/skill-gap"], ["Profile", "/profile"]].map(([label, href]) => <Link key={href} href={href} className="rounded-xl border border-slate-800 bg-slate-900 p-5 font-semibold transition hover:border-blue-500">{label}<p className="mt-2 text-sm font-normal text-slate-400">Open {label}</p></Link>)}</section>
        {data.user.role === "ADMIN" && <section className="mt-8 rounded-2xl bg-slate-900 p-6"><h2 className="text-xl font-bold">Administration</h2><Link href="/admin" className="mt-4 inline-block rounded-lg bg-white px-4 py-2 font-medium text-slate-900">Admin Dashboard</Link></section>}
      </div>
    </main>
  );
}

function Stat({ title, value, detail, progress }: { title: string; value: string; detail: string; progress?: number }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-sm text-slate-400">{title}</p><p className="mt-2 truncate text-3xl font-bold">{value}</p><p className="mt-2 text-sm text-slate-500">{detail}</p>{progress !== undefined && <div className="mt-4 h-2 rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${progress}%` }} /></div>}</div>;
}

function ChartCard({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-bold">{title}</h2>{empty ? <div className="flex h-72 items-center justify-center text-slate-400">No data available yet.</div> : <div className="mt-4">{children}</div>}</div>;
}

function SkillList({ title, items, tone }: { title: string; items: { skill: string; level: number }[]; tone: "green" | "yellow" }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><h2 className="text-xl font-bold">{title}</h2><div className="mt-5 space-y-3">{items.length === 0 ? <p className="text-slate-400">No data available yet.</p> : items.map((item) => <div key={item.skill} className="flex items-center justify-between rounded-lg border border-slate-800 p-3"><span>{item.skill}</span><span className={`rounded-full px-3 py-1 text-sm ${tone === "green" ? "bg-green-500/10 text-green-300" : "bg-yellow-500/10 text-yellow-300"}`}>{levelName(item.level)}</span></div>)}</div></div>;
}
