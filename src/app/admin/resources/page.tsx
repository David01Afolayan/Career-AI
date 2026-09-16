"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Skill = { id: number; name: string; category: string };
type Resource = {
  id: string;
  skillId: number;
  title: string;
  description: string;
  url: string;
  resourceType: string;
  difficulty: string;
  skill: Skill;
  _count: { progress: number };
};

const types = ["Documentation", "Course", "Tutorial", "Video", "Article"];
const difficulties = ["Beginner", "Intermediate", "Advanced"];
const emptyForm = {
  skillId: "",
  title: "",
  description: "",
  url: "",
  resourceType: "Tutorial",
  difficulty: "Beginner",
};

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const [resourceResponse, skillResponse] = await Promise.all([
        fetch("/api/admin/resources"),
        fetch("/api/admin/skills"),
      ]);
      const resourceData = await resourceResponse.json();
      const skillData = await skillResponse.json();
      if (!resourceResponse.ok) throw new Error(resourceData.error || "Failed to load resources");
      if (!skillResponse.ok) throw new Error(skillData.error || "Failed to load skills");
      setResources(resourceData.resources);
      setSkills(skillData.skills);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load resources");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, skillId: skills[0] ? String(skills[0].id) : "" });
    setShowForm(true);
  }

  function openEdit(resource: Resource) {
    setEditingId(resource.id);
    setForm({
      skillId: String(resource.skillId),
      title: resource.title,
      description: resource.description || "",
      url: resource.url,
      resourceType: resource.resourceType,
      difficulty: resource.difficulty,
    });
    setShowForm(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        editingId ? `/api/admin/resources/${editingId}` : "/api/admin/resources",
        {
          method: editingId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save resource");
      setShowForm(false);
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to save resource");
    } finally {
      setSaving(false);
    }
  }

  async function remove(resource: Resource) {
    if (!window.confirm(`Delete ${resource.title}?`)) return;
    const response = await fetch(`/api/admin/resources/${resource.id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || "Failed to delete resource");
      return;
    }
    setResources((current) => current.filter((item) => item.id !== resource.id));
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return resources;
    return resources.filter((resource) =>
      [resource.title, resource.description, resource.skill.name, resource.resourceType]
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [resources, search]);

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
            <h1 className="mt-2 text-4xl font-bold">Learning Resources</h1>
            <p className="mt-2 text-slate-400">Manage resources assigned to student skills.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search resources..." className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-400" />
            <button onClick={openCreate} className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500">Add Resource</button>
          </div>
        </div>
        {error && <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">{error}</div>}
        {showForm && (
          <form onSubmit={save} className="mt-8 grid gap-4 rounded-2xl border border-white/10 bg-slate-900 p-6 md:grid-cols-2">
            <h2 className="text-xl font-semibold md:col-span-2">{editingId ? "Edit Resource" : "Add Resource"}</h2>
            <select required value={form.skillId} onChange={(event) => setForm({ ...form, skillId: event.target.value })} className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"><option value="">Select skill</option>{skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select>
            <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Resource title" className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
            <input required type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://example.com/resource" className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white" />
            <select value={form.resourceType} onChange={(event) => setForm({ ...form, resourceType: event.target.value })} className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white">{types.map((type) => <option key={type}>{type}</option>)}</select>
            <select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })} className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white">{difficulties.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}</select>
            <textarea required value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white md:col-span-2" rows={3} />
            <div className="flex gap-3 md:col-span-2"><button disabled={saving} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold disabled:opacity-50">{saving ? "Saving..." : "Save Resource"}</button><button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-700 px-5 py-3 text-slate-300">Cancel</button></div>
          </form>
        )}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {loading ? <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center text-slate-400 md:col-span-2">Loading resources...</div> : filtered.length === 0 ? <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center text-slate-400 md:col-span-2">No resources found.</div> : filtered.map((resource) => (
            <article key={resource.id} className="rounded-2xl border border-white/10 bg-slate-900 p-6">
              <div className="flex items-start justify-between gap-4"><div><p className="text-sm text-blue-400">{resource.skill.name}</p><h2 className="mt-1 text-xl font-semibold">{resource.title}</h2></div><div className="flex gap-3 text-sm"><button onClick={() => openEdit(resource)} className="text-blue-400">Edit</button><button onClick={() => remove(resource)} className="text-red-400">Delete</button></div></div>
              <p className="mt-3 text-sm text-slate-400">{resource.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full bg-blue-400/10 px-3 py-1 text-blue-300">{resource.resourceType}</span><span className="rounded-full bg-slate-950 px-3 py-1 text-slate-300">{resource.difficulty}</span><span className="rounded-full bg-slate-950 px-3 py-1 text-slate-400">{resource._count.progress} progress records</span></div>
              <a href={resource.url} target="_blank" rel="noreferrer" className="mt-5 inline-block text-sm text-blue-400 hover:text-blue-300">Open resource →</a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
