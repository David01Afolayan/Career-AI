"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type Resource = {
  id: string;
  title: string;
  url: string;
  resourceType: string;
  difficulty: string;
};

type CareerSkill = {
  skillId: number;
  name: string;
  category: string;
  requiredLevel: number;
  currentLevel: number;
  importance: number;
  status: string;
  resources: Resource[];
};

type CareerData = {
  career: { id: number; name: string; description: string; demandLevel: string };
  readiness: number;
  skills: CareerSkill[];
};

function levelName(level: number) {
  return ["Beginner", "Basic", "Intermediate", "Advanced"][level] || "Beginner";
}

export default function CareerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CareerData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/careers/${id}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Failed to load career");
        setData(result);
      })
      .catch((loadError) => {
        setError(loadError instanceof Error ? loadError.message : "Failed to load career");
      });
  }, [id]);

  if (error || !data) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 text-white">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          {error ? <p className="text-red-300">{error}</p> : <p className="text-slate-400">Loading career information...</p>}
          <Link href="/careers" className="mt-6 inline-block rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950">Back to Careers</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/careers" className="text-sm text-cyan-400 hover:text-cyan-300">← Back to Careers</Link>
        <section className="mt-5 rounded-3xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-cyan-400">Career Path</p>
              <h1 className="mt-3 text-4xl font-bold">{data.career.name}</h1>
              <p className="mt-4 max-w-3xl leading-7 text-slate-400">{data.career.description}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-lg bg-slate-800 px-4 py-2 text-sm">Demand: {data.career.demandLevel}</span>
                <span className="rounded-lg bg-slate-800 px-4 py-2 text-sm">{data.skills.length} Core Skills</span>
              </div>
            </div>
            <div className="flex h-36 w-36 shrink-0 flex-col items-center justify-center rounded-full border-8 border-cyan-500/20">
              <span className="text-4xl font-bold text-cyan-400">{data.readiness}%</span>
              <span className="text-xs text-slate-400">Readiness</span>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">Required Skills</h2>
          <p className="mt-1 text-slate-400">Compare your current skills with this career&apos;s requirements.</p>
          <div className="mt-5 space-y-5">
            {data.skills.map((skill) => (
              <article key={skill.skillId} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">{skill.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">Current: {levelName(skill.currentLevel)} · Required: {levelName(skill.requiredLevel)} · Importance: {skill.importance}/5</p>
                  </div>
                  <span className={`rounded-lg px-3 py-2 text-sm ${skill.status === "Completed" ? "bg-green-500/10 text-green-300" : skill.status === "High Priority" ? "bg-red-500/10 text-red-300" : "bg-yellow-500/10 text-yellow-300"}`}>{skill.status}</span>
                </div>
                <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-cyan-500" style={{ width: `${skill.requiredLevel ? Math.min((skill.currentLevel / skill.requiredLevel) * 100, 100) : 100}%` }} />
                </div>
                {skill.resources.length > 0 && (
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {skill.resources.slice(0, 3).map((resource) => (
                      <a key={resource.id} href={resource.url} target="_blank" rel="noreferrer" className="rounded-xl border border-slate-800 bg-slate-950 p-4 hover:border-cyan-500/50">
                        <p className="font-medium">{resource.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{resource.resourceType} · {resource.difficulty}</p>
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-8 text-center">
          <h2 className="text-2xl font-bold">Ready to build these skills?</h2>
          <Link href="/roadmap" className="mt-6 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-slate-950 hover:bg-cyan-400">View My Learning Roadmap</Link>
        </section>
      </div>
    </main>
  );
}
