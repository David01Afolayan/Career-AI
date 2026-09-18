"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Career = { id: number; title: string; category: string; description: string; demandLevel: string; salaryRange: string | null; readiness: number; skills: { name: string; requiredLevel: number; currentLevel: number }[] };
export default function CompareCareersPage() {
  const params = useSearchParams();
  const [careers, setCareers] = useState<Career[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/careers/compare?ids=${params.get("ids") ?? ""}`).then(async (response) => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setCareers(result.careers);
    }).catch((requestError) => setError(requestError instanceof Error ? requestError.message : "Unable to compare careers."));
  }, [params]);
  const allSkills = [...new Set(careers.flatMap((career) => career.skills.map((skill) => skill.name)))];
  return <main className="min-h-screen bg-slate-950 px-6 py-10 text-white"><div className="mx-auto max-w-7xl">
    <Link href="/careers" className="text-cyan-400">← Back to Careers</Link><h1 className="mt-6 text-4xl font-bold">Career comparison</h1>
    {error ? <p className="mt-8 text-red-300">{error}</p> : careers.length === 0 ? <p className="mt-8 text-slate-400">Loading comparison...</p> : <div className="mt-8 overflow-x-auto"><table className="w-full min-w-[700px] border-separate border-spacing-2"><thead><tr><th className="p-4 text-left text-slate-400">Career</th>{careers.map((career) => <th key={career.id} className="rounded-xl bg-slate-900 p-4 text-left text-xl">{career.title}</th>)}</tr></thead><tbody>
      <tr><td className="p-4 text-slate-400">Readiness</td>{careers.map((career) => <td key={career.id} className="bg-slate-900 p-4 text-2xl font-bold text-cyan-400">{career.readiness}%</td>)}</tr>
      <tr><td className="p-4 text-slate-400">Demand / salary</td>{careers.map((career) => <td key={career.id} className="bg-slate-900 p-4">{career.demandLevel} · {career.salaryRange ?? "Salary varies"}</td>)}</tr>
      {allSkills.map((name) => <tr key={name}><td className="p-4 text-slate-400">{name}</td>{careers.map((career) => { const skill = career.skills.find((item) => item.name === name); return <td key={career.id} className="bg-slate-900 p-4">{skill ? `Current ${skill.currentLevel} / Required ${skill.requiredLevel}` : "—"}</td>; })}</tr>)}
    </tbody></table></div>}
  </div></main>;
}
