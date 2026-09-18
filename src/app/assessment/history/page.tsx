"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import StudentMenu from "@/components/StudentMenu";

type SkillResult = { skillName: string; percentage: number };
type Assessment = {
  id: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  skills: SkillResult[];
  assessedField: string | null;
  createdAt: string;
};

type Analytics = {
  totalAttempts: number;
  latestScore: number | null;
  previousScore: number | null;
  scoreChange: number | null;
  overallChange: number | null;
  bestScore: number | null;
  averageScore: number | null;
  trend: { attempt: number; score: number; date: string }[];
};

export default function AssessmentHistoryPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
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
        setAnalytics(data.analytics || null);
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
  const improvement = analytics?.scoreChange ?? null;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex justify-end"><StudentMenu /></div>
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
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><p className="text-sm text-slate-400">Attempts</p><p className="mt-2 text-4xl font-bold">{analytics?.totalAttempts ?? assessments.length}</p></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><p className="text-sm text-slate-400">Latest Score</p><p className="mt-2 text-4xl font-bold text-blue-400">{analytics?.latestScore ?? latest.score}%</p><p className="mt-1 text-sm text-slate-500">Best: {analytics?.bestScore ?? latest.score}%</p></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6"><p className="text-sm text-slate-400">Improvement</p><p className={`mt-2 text-4xl font-bold ${improvement === null ? "text-slate-300" : improvement > 0 ? "text-green-400" : improvement < 0 ? "text-orange-400" : "text-slate-300"}`}>{improvement === null ? "—" : `${improvement > 0 ? "+" : ""}${improvement}%`}</p><p className="mt-1 text-sm text-slate-500">vs. previous attempt</p></div>
            </div>

            {analytics && analytics.trend.length > 1 && (
              <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                  <div><h2 className="text-2xl font-bold">Score Trend</h2><p className="mt-1 text-slate-400">See how your assessment performance changes over time.</p></div>
                  <p className="text-sm text-slate-400">Overall change: <span className={analytics.overallChange && analytics.overallChange > 0 ? "text-green-400" : "text-slate-300"}>{analytics.overallChange === null ? "—" : `${analytics.overallChange > 0 ? "+" : ""}${analytics.overallChange}%`}</span></p>
                </div>
                <div className="mt-6 h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.trend}><XAxis dataKey="attempt" stroke="#94a3b8" tickLine={false} /><YAxis domain={[0, 100]} stroke="#94a3b8" tickLine={false} /><Tooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }} formatter={(value) => [`${value}%`, "Score"]} labelFormatter={(label) => `Attempt ${label}`} /><Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} /></LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            <section className="mt-8">
              <h2 className="mb-5 text-2xl font-bold">All Assessment Attempts</h2>
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full min-w-[820px] text-left text-sm"><thead className="border-b border-slate-800 text-slate-400"><tr><th className="px-5 py-4">Attempt</th><th className="px-5 py-4">Field</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Score</th><th className="px-5 py-4">Change</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody>
                  {assessments.map((assessment, index) => {
                    const change = index < assessments.length - 1 ? assessment.score - assessments[index + 1].score : null;
                    return <tr key={assessment.id} className="border-b border-slate-800 last:border-0"><td className="px-5 py-4 font-semibold">#{assessments.length - index}{index === 0 && <span className="ml-2 rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-400">Latest</span>}</td><td className="px-5 py-4 text-slate-300">{assessment.assessedField ? <span className="rounded-full bg-cyan-500/10 px-2 py-1 text-xs text-cyan-300">{assessment.assessedField}</span> : <span className="text-slate-500">General assessment</span>}</td><td className="px-5 py-4 text-slate-400">{new Date(assessment.createdAt).toLocaleString()}</td><td className="px-5 py-4 font-bold text-blue-400">{assessment.score}%</td><td className={`px-5 py-4 ${change !== null && change > 0 ? "text-green-400" : "text-slate-400"}`}>{change === null ? "—" : `${change > 0 ? "+" : ""}${change}%`}</td><td className="px-5 py-4 text-right"><Link href={`/assessment/result?assessmentId=${assessment.id}`} className="mr-4 text-blue-400 hover:text-blue-300">View</Link><Link href={assessment.assessedField ? `/assessment?field=${encodeURIComponent(assessment.assessedField)}` : "/assessment"} className="text-cyan-300 hover:text-cyan-200">Retake</Link></td></tr>;
                  })}
                </tbody></table>
              </div>
            </section>
          </>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800">← Dashboard</Link>
          <Link href="/skill-gap" className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800">View Skill Gap</Link>
          <Link href="/ai-result" className="rounded-xl bg-blue-600 px-5 py-3 font-semibold hover:bg-blue-500">Update AI Career Recommendation →</Link>
        </div>
      </div>
    </main>
  );
}
