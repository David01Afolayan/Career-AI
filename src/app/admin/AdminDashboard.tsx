"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StudentMenu from "@/components/StudentMenu";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type CareerDistribution = { career: string; count: number };
type Statistics = {
  totalStudents: number;
  totalCareers: number;
  totalSkills: number;
  totalResources: number;
  totalAssessments: number;
  totalPredictions: number;
  careerDistribution: CareerDistribution[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const response = await fetch("/api/admin/stats");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load statistics");
        }
        setStats(data.statistics);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading admin dashboard...</p>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400">Access Error</h1>
          <p className="mt-2 text-slate-400">{error || "No statistics available."}</p>
          <Link href="/dashboard" className="mt-6 inline-block rounded-lg bg-cyan-500 px-5 py-3 text-slate-950">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="text-2xl font-bold text-cyan-400">CareerAI</Link>
          <div className="flex items-center gap-4">
            <StudentMenu role="ADMIN" />
            <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">Student View</Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-10">
          <p className="text-sm font-semibold text-cyan-400">ADMINISTRATION</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">CareerAI Admin Dashboard</h1>
          <p className="mt-2 text-slate-400">Monitor students, career recommendations, assessments and learning resources.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard title="Total Students" value={stats.totalStudents} icon="👨‍🎓" />
          <StatCard title="Careers" value={stats.totalCareers} icon="💼" />
          <StatCard title="Skills" value={stats.totalSkills} icon="🧠" />
          <StatCard title="Learning Resources" value={stats.totalResources} icon="📚" />
          <StatCard title="Assessments" value={stats.totalAssessments} icon="📝" />
          <StatCard title="AI Predictions" value={stats.totalPredictions} icon="🤖" />
        </div>

        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Career Recommendation Distribution</h2>
          <p className="mb-6 mt-1 text-sm text-slate-400">Number of AI career recommendations by career.</p>
          {stats.careerDistribution.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-slate-500">No prediction data available yet.</div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.careerDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="career" stroke="#94a3b8" angle={-20} textAnchor="end" height={80} />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="mb-5 text-2xl font-bold">System Management</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <ManagementCard title="Students" description="View and manage registered students." href="/admin/students" icon="👨‍🎓" />
            <ManagementCard title="Careers" description="Manage available technology careers." href="/admin/careers" icon="💼" />
            <ManagementCard title="Skills" description="Manage skills used by the system." href="/admin/skills" icon="🧠" />
            <ManagementCard title="Resources" description="Manage learning resources." href="/admin/resources" icon="📚" />
            <ManagementCard title="Assessment Questions" description="Create and manage student assessment questions." href="/admin/questions" icon="📝" />
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="mt-4 text-slate-400">{title}</p>
    </div>
  );
}

function ManagementCard({ title, description, href, icon }: { title: string; description: string; href: string; icon: string }) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-cyan-400">
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="text-lg font-semibold group-hover:text-cyan-400">{title}</h3>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
      <p className="mt-5 text-sm text-cyan-400">Manage →</p>
    </Link>
  );
}
