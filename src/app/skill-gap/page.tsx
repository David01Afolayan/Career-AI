"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentMenu from "@/components/StudentMenu";
import { BackIcon } from "@/components/BackButton";

type CareerMatch = {
  id: number;
  title: string;
  category: string;
  description: string;
  salaryRange: string | null;
  matchPercentage: number;
  requiredSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
};

type SkillGapSummary = {
  totalCareers: number;
  averageMatch: number;
  totalMissingSkills: number;
  topCareer: {
    title: string;
    matchPercentage: number;
    missingSkills: string[];
  } | null;
};

export default function SkillGapPage() {
  const [careerMatches, setCareerMatches] = useState<CareerMatch[]>([]);
  const [summary, setSummary] = useState<SkillGapSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSkillGapData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch("/api/skill-gap", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Unable to load skill gap analysis.");
        }

        setSummary(data.summary ?? null);
        setCareerMatches(data.careerMatches ?? []);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load skill gap analysis."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSkillGapData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold">
            Career<span className="text-blue-400">AI</span>
          </Link>
          <StudentMenu />
          <div className="flex items-center gap-4">
          </div>
        </div>
      </nav>

      <section className="px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-400 hover:text-blue-300"
                >
                  <span className="inline-flex items-center gap-2"><BackIcon /></span>
                </Link>

                <Link
                  href="/roadmap"
                  className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  View Learning Roadmap
                </Link>
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                skill gap analysis
              </p>

              <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
                Personalized career readiness review
              </h1>

              <p className="mt-2 max-w-2xl text-slate-400">
                Compare your current strengths against each career path and
                pinpoint the skills you still need to build.
              </p>
            </div>

            {loading && (
              <div className="rounded-2xl border border-white/10 bg-slate-900 p-10 text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-400/20 border-t-blue-400" />
                <p className="mt-4 text-slate-400">Analyzing your skill gaps...</p>
              </div>
            )}

            {!loading && error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
                {error}
              </div>
            )}

            {!loading && !error && summary && (
              <>
                <div className="mb-8 grid gap-4 md:grid-cols-3">
                  <StatCard
                    label="Average match"
                    value={`${summary.averageMatch}%`}
                    accent="text-blue-400"
                  />

                  <StatCard
                    label="Top career fit"
                    value={summary.topCareer?.title ?? "N/A"}
                    accent="text-emerald-400"
                    small={summary.topCareer ? `${summary.topCareer.matchPercentage}% fit` : undefined}
                  />

                  <StatCard
                    label="Skills to build"
                    value={String(summary.totalMissingSkills)}
                    accent="text-amber-400"
                  />
                </div>

                {careerMatches.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/20 bg-slate-900 p-10 text-center">
                    <h2 className="text-xl font-semibold text-white">
                      No analysis available yet
                    </h2>
                    <p className="mt-2 text-slate-400">
                      Complete your assessment to get a personalized skill gap report.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {careerMatches.map((career) => (
                      <div
                        key={career.id}
                        className="rounded-2xl border border-white/10 bg-slate-900 p-6"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {career.category}
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-white">
                              {career.title}
                            </h2>
                            <p className="mt-2 max-w-2xl text-slate-400">
                              {career.description}
                            </p>
                            {career.salaryRange && (
                              <p className="mt-3 text-sm text-slate-500">
                                Salary range: {career.salaryRange}
                              </p>
                            )}
                          </div>

                          <div className="min-w-[180px] rounded-xl border border-white/10 bg-slate-800 p-4 text-center">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                              Fit score
                            </p>
                            <p className="mt-2 text-3xl font-bold text-blue-400">
                              {career.matchPercentage}%
                            </p>
                          </div>
                        </div>

                        <div className="mt-5">
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-300">
                              Career match readiness
                            </span>
                            <span className="text-slate-500">
                              {career.matchPercentage}%
                            </span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
                              style={{ width: `${career.matchPercentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="mt-6 grid gap-6 md:grid-cols-2">
                          <div>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-emerald-400">
                              Matched skills
                            </h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {career.matchedSkills.length > 0 ? (
                                career.matchedSkills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-full bg-emerald-400/10 px-3 py-1 text-sm font-medium text-emerald-300"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <p className="text-sm text-slate-500">
                                  No matched skills yet.
                                </p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.15em] text-amber-400">
                              Missing skills
                            </h3>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {career.missingSkills.length > 0 ? (
                                career.missingSkills.map((skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-full bg-amber-400/10 px-3 py-1 text-sm font-medium text-amber-300"
                                  >
                                    {skill}
                                  </span>
                                ))
                              ) : (
                                <p className="text-sm text-slate-500">
                                  You already match this career profile.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
      </section>
    </main>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  accent: string;
  small?: string;
};

function StatCard({ label, value, accent, small }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {label}
      </p>
      <p className={`mt-3 text-2xl font-bold ${accent}`}>{value}</p>
      {small && <p className="mt-1 text-sm text-slate-500">{small}</p>}
    </div>
  );
}
