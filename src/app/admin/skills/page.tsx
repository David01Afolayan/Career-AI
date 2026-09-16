"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";

type Skill = {
  id: number;
  name: string;
  category: string;
  description: string | null;
  _count: { students: number; careers: number; learningResources: number };
};
type Career = { id: number; title: string };

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [careers, setCareers] = useState<Career[]>([]);
  const [form, setForm] = useState({ name: "", category: "Technical", description: "" });
  const [editing, setEditing] = useState<Skill | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCareer, setSelectedCareer] = useState("");
  const [requiredLevel, setRequiredLevel] = useState("3");
  const [importance, setImportance] = useState("3");

  async function load() {
    try {
      setLoading(true);
      const [skillsResponse, careersResponse] = await Promise.all([
        fetch("/api/admin/skills"),
        fetch("/api/admin/careers"),
      ]);
      const skillsData = await skillsResponse.json();
      const careersData = await careersResponse.json();
      if (!skillsResponse.ok) throw new Error(skillsData.error || "Failed to load skills");
      if (!careersResponse.ok) throw new Error(careersData.error || "Failed to load careers");
      setSkills(skillsData.skills);
      setCareers(careersData.careers);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load skills");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ name: "", category: "Technical", description: "" });
    setShowForm(true);
  }

  function openEdit(skill: Skill) {
    setEditing(skill);
    setForm({ name: skill.name, category: skill.category, description: skill.description || "" });
    setShowForm(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    const response = await fetch(editing ? `/api/admin/skills/${editing.id}` : "/api/admin/skills", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to save skill");
      return;
    }
    setShowForm(false);
    await load();
  }

  async function remove(skill: Skill) {
    if (!window.confirm(`Delete ${skill.name}?`)) return;
    const response = await fetch(`/api/admin/skills/${skill.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to delete skill");
      return;
    }
    setSkills((current) => current.filter((item) => item.id !== skill.id));
  }

  async function assign(skill: Skill) {
    if (!selectedCareer) return;
    const response = await fetch(`/api/admin/careers/${selectedCareer}/skills`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        skillId: skill.id,
        requiredLevel: Number(requiredLevel),
        importance: Number(importance),
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to assign skill");
      return;
    }
    setSelectedCareer("");
    await load();
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="text-2xl font-bold">Career<span className="text-blue-400">AI</span></Link>
          <Link href="/admin" className="text-sm text-slate-300 hover:text-white">Admin Dashboard</Link>
        </div>
      </nav>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">Administration</p>
            <h1 className="mt-2 text-4xl font-bold">Skills Management</h1>
            <p className="mt-2 text-slate-400">Create skills and assign them to careers.</p>
          </div>
          <button onClick={openCreate} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500">Add Skill</button>
        </div>
        {error && <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>}
        {showForm && (
          <form onSubmit={save} className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-slate-900 p-6 md:grid-cols-2">
            <h2 className="text-xl font-semibold md:col-span-2">{editing ? "Edit Skill" : "Add Skill"}</h2>
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Skill name" className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
            <input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category" className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
            <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description (optional)" className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white md:col-span-2" rows={3} />
            <div className="flex gap-3 md:col-span-2"><button className="rounded-lg bg-blue-600 px-5 py-3 font-semibold">Save Skill</button><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-700 px-5 py-3 text-slate-300">Cancel</button></div>
          </form>
        )}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {loading ? <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center text-slate-400 md:col-span-2">Loading skills...</div> : skills.map((skill) => (
            <article key={skill.id} className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <div className="flex items-start justify-between gap-4">
                <div><h2 className="text-xl font-semibold">{skill.name}</h2><p className="mt-1 text-sm text-blue-400">{skill.category}</p><p className="mt-3 text-sm text-slate-400">{skill.description || "No description provided."}</p></div>
                <div className="flex gap-3 text-sm"><button onClick={() => openEdit(skill)} className="text-blue-400">Edit</button><button onClick={() => remove(skill)} className="text-red-400">Delete</button></div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs text-slate-400"><span className="rounded-lg bg-slate-950 p-2">{skill._count.students} students</span><span className="rounded-lg bg-slate-950 p-2">{skill._count.careers} careers</span><span className="rounded-lg bg-slate-950 p-2">{skill._count.learningResources} resources</span></div>
              <div className="mt-5 flex flex-wrap gap-2"><select value={selectedCareer} onChange={(event) => setSelectedCareer(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm"><option value="">Assign to career</option>{careers.map((career) => <option key={career.id} value={career.id}>{career.title}</option>)}</select><input type="number" min="1" max="5" value={requiredLevel} onChange={(event) => setRequiredLevel(event.target.value)} className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm" /><input type="number" min="1" max="5" value={importance} onChange={(event) => setImportance(event.target.value)} className="w-20 rounded-lg border border-slate-700 bg-slate-950 px-2 py-2 text-sm" /><button onClick={() => assign(skill)} className="rounded-lg border border-blue-400 px-3 py-2 text-sm text-blue-300">Assign</button></div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
