"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardData = {
  user: { name: string; email: string; role: string };
  profile: {
    completion: number;
    cgpa: number | null;
    department: string | null;
    level: number | null;
    projects: number;
    certifications: number;
  };
  skills: { id: number; name: string; category: string; proficiency: number }[];
  assessment: {
    id: number;
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    createdAt: string;
  } | null;
  career: null;
  learning: {
    progress: number;
    totalResources: number;
    completedResources: number;
    inProgressResources: number;
  };
  nextAction: { title: string; description: string; href: string };
};

function proficiencyName(level: number) {
  return level >= 3 ? "Advanced" : level >= 2 ? "Intermediate" : level >= 1 ? "Basic" : "Beginner";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/dashboard", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to load dashboard.");
        setData(result);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Unable to connect to the server.");
      });
  }, []);

  if (!data && !error) {
    return <main className="min-h-screen bg-slate-950 px-6 py-16 text-center text-white"><div className="text-5xl">🚀</div><h1 className="mt-4 text-2xl font-bold">Loading CareerAI...</h1><p className="mt-2 text-slate-400">Preparing your personalized dashboard.</p></main>;
  }
  if (error || !data) {
    return <main className="min-h-screen bg-slate-950 px-6 py-16 text-white"><div className="mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center"><h1 className="text-2xl font-bold">Dashboard Error</h1><p className="mt-3 text-red-300">{error}</p><button onClick={() => window.location.reload()} className="mt-6 rounded-xl bg-white px-5 py-3 font-semibold text-slate-900">Try Again</button></div></main>;
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div><p className="text-sm font-semibold uppercase tracking-wider text-blue-400">CareerAI Dashboard</p><h1 className="mt-2 text-3xl font-bold sm:text-4xl">Welcome back, {data.user.name.split(" ")[0]} 👋</h1><p className="mt-2 text-slate-400">Track your skills, career path and learning progress.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/profile" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800">Profile</Link><Link href="/assessment" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500">Take Assessment</Link></div>
        </header>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat title="Profile Completion" value={`${data.profile.completion}%`} detail="Profile completeness" color="text-blue-400" bar={data.profile.completion} />
          <Stat title="Latest Assessment" value={data.assessment ? `${data.assessment.score}%` : "Not taken"} detail={data.assessment ? `${data.assessment.correctAnswers}/${data.assessment.totalQuestions} correct` : "Take your first assessment"} />
          <Stat title="Learning Progress" value={`${data.learning.progress}%`} detail={`${data.learning.completedResources} completed`} color="text-green-400" />
          <Stat title="Technical Skills" value={String(data.skills.length)} detail="Skills currently tracked" />
        </section>

        <section className="mt-8 rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">AI Career Recommendation</p>
          <h2 className="mt-3 text-2xl font-bold">No Career Recommendation Yet</h2>
          <p className="mt-3 text-slate-400">Complete your profile and assessment to receive an AI-powered career recommendation.</p>
          <Link href="/ai-result" className="mt-5 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500">Get Recommendation →</Link>
        </section>

        <section className="mt-8 rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-6"><p className="text-sm font-semibold uppercase tracking-wider text-yellow-400">Recommended Next Step</p><h2 className="mt-2 text-2xl font-bold">{data.nextAction.title}</h2><p className="mt-2 text-slate-400">{data.nextAction.description}</p><Link href={data.nextAction.href} className="mt-5 inline-block rounded-xl bg-yellow-500 px-6 py-3 font-bold text-slate-950 hover:bg-yellow-400">Continue →</Link></section>

        <section className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold">Your Skills</h2><p className="mt-1 text-sm text-slate-400">Current proficiency levels</p></div><Link href="/skill-gap" className="text-sm font-semibold text-blue-400">Skill Gap →</Link></div>{data.skills.length === 0 ? <div className="mt-8 rounded-xl bg-slate-950 p-6 text-center"><p className="text-slate-400">No skills have been assessed yet.</p><Link href="/assessment" className="mt-4 inline-block font-semibold text-blue-400">Start Assessment →</Link></div> : <div className="mt-6 space-y-5">{data.skills.slice(0, 6).map((skill) => <div key={skill.id}><div className="mb-2 flex justify-between"><span className="text-sm font-semibold">{skill.name}</span><span className="text-xs text-slate-400">{proficiencyName(skill.proficiency)}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${(skill.proficiency / 3) * 100}%` }} /></div></div>)}</div>}</div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8"><div className="flex items-center justify-between"><div><h2 className="text-2xl font-bold">Learning Progress</h2><p className="mt-1 text-sm text-slate-400">Your roadmap progress</p></div><Link href="/progress" className="text-sm font-semibold text-blue-400">View All →</Link></div><div className="mt-8 text-center"><p className="text-5xl font-bold">{data.learning.progress}%</p><p className="mt-2 text-slate-500">complete</p><div className="mt-6 grid grid-cols-3 gap-3">{[["Total", data.learning.totalResources, ""], ["Completed", data.learning.completedResources, "text-green-400"], ["In Progress", data.learning.inProgressResources, "text-yellow-400"]].map(([label, value, color]) => <div key={label} className="rounded-xl bg-slate-950 p-3"><p className={`text-xl font-bold ${color}`}>{value}</p><p className="text-xs text-slate-500">{label}</p></div>)}</div></div></div>
        </section>

        <section className="mt-8"><h2 className="mb-5 text-2xl font-bold">Quick Access</h2><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[["📊", "Assessment History", "Track your performance.", "/assessment/history"], ["💼", "Explore Careers", "Discover technology careers.", "/careers"], ["🗺️", "Learning Roadmap", "Build your required skills.", "/roadmap"], ["👤", "My Profile", "Update your information.", "/profile"]].map(([icon, title, description, href]) => <Link key={href} href={href} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500"><div className="text-3xl">{icon}</div><h3 className="mt-4 font-bold">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></Link>)}</div></section>
        {data.user.role === "ADMIN" && <section className="mt-8 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-purple-400">Administrator</p><h2 className="mt-1 text-xl font-bold">Manage CareerAI</h2></div><Link href="/admin" className="rounded-xl bg-purple-600 px-5 py-3 text-center font-semibold hover:bg-purple-500">Admin Dashboard →</Link></div></section>}
      </div>
    </main>
  );
}

function Stat({ title, value, detail, color = "", bar }: { title: string; value: string; detail: string; color?: string; bar?: number }) {
  return <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><p className="text-sm text-slate-400">{title}</p><p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p><p className="mt-1 text-sm text-slate-500">{detail}</p>{bar !== undefined && <div className="mt-4 h-2 rounded-full bg-slate-800"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${bar}%` }} /></div>}</div>;
}
