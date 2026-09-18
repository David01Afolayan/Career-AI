"use client";

import Link from "next/link";
import BackButton from "@/components/BackButton";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Skill = { id: number; name: string; category: string };
type Question = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  difficulty: string;
  skill: Skill;
};

const difficulties = ["Beginner", "Intermediate", "Advanced"];
const emptyForm = { skillId: "", question: "", options: ["", "", "", ""], correctAnswer: 0, explanation: "", difficulty: "Beginner" };

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    try {
      const [questionsResponse, skillsResponse] = await Promise.all([
        fetch("/api/admin/questions"),
        fetch("/api/admin/skills"),
      ]);
      const questionsData = await questionsResponse.json();
      const skillsData = await skillsResponse.json();
      if (!questionsResponse.ok) throw new Error(questionsData.error || "Failed to load questions.");
      if (!skillsResponse.ok) throw new Error(skillsData.error || "Failed to load skills.");
      setQuestions(questionsData);
      setSkills(skillsData.skills);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filteredQuestions = useMemo(
    () => questions.filter((item) =>
      item.question.toLowerCase().includes(search.toLowerCase()) &&
      (!skillFilter || String(item.skill.id) === skillFilter) &&
      (!difficultyFilter || item.difficulty === difficultyFilter)
    ),
    [questions, search, skillFilter, difficultyFilter]
  );

  function resetForm() {
    setEditingId(null);
    setForm({ ...emptyForm, skillId: skills[0] ? String(skills[0].id) : "" });
  }

  function editQuestion(item: Question) {
    setEditingId(item.id);
    setForm({
      skillId: String(item.skill.id),
      question: item.question,
      options: [...item.options],
      correctAnswer: item.correctAnswer,
      explanation: item.explanation || "",
      difficulty: item.difficulty,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const options = form.options.map((option) => option.trim()).filter(Boolean);
    try {
      const response = await fetch(editingId ? `/api/admin/questions/${editingId}` : "/api/admin/questions", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, options, skillId: Number(form.skillId) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to save question.");
      resetForm();
      await loadData();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Failed to save question.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Delete this question?")) return;
    const response = await fetch(`/api/admin/questions/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) { setError(data.error || "Failed to delete question."); return; }
    await loadData();
  }

  if (loading) return <main className="min-h-screen bg-slate-950 p-8 text-white">Loading questions...</main>;

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <BackButton href="/admin" label="Back to Admin Dashboard" />
      <div className="mx-auto max-w-7xl">
        <Link href="/admin" className="text-sm text-cyan-400">← Admin Dashboard</Link>
        <h1 className="mt-4 text-3xl font-bold">Assessment Questions</h1>
        <p className="mt-2 text-slate-400">Create, edit, filter, and protect student assessment questions.</p>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">{editingId ? "Edit Question" : "Add New Question"}</h2>
          <form onSubmit={save} className="mt-5 space-y-4">
            <select required value={form.skillId} onChange={(event) => setForm({ ...form, skillId: event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3">
              <option value="">Select skill</option>
              {skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}
            </select>
            <textarea required rows={3} value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} placeholder="Enter assessment question..." className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3" />
            <div className="space-y-3">
              {form.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <button type="button" onClick={() => setForm({ ...form, correctAnswer: index })} className={`w-10 rounded-lg border ${form.correctAnswer === index ? "border-green-500 bg-green-600" : "border-slate-700"}`}>{String.fromCharCode(65 + index)}</button>
                  <input value={option} onChange={(event) => setForm({ ...form, options: form.options.map((value, optionIndex) => optionIndex === index ? event.target.value : value) })} placeholder={`Option ${String.fromCharCode(65 + index)}`} className="flex-1 rounded-lg border border-slate-700 bg-slate-950 p-3" />
                </div>
              ))}
            </div>
            <select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })} className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3">
              {difficulties.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}
            </select>
            <textarea rows={3} value={form.explanation} onChange={(event) => setForm({ ...form, explanation: event.target.value })} placeholder="Explain the correct answer..." className="w-full rounded-lg border border-slate-700 bg-slate-950 p-3" />
            <div className="flex gap-3">
              <button disabled={saving} className="rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">{saving ? "Saving..." : editingId ? "Update Question" : "Create Question"}</button>
              {editingId && <button type="button" onClick={resetForm} className="rounded-lg border border-slate-700 px-5 py-3">Cancel</button>}
            </div>
          </form>
          {error && <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-red-300">{error}</p>}
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-3">
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search questions..." className="rounded-lg border border-slate-700 bg-slate-900 p-3" />
          <select value={skillFilter} onChange={(event) => setSkillFilter(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 p-3"><option value="">All Skills</option>{skills.map((skill) => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select>
          <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="rounded-lg border border-slate-700 bg-slate-900 p-3"><option value="">All Difficulties</option>{difficulties.map((difficulty) => <option key={difficulty}>{difficulty}</option>)}</select>
        </section>

        <section className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Questions ({filteredQuestions.length})</h2>
          {filteredQuestions.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-col justify-between gap-5 md:flex-row">
                <div className="flex-1">
                  <div className="mb-3 flex gap-2 text-xs"><span className="rounded-full bg-cyan-500/10 px-3 py-1 text-cyan-300">{item.skill.name}</span><span className="rounded-full bg-slate-800 px-3 py-1">{item.difficulty}</span></div>
                  <h3 className="font-semibold">{item.question}</h3>
                  <div className="mt-4 space-y-2">{item.options.map((option, index) => <div key={index} className={`rounded-lg border p-3 ${index === item.correctAnswer ? "border-green-500 bg-green-500/10" : "border-slate-700"}`}>{String.fromCharCode(65 + index)}. {option}{index === item.correctAnswer && <span className="ml-2 text-green-300">✓ Correct</span>}</div>)}</div>
                </div>
                <div className="flex gap-2 md:flex-col"><button onClick={() => editQuestion(item)} className="rounded-lg border border-slate-700 px-4 py-2">Edit</button><button onClick={() => remove(item.id)} className="rounded-lg bg-red-600 px-4 py-2">Delete</button></div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
