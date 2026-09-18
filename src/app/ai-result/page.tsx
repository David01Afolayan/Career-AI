"use client";

import { useState } from "react";
import Link from "next/link";
import { BackIcon } from "@/components/BackButton";
import StudentMenu from "@/components/StudentMenu";

type Recommendation = {
  career: string;
  confidence: number;
};

type Prediction = {
  predicted_career: string;
  careerId: number | null;
  confidence: number;
  recommendations: Recommendation[];
};

export default function AiResultPage() {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function getRecommendation() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ml-predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate a recommendation.");
      }

      setPrediction(data.prediction);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to generate a recommendation."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">
        <div className="mb-4 flex justify-end"><StudentMenu /></div>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:border-blue-500 hover:text-white"
          >
            <span className="inline-flex items-center gap-2"><BackIcon /></span>
          </Link>

          <Link
            href="/skill-gap"
            className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            View Skill Gap Analysis
          </Link>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-blue-400">
            CAREERAI RESULTS
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Your AI Career Recommendation
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-slate-400">
            Generate a recommendation using your saved student profile and
            skills.
          </p>
        </div>

        {!prediction && (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-3xl">
              🎯
            </div>
            <h2 className="mt-5 text-xl font-semibold">
              Ready to discover your best-fit career?
            </h2>
            <button
              type="button"
              onClick={getRecommendation}
              disabled={loading}
              className="mt-6 rounded-lg bg-blue-600 px-6 py-3 font-medium transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating recommendation..." : "Get AI Recommendation"}
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-center text-sm text-red-300"
          >
            <p>{error}</p>
            <p className="mt-2 text-red-200/80">
              Complete a skill assessment to update your profile before
              requesting a recommendation.
            </p>
            <Link
              href="/assessment"
              className="mt-4 inline-flex rounded-lg bg-red-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-red-300"
            >
              Take a Skill Test →
            </Link>
          </div>
        )}

        {prediction && (
          <div className="mt-10 space-y-6">
            <section className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-8 text-center">
              <p className="text-sm text-blue-300">Recommended career</p>
              <h2 className="mt-3 text-3xl font-bold">
                {prediction.predicted_career}
              </h2>
              <p className="mt-3 text-slate-300">
                Confidence:{" "}
                <span className="font-semibold text-white">
                  {prediction.confidence}%
                </span>
              </p>
              {prediction.careerId && (
                <Link
                  href={`/careers/${prediction.careerId}`}
                  className="mt-6 inline-block rounded-lg bg-cyan-500 px-5 py-3 font-semibold text-slate-950 hover:bg-cyan-400"
                >
                  Explore This Career →
                </Link>
              )}
            </section>

            <section className="rounded-xl border border-blue-300/20 bg-blue-500/10 p-5">
              <h3 className="font-semibold text-blue-200">
                About this recommendation
              </h3>
              <p className="mt-2 text-sm leading-6 text-blue-100/80">
                CareerAI provides an AI-assisted career recommendation based on
                the information in your profile. It supports career
                exploration and does not determine your career choice. Career
                readiness is evaluated separately using the selected career&apos;s
                skill requirements.
              </p>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold">Other career matches</h2>
              <div className="mt-5 space-y-4">
                {prediction.recommendations.map((recommendation) => (
                  <div key={recommendation.career}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {recommendation.career}
                      </span>
                      <span className="text-slate-400">
                        {recommendation.confidence}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-blue-500"
                        style={{
                          width: `${Math.min(
                            Math.max(recommendation.confidence, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button
              type="button"
              onClick={getRecommendation}
              disabled={loading}
              className="w-full rounded-lg border border-slate-700 py-3 text-sm font-medium transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating..." : "Refresh Recommendation"}
            </button>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/skill-gap"
                className="inline-flex flex-1 items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Analyze Skill Gaps
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex flex-1 items-center justify-center rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-900 hover:text-white"
              >
                <BackIcon />
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
