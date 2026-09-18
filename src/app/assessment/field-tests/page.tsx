"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import StudentMenu from "@/components/StudentMenu";

type FieldTest = {
  id: number;
  score: number;
  correctCount: number;
  totalQuestions: number;
  skills: { skillName: string; percentage: number }[];
  assessedField: string | null;
  createdAt: string;
};

export default function FieldTestsPage() {
  const [tests, setTests] = useState<FieldTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFieldTests() {
      try {
        const response = await fetch("/api/assessment/history", {
          cache: "no-store",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Unable to load field tests.");
        }
        setTests(
          (data.assessments ?? []).filter(
            (assessment: FieldTest) => assessment.assessedField
          )
        );
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load field tests."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadFieldTests();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-4 flex justify-end">
          <StudentMenu />
        </div>

        <header>
          <p className="text-sm font-semibold uppercase tracking-wider text-cyan-400">
            CareerAI
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Field Tests Taken
          </h1>
          <p className="mt-2 text-slate-400">
            Review every technical field assessment you have completed.
          </p>
        </header>

        {loading && (
          <p className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading your field tests...
          </p>
        )}

        {error && (
          <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {!loading && !error && tests.length === 0 && (
          <section className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <div className="text-5xl">🧪</div>
            <h2 className="mt-4 text-2xl font-bold">No field tests yet</h2>
            <p className="mt-2 text-slate-400">
              Complete a field assessment and it will appear here.
            </p>
            <Link
              href="/assessment"
              className="mt-6 inline-flex rounded-xl bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500"
            >
              Take a Field Test
            </Link>
          </section>
        )}

        {!loading && !error && tests.length > 0 && (
          <section className="mt-10 grid gap-5 md:grid-cols-2">
            {tests.map((test) => (
              <article
                key={test.id}
                className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                      Field test
                    </p>
                    <h2 className="mt-2 text-2xl font-bold">
                      {test.assessedField}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400">
                      {new Date(test.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-cyan-300">
                      {test.score}%
                    </p>
                    <p className="text-xs text-slate-400">
                      {test.correctCount}/{test.totalQuestions} correct
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  {test.skills.map((skill) => (
                    <div
                      key={skill.skillName}
                      className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-sm"
                    >
                      <span className="text-slate-300">{skill.skillName}</span>
                      <span className="font-semibold text-blue-300">
                        {skill.percentage}%
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/assessment/result?assessmentId=${test.id}`}
                  className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500"
                >
                  View Full Result
                </Link>
              </article>
            ))}
          </section>
        )}

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/assessment"
            className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800"
          >
            Take New Test
          </Link>
          <Link
            href="/assessment/history"
            className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-300 hover:bg-slate-800"
          >
            All Assessment History
          </Link>
        </div>
      </div>
    </main>
  );
}
