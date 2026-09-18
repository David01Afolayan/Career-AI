"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import StudentMenu from "@/components/StudentMenu";

type Student = {
  id: number;
  matricNumber: string | null;
  department: string | null;
  level: number | null;
  cgpa: number | null;
  projects: number;
  certifications: number;
  user: {
    name: string;
    email: string;
  };
  skills: {
    skill: {
      name: string;
    };
  }[];
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadStudents() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/admin/students");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load students");
      }

      setStudents(data.students);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  async function deleteStudent(student: Student) {
    if (!window.confirm(`Delete ${student.user.name}'s student profile?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/students/${student.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete student");
      }

      setStudents((current) => current.filter((item) => item.id !== student.id));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Failed to delete student"
      );
    }
  }

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return students;
    }

    return students.filter((student) =>
      [
        student.user.name,
        student.user.email,
        student.matricNumber,
        student.department,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [search, students]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="px-6 pt-6">
        <BackButton href="/admin" label="Back to Admin Dashboard" />
      </div>
      <nav className="border-b border-white/10 bg-slate-950">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/admin" className="text-2xl font-bold">
            Career<span className="text-blue-400">AI</span>
          </Link>
          <div className="flex items-center gap-4 text-sm text-slate-300">
            <StudentMenu role="ADMIN" />
            <Link href="/admin" className="hover:text-white">Admin Dashboard</Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
              Administration
            </p>
            <h1 className="mt-2 text-3xl font-bold md:text-4xl">
              Student Management
            </h1>
            <p className="mt-2 text-slate-400">
              View and manage registered student profiles.
            </p>
          </div>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search students..."
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-blue-400 md:w-80"
          />
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          {loading ? (
            <div className="p-10 text-center text-slate-400">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              {students.length === 0 ? "No students registered yet." : "No students match your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b border-white/10 bg-slate-950/60 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Student</th>
                    <th className="px-5 py-4">Department</th>
                    <th className="px-5 py-4">Level</th>
                    <th className="px-5 py-4">CGPA</th>
                    <th className="px-5 py-4">Projects</th>
                    <th className="px-5 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="transition hover:bg-white/5">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{student.user.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{student.user.email}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-300">{student.department || "Not set"}</td>
                      <td className="px-5 py-4 text-slate-300">{student.level ?? "Not set"}</td>
                      <td className="px-5 py-4 text-slate-300">{student.cgpa?.toFixed(2) ?? "Not set"}</td>
                      <td className="px-5 py-4 text-slate-300">{student.projects}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Link href={`/admin/students/${student.id}`} className="text-blue-400 hover:text-blue-300">
                            View
                          </Link>
                          <button onClick={() => deleteStudent(student)} className="text-red-400 hover:text-red-300">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
