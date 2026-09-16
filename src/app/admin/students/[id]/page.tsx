"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type StudentDetails = {
  id: number;
  matricNumber: string | null;
  department: string | null;
  level: number | null;
  cgpa: number | null;
  interests: string | null;
  experience: string | null;
  projects: number;
  certifications: number;
  user: { name: string; email: string; role: string; createdAt: string };
  skills: { skill: { name: string } }[];
  progress: {
    status: string;
    completionPercentage: number;
    resource: { title: string };
  }[];
};

export default function AdminStudentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/students/${params.id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load student");
        }
        setStudent(data.student);
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error ? requestError.message : "Failed to load student"
        );
      });
  }, [params.id]);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
          <Link href="/admin/students" className="mt-5 inline-block text-blue-400">
            Back to students
          </Link>
        </div>
      </main>
    );
  }

  if (!student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        Loading student...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="text-2xl font-bold">
            Career<span className="text-blue-400">AI</span>
          </Link>
          <Link href="/admin/students" className="text-sm text-slate-300 hover:text-white">
            Back to Students
          </Link>
        </div>
      </nav>
      <section className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">Student details</p>
        <h1 className="mt-2 text-4xl font-bold">{student.user.name}</h1>
        <p className="mt-2 text-slate-400">{student.user.email}</p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DetailCard label="Department" value={student.department || "Not set"} />
          <DetailCard label="Level" value={student.level?.toString() || "Not set"} />
          <DetailCard label="CGPA" value={student.cgpa?.toFixed(2) || "Not set"} />
          <DetailCard label="Projects" value={student.projects.toString()} />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Academic and professional profile</h2>
            <DetailText label="Matric Number" value={student.matricNumber} />
            <DetailText label="Interests" value={student.interests} />
            <DetailText label="Experience" value={student.experience} />
            <DetailText label="Certifications" value={student.certifications.toString()} />
          </section>
          <section className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {student.skills.length ? student.skills.map(({ skill }) => (
                <span key={skill.name} className="rounded-full bg-blue-400/10 px-3 py-1 text-sm text-blue-300">{skill.name}</span>
              )) : <p className="text-slate-400">No skills added yet.</p>}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function DetailText({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="mt-5">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 whitespace-pre-wrap text-slate-300">{value || "Not set"}</p>
    </div>
  );
}
