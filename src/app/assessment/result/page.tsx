"use client";

import Link from "next/link";
import StudentMenu from "@/components/StudentMenu";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type SkillResult = {
  skillId: number;
  skillName: string;
  total: number;
  correct: number;
  percentage: number;
  proficiency: string;
};

type AssessmentResult = {
  assessmentId: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  skills: SkillResult[];
  assessedField?: string | null;
  createdAt: string;
};

const relatedFieldsByField: Record<string, string[]> = {
  "Frontend Development": [
    "Backend Development",
    "Software Engineering Practices",
    "Cloud & DevOps",
  ],
  "Backend Development": [
    "Frontend Development",
    "Databases & Data Engineering",
    "Cloud & DevOps",
  ],
  "Artificial Intelligence & Machine Learning": [
    "Data & Business Intelligence",
    "Backend Development",
    "Algorithms & Computer Science Foundations",
  ],
  "Data & Business Intelligence": [
    "Artificial Intelligence & Machine Learning",
    "Databases & Data Engineering",
    "Backend Development",
  ],
  "Networks & Infrastructure": [
    "Cybersecurity",
    "Cloud & DevOps",
    "Backend Development",
  ],
};

export default function AssessmentResultPage() {
  const searchParams = useSearchParams();
  const assessmentId = searchParams.get("assessmentId");
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadResult() {
      if (!assessmentId) {
        setError("Assessment ID is missing.");
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`/api/assessment/${assessmentId}`);
        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Unable to load result.");
          return;
        }
        setResult(data);
      } catch {
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [assessmentId]);

  if (loading) {
    return <main className="min-h-screen bg-slate-950 px-6 py-16 text-center text-white"><div className="text-4xl">📊</div><h1 className="mt-4 text-2xl font-bold">Calculating Your Results...</h1><p className="mt-2 text-slate-400">Analyzing your technical proficiency.</p></main>;
  }

  if (error || !result) {
    return <main className="min-h-screen bg-slate-950 px-6 py-16 text-white"><div className="mx-auto max-w-xl rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center"><h1 className="text-2xl font-bold">Unable to Load Results</h1><p className="mt-3 text-red-300">{error || "Result not found."}</p><Link href="/assessment" className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-slate-900">Take Assessment Again</Link></div></main>;
  }

  const strongestSkill = result.skills[0];
  const weakestSkill = result.skills[result.skills.length - 1];
  const fieldTest = searchParams.get("fieldTest") === "true";
  const fieldPassed = fieldTest && result.skills.length > 0 && result.score >= 60;
  const relatedFields = result.assessedField
    ? relatedFieldsByField[result.assessedField] ?? []
    : [];
  const retakeHref = result.assessedField
    ? `/assessment?field=${encodeURIComponent(result.assessedField)}`
    : "/assessment";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex justify-end"><StudentMenu /></div>
        <div className="text-center">
          <div className="text-5xl">🎉</div>
          <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-blue-400">Assessment Completed</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Your Technical Assessment Results</h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">Your results have been saved and will be used to improve your CareerAI recommendations.</p>
        </div>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center"><p className="text-sm text-slate-400">Overall Score</p><p className="mt-3 text-5xl font-bold text-blue-400">{Math.round(result.score)}%</p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center"><p className="text-sm text-slate-400">Correct Answers</p><p className="mt-3 text-4xl font-bold">{result.correctCount}<span className="text-xl text-slate-500">/{result.totalQuestions}</span></p></div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center"><p className="text-sm text-slate-400">Skills Assessed</p><p className="mt-3 text-4xl font-bold">{result.skills.length}</p></div>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6"><p className="text-sm font-semibold text-green-400">Strongest Skill</p>{strongestSkill && <><h2 className="mt-2 text-2xl font-bold">{strongestSkill.skillName}</h2><p className="mt-2 text-slate-400">{strongestSkill.percentage}% proficiency</p></>}</div>
          <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6"><p className="text-sm font-semibold text-orange-400">Area to Improve</p>{weakestSkill && <><h2 className="mt-2 text-2xl font-bold">{weakestSkill.skillName}</h2><p className="mt-2 text-slate-400">{weakestSkill.percentage}% proficiency</p></>}</div>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <h2 className="text-2xl font-bold">Skill Proficiency</h2>
          <p className="mt-1 text-slate-400">Your estimated proficiency based on assessment performance.</p>
          <div className="mt-6 space-y-6">
            {result.skills.map((skill) => <div key={skill.skillId}><div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row"><div><p className="font-semibold">{skill.skillName}</p><p className="text-sm text-slate-500">{skill.correct}/{skill.total} correct</p></div><div className="flex items-center gap-3"><span className="text-sm text-slate-400">{skill.proficiency}</span><span className="font-bold text-blue-400">{skill.percentage}%</span></div></div><div className="h-3 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-blue-500" style={{ width: `${skill.percentage}%` }} /></div></div>)}
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 p-6 text-center sm:p-8">
          <h2 className="text-2xl font-bold">{!fieldTest || fieldPassed ? "You are ready to discover your career path" : "Build your foundation before career matching"}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-slate-400">
            {!fieldTest
              ? "CareerAI can now use your updated skill profile to generate an AI-powered career recommendation."
              : fieldPassed
              ? `Your ${result.assessedField} field test score meets the required 60% threshold.`
              : "Your field test score is below the required 60% threshold. Complete the general assessment to build a broader skill profile."}
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href={retakeHref} className="rounded-xl border border-cyan-500/50 px-6 py-3 font-semibold text-cyan-300 hover:bg-cyan-500/10">
              Retake Assessment
            </Link>
            <Link href={fieldPassed ? "/ai-result" : "/assessment"} className="rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500">
              {!fieldTest || fieldPassed ? "Update AI Career Recommendation →" : "Take General Assessment →"}
            </Link>
            <Link href="/profile" className="rounded-xl border border-cyan-500/50 px-6 py-3 font-semibold text-cyan-300 hover:bg-cyan-500/10">
              View Updated Skill Profile
            </Link>
            <Link href="/dashboard" aria-label="Back to Dashboard" title="Back to Dashboard" className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800">
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path d="M19 12H5" />
                <path d="m12 19-7-7 7-7" />
              </svg>
            </Link>
          </div>
        </section>

        {fieldPassed && relatedFields.length > 0 && (
          <section className="mt-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6 sm:p-8">
            <h2 className="text-2xl font-bold">Related fields you can explore</h2>
            <p className="mt-2 text-slate-400">
              Your score qualifies you for an AI career recommendation. These
              related fields are also worth exploring:
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {relatedFields.map((relatedField) => (
                <Link
                  key={relatedField}
                  href={`/assessment?field=${encodeURIComponent(relatedField)}`}
                  className="rounded-full border border-cyan-400/40 px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10"
                >
                  {relatedField}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
