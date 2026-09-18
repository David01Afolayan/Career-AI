"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import StudentMenu from "@/components/StudentMenu";

type Skill = { id: number; name: string };
type CareerSkill = { skill: Skill; requiredLevel: number; importance: number };
type Career = {
  id: number;
  title: string;
  category: string;
  description: string;
  requiredSkills: string;
  salaryRange: string | null;
  demandLevel: string;
  skills: CareerSkill[];
  _count: { predictions: number };
};

const emptyForm = {
  title: "",
  category: "",
  description: "",
  requiredSkills: "",
  salaryRange: "",
  demandLevel: "Medium",
};

export default function AdminCareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Career | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [requiredLevel, setRequiredLevel] = useState("3");
  const [importance, setImportance] = useState("3");

  async function load() {
    try {
      setLoading(true);
      const [careerResponse, skillResponse] = await Promise.all([
        fetch("/api/admin/careers"),
        fetch("/api/admin/skills"),
      ]);
      const careerData = await careerResponse.json();
      const skillData = await skillResponse.json();
      if (!careerResponse.ok) throw new Error(careerData.error || "Failed to load careers");
      if (!skillResponse.ok) throw new Error(skillData.error || "Failed to load skills");
      setCareers(careerData.careers);
      setSkills(skillData.skills);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load careers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(career: Career) {
    setEditing(career);
    setForm({
      title: career.title,
      category: career.category,
      description: career.description,
      requiredSkills: career.requiredSkills,
      salaryRange: career.salaryRange || "",
      demandLevel: career.demandLevel,
    });
    setShowForm(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        editing ? `/api/admin/careers/${editing.id}` : "/api/admin/careers",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save career");
      setShowForm(false);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to save career");
    } finally {
      setSaving(false);
    }
  }

  async function remove(career: Career) {
    if (!window.confirm(`Delete ${career.title}?`)) return;
    const response = await fetch(`/api/admin/careers/${career.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to delete career");
      return;
    }
    setCareers((current) => current.filter((item) => item.id !== career.id));
  }

  async function saveSkill(career: Career) {
    if (!selectedSkill) return;
    const response = await fetch(`/api/admin/careers/${career.id}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skillId: Number(selectedSkill),
        requiredLevel: Number(requiredLevel),
        importance: Number(importance),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to save career skill");
      return;
    }
    setSelectedSkill("");
    await load();
  }

  async function removeSkill(careerId: number, skillId: number) {
    await fetch(`/api/admin/careers/${careerId}/skills/${skillId}`, { method: "DELETE" });
    await load();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="px-6 pt-6">
        <BackButton href="/admin" label="Back to Admin Dashboard" />
      </div>
      <nav className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="text-2xl font-bold">Career<span className="text-blue-400">AI</span></Link>
          <div className="flex items-center gap-4">
            <StudentMenu role="ADMIN" />
            <Link href="/admin" className="text-sm text-slate-300 hover:text-white">Admin Dashboard</Link>
          </div>
        </div>
      </nav>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">Administration</p>
            <h1 className="mt-2 text-4xl font-bold">Career Management</h1>
            <p className="mt-2 text-slate-400">Manage careers, demand, and required skills.</p>
          </div>
          <button onClick={openCreate} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500">Add Career</button>
        </div>

        {error && <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>}

        {showForm && (
          <form onSubmit={save} className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-slate-900 p-6 md:grid-cols-2">
            <h2 className="text-xl font-semibold md:col-span-2">{editing ? "Edit Career" : "Add Career"}</h2>
            {(["title", "category", "salaryRange"] as const).map((field) => (
              <input key={field} value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} placeholder={field === "salaryRange" ? "Salary range (optional)" : field[0].toUpperCase() + field.slice(1)} className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-400" />
            ))}
            <select value={form.demandLevel} onChange={(event) => setForm({ ...form, demandLevel: event.target.value })} className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white">
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
            <textarea value={form.requiredSkills} onChange={(event) => setForm({ ...form, requiredSkills: event.target.value })} placeholder="Required skills, comma separated" className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white md:col-span-2" rows={2} />
            <textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white md:col-span-2" rows={4} />
            <div className="flex gap-3 md:col-span-2"><button disabled={saving} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save Career"}</button><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-700 px-5 py-3 text-slate-300">Cancel</button></div>
          </form>
        )}

        <div className="mt-8 space-y-5">
          {loading ? <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center text-slate-400">Loading careers...</div> : careers.map((career) => (
            <article key={career.id} className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row">
                <div><h2 className="text-2xl font-semibold">{career.title}</h2><p className="mt-1 text-sm text-blue-400">{career.category} · {career.demandLevel} demand</p><p className="mt-3 text-slate-400">{career.description}</p></div>
                <div className="flex h-fit gap-3"><button onClick={() => openEdit(career)} className="text-blue-400 hover:text-blue-300">Edit</button><button onClick={() => remove(career)} className="text-red-400 hover:text-red-300">Delete</button></div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">{career.requiredSkills.split(",").map((skill) => skill.trim()).filter(Boolean).map((skill) => <span key={skill} className="rounded-full bg-blue-400/10 px-3 py-1 text-sm text-blue-300">{skill}</span>)}</div>
              <div className="mt-6 border-t border-white/10 pt-5">
                <h3 className="font-semibold">Skill requirements</h3>
                <div className="mt-3 space-y-2">{career.skills.map((item) => <div key={item.skill.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-950/60 px-3 py-2 text-sm"><span>{item.skill.name}</span><span className="text-slate-400">Level {item.requiredLevel} · Importance {item.importance} <button onClick={() => removeSkill(career.id, item.skill.id)} className="ml-3 text-red-400">Remove</button></span></div>)}</div>
                <div className="mt-4 flex flex-wrap gap-2"><select value={selectedSkill} onChange={(event) => setSelectedSkill(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"><option value="">Select skill</option>{skills.filter((skill) => !career.skills.some((item) => item.skill.id === skill.id)).map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select><input value={requiredLevel} onChange={(event) => setRequiredLevel(event.target.value)} type="number" min="1" max="5" className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="Level" /><input value={importance} onChange={(event) => setImportance(event.target.value)} type="number" min="1" max="5" className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" placeholder="Importance" /><button onClick={() => saveSkill(career)} className="rounded-lg border border-blue-400 px-3 py-2 text-sm text-blue-300 hover:bg-blue-400/10">Add skill</button></div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
