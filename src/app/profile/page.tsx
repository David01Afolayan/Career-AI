"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Profile = {
  name: string;
  email: string;
  matricNumber: string | null;
  department: string | null;
  level: number | null;
  cgpa: number | null;
  interests: string | null;
  experience: string | null;
  projects: number;
  certifications: number;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    matricNumber: "",
    department: "",
    level: null,
    cgpa: null,
    interests: "",
    experience: "",
    projects: 0,
    certifications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load profile");
        }
        setProfile(data.profile);
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : "Failed to load profile"
        );
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function updateField(field: keyof Profile, value: string | number | null) {
    setProfile((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }
      setProfile(data.profile);
      setMessage("Profile updated successfully.");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <p className="text-slate-400">Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <nav className="border-b border-slate-800 bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-2xl font-bold text-cyan-400">
            CareerAI
          </Link>
          <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-slate-400">
            Keep your academic and professional information updated to improve
            your career recommendations.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4 text-green-400">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <ProfileSection title="Personal Information">
            <InputField label="Full Name" value={profile.name} onChange={(value) => updateField("name", value)} required />
            <InputField label="Email" value={profile.email} disabled />
            <InputField label="Matric Number" value={profile.matricNumber || ""} onChange={(value) => updateField("matricNumber", value)} />
            <InputField label="Department" value={profile.department || ""} onChange={(value) => updateField("department", value)} required />
          </ProfileSection>

          <ProfileSection title="Academic Information">
            <InputField label="Level" type="number" value={profile.level ?? ""} onChange={(value) => updateField("level", value === "" ? null : Number(value))} min="100" max="700" />
            <InputField label="CGPA" type="number" value={profile.cgpa ?? ""} onChange={(value) => updateField("cgpa", value === "" ? null : Number(value))} min="0" max="5" step="0.01" />
          </ProfileSection>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-6 text-xl font-semibold">Professional Information</h2>
            <div className="mb-5 grid gap-5 md:grid-cols-2">
              <InputField label="Number of Projects" type="number" value={profile.projects} onChange={(value) => updateField("projects", Number(value))} min="0" />
              <InputField label="Number of Certifications" type="number" value={profile.certifications} onChange={(value) => updateField("certifications", Number(value))} min="0" />
            </div>
            <div className="space-y-5">
              <TextAreaField label="Career Interests" placeholder="e.g. Web development, AI, cybersecurity, cloud computing..." value={profile.interests || ""} onChange={(value) => updateField("interests", value)} />
              <TextAreaField label="Experience" placeholder="Describe your internship, freelance work, jobs or other relevant experience..." value={profile.experience || ""} onChange={(value) => updateField("experience", value)} />
            </div>
          </section>

          <button type="submit" disabled={saving} className="w-full rounded-xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
            {saving ? "Saving Profile..." : "Save Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold">{title}</h2>
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  disabled = false,
  required = false,
  min,
  max,
  step,
}: {
  label: string;
  value: string | number;
  onChange?: (value: string) => void;
  type?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
  step?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400 disabled:opacity-50"
      />
    </div>
  );
}

function TextAreaField({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400"
      />
    </div>
  );
}
