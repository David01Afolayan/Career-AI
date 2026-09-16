"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SkillResult = { skillName: string; percentage: number };
type Assessment = {
  id: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  skills: SkillResult[];
  createdAt: string;
};

export default function AssessmentHistoryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/assessment/history", {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Unable to load assessment history.");
          return;
        }
        setAssessments(data.assessments || []);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-5xl text-center">
          <div className="text-4xl">📊</div>
          <h1 className="mt-4 text-2xl font-bold">Loading Assessment History...</h1>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-3 text-red-300">{error}</p>
          <Link href="/dashboard" className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-slate-900">Dashboard</Link>
        </div>
      </main>
    );
  }

  const latest = assessments[0];
  const previous = assessments[1];
  const improvement = latest && previous ? latest.score - previous.score : null;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">CareerAI</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Assessment History</h1>
            <p className="mt-2 text-slate-400">Track how your technical skills develop over time.</p>
          </div>
          <Link href="/assessment" className="rounded-xl bg-blue-600 px-5 py-3 text-center font-semibold hover:bg-blue-500">Take New Assessment</Link>
        </div>

        {assessments.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="text-5xl">📝</div>
            <h2 className="mt-4 text-2xl font-bold">No Assessments Yet</h2>
            <p className="mt-2 text-slate-400">Complete your first assessment to start tracking your technical development.</p>
            <Link href="/assessment" className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold">Start Assessment</Link>
          </div>
        ) : (
          <>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><p className="text-sm text-slate-400">Assessments Completed</p><p className="mt-2 text-4xl font-bold">{assessments.length}</p></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><p className="text-sm text-slate-400">Latest Score</p><p className="mt-2 text-4xl font-bold text-blue-400">{latest.score}%</p></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><p className="text-sm text-slate-400">Score Change</p><p className={`mt-2 text-4xl font-bold ${improvement === null ? "text-slate-300" : improvement > 0 ? "text-green-400" : improvement < 0 ? "text-orange-400" : "text-slate-300"}`}>{improvement === null ? "—" : `${improvement > 0 ? "+" : ""}${improvement}%`}</p></div>
            </div>

            <section className="mt-8">
              <h2 className="mb-5 text-2xl font-bold">Your Assessments</h2>
              <div className="space-y-5">
                {assessments.map((assessment, index) => (
                  <div key={assessment.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold">Assessment #{assessments.length - index}</h3>
                          {index === 0 && <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">Latest</span>}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{new Date(assessment.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-left sm:text-right"><p className="text-3xl font-bold text-blue-400">{assessment.score}%</p><p className="text-sm text-slate-400">{assessment.correctCount}/{assessment.totalQuestions} correct</p></div>
                    </div>
                    <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${assessment.score}%` }} /></div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {assessment.skills.map((skill) => <div key={skill.skillName} className="rounded-xl bg-slate-950 p-4"><div className="flex justify-between gap-3"><span className="text-sm text-slate-300">{skill.skillName}</span><span className="text-sm font-bold text-blue-400">{skill.percentage}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${skill.percentage}%` }} /></div></div>)}
                    </div>
                    <Link href={`/assessment/result?assessmentId=${assessment.id}`} className="mt-6 inline-block text-sm font-semibold text-blue-400 hover:text-blue-300">View Full Result →</Link>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800">← Dashboard</Link>
          <Link href="/skill-gap" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800">View Skill Gap</Link>
          <Link href="/ai-result" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500">AI Career Recommendation →</Link>
        </div>
      </div>
    </main>
  );
}
