"use client";

import { useState } from "react";
import Link from "next/link";

export default function CareerComparePicker({ careers }: { careers: { id: number; title: string }[] }) {
  const [selected, setSelected] = useState<number[]>([]);
  function toggle(id: number) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length < 4 ? [...current, id] : current);
  }
  return (
    <div className="mb-6 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
      <p className="font-semibold text-cyan-300">Compare careers</p>
      <p className="mt-1 text-sm text-slate-400">Select 2–4 paths to compare skills, demand and readiness.</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {careers.map((career) => (
          <button key={career.id} onClick={() => toggle(career.id)} className={`rounded-full px-3 py-2 text-sm ${selected.includes(career.id) ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300"}`}>
            {selected.includes(career.id) ? "✓ " : ""}{career.title}
          </button>
        ))}
      </div>
      <Link href={selected.length >= 2 ? `/careers/compare?ids=${selected.join(",")}` : "#"} className={`mt-4 inline-block rounded-lg px-4 py-2 text-sm font-semibold ${selected.length >= 2 ? "bg-cyan-500 text-slate-950" : "pointer-events-none bg-slate-700 text-slate-500"}`}>
        Compare selected ({selected.length})
      </Link>
    </div>
  );
}
