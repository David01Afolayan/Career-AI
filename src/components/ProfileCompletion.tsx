"use client";

import { useEffect, useState } from "react";

type CompletionData = {
  completionPercentage: number;
  completedFields: number;
  totalFields: number;
  readyForRecommendation: boolean;
};

export default function ProfileCompletion() {
  const [data, setData] = useState<CompletionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompletion() {
      try {
        const response = await fetch("/api/profile/completion", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to load profile completion", error);
      } finally {
        setLoading(false);
      }
    }

    loadCompletion();
  }, []);

  if (loading || !data) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Profile Completion</h3>
          <p className="text-sm text-slate-400">
            {data.completedFields} of {data.totalFields} fields completed
          </p>
        </div>

        <span className="text-lg font-bold text-cyan-400">
          {data.completionPercentage}%
        </span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-cyan-500 transition-all duration-500"
          style={{ width: `${data.completionPercentage}%` }}
        />
      </div>

      {data.readyForRecommendation ? (
        <div className="mt-4 rounded-lg bg-green-500/10 p-3 text-sm text-green-300">
          ✓ Your profile has enough information for an AI career recommendation.
        </div>
      ) : (
        <div className="mt-4 rounded-lg bg-yellow-500/10 p-3 text-sm text-yellow-300">
          Complete your profile and add at least 3 skills to improve your
          career recommendation.
        </div>
      )}

      {!data.readyForRecommendation && (
        <a
          href="/profile"
          className="mt-4 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Complete Profile
        </a>
      )}
    </div>
  );
}
