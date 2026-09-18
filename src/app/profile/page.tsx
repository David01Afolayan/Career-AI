"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Profile = {
  name: string;
  email: string;
  profileImage: string | null;
  matricNumber: string | null;
  department: string | null;
  level: number | null;
  cgpa: number | null;
  interests: string | null;
  experience: string | null;
  projects: number;
  certifications: number;
  skills: StudentSkill[];
};

type StudentSkill = {
  skillId: number;
  proficiencyLevel: number;
};

type AvailableSkill = {
  id: number;
  name: string;
  category: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({
    name: "",
    email: "",
    profileImage: null,
    matricNumber: "",
    department: "",
    level: null,
    cgpa: null,
    interests: "",
    experience: "",
    projects: 0,
    certifications: 0,
    skills: [],
  });
  const [availableSkills, setAvailableSkills] = useState<AvailableSkill[]>([]);
  const [assessedSkillIds, setAssessedSkillIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch("/api/profile");
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load profile");
        }
        const assessedIds = new Set<number>(data.assessedSkillIds ?? []);
        setProfile({
          ...data.profile,
          skills: (data.profile.skills ?? [])
            .map((skill: StudentSkill & { skill?: { id: number } }) => ({
              skillId: skill.skillId ?? skill.skill?.id,
              proficiencyLevel: skill.proficiencyLevel,
            }))
            .filter((skill: StudentSkill) => assessedIds.has(skill.skillId)),
        });
        setAvailableSkills(
          (data.skills ?? []).filter((skill: AvailableSkill) =>
            assessedIds.has(skill.id)
          )
        );
        setProfileImage(data.profile.profileImage ?? null);
        setAssessedSkillIds(Array.from(assessedIds));
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

  function updateField(
    field: keyof Profile,
    value: string | number | null | StudentSkill[]
  ) {
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
      setProfileImage(data.profile.profileImage ?? null);
      setEditing(false);
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
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Edit profile"
              title="Edit profile"
              className={`rounded-lg p-2 text-white ${
                editing
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-blue-600 hover:bg-blue-500"
              }`}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-5 w-5"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z" />
              </svg>
            </button>
            <Link href="/dashboard" className="text-sm text-slate-300 hover:text-white">
              <span className="inline-flex items-center gap-2">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
                Back to Dashboard
              </span>
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-10">
        <section className="mb-8 flex items-center gap-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-blue-600 text-3xl font-bold">
            {profileImage ? <img src={profileImage} alt="Profile" className="h-full w-full object-cover" /> : profile.name.trim().charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <h2 className="text-xl font-semibold">Profile Picture</h2>
            <p className="mt-1 text-sm text-slate-400">JPG, PNG, or WebP up to 2 MB.</p>
            {editing && (
              <label className={`mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 ${uploadingImage ? "cursor-not-allowed opacity-50" : ""}`}>
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path d="M12 16V4" />
                  <path d="m7 9 5-5 5 5" />
                  <path d="M5 20h14" />
                </svg>
                {uploadingImage ? "Uploading..." : "Upload Image"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={uploadingImage}
                  onChange={async (event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    setUploadingImage(true);
                    setError("");
                    const formData = new FormData();
                    formData.append("image", file);
                    const response = await fetch("/api/profile/image", { method: "POST", body: formData });
                    const data = await response.json();
                    if (response.ok) {
                      setProfileImage(data.profileImage);
                      setProfile((currentProfile) => ({ ...currentProfile, profileImage: data.profileImage }));
                    } else {
                      setError(data.error || "Unable to upload profile image.");
                    }
                    setUploadingImage(false);
                    event.target.value = "";
                  }}
                  className="sr-only"
                />
              </label>
            )}
          </div>
        </section>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="mt-2 text-slate-400">
            Keep your academic and professional information updated to improve
            your career recommendations.
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-lg font-semibold">
            Complete Your Career Profile
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Providing accurate information helps CareerAI generate more
            relevant career recommendations.
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
            <InputField label="Full Name" value={profile.name} onChange={(value) => updateField("name", value)} required editable={editing} />
            <InputField label="Email" value={profile.email} disabled />
            <InputField label="Matric Number" value={profile.matricNumber || ""} onChange={(value) => updateField("matricNumber", value)} editable={editing} />
            <InputField label="Department" value={profile.department || ""} onChange={(value) => updateField("department", value)} required editable={editing} />
          </ProfileSection>

          <ProfileSection title="Academic Information">
            <InputField label="Level" type="number" value={profile.level ?? ""} onChange={(value) => updateField("level", value === "" ? null : Number(value))} min="100" max="700" editable={editing} />
            <InputField label="CGPA" type="number" value={profile.cgpa ?? ""} onChange={(value) => updateField("cgpa", value === "" ? null : Number(value))} min="0" max="5" step="0.01" editable={editing} />
          </ProfileSection>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-6 text-xl font-semibold">Professional Information</h2>
            <div className="mb-5 grid gap-5 md:grid-cols-2">
              <InputField label="Number of Projects" type="number" value={profile.projects} onChange={(value) => updateField("projects", Number(value))} min="0" editable={editing} />
              <InputField label="Number of Certifications" type="number" value={profile.certifications} onChange={(value) => updateField("certifications", Number(value))} min="0" editable={editing} />
            </div>
            <div className="space-y-5">
              <TextAreaField label="Career Interests" placeholder="e.g. Web development, AI, cybersecurity, cloud computing..." value={profile.interests || ""} onChange={(value) => updateField("interests", value)} editable={editing} />
              <TextAreaField label="Experience" placeholder="Describe your internship, freelance work, jobs or other relevant experience..." value={profile.experience || ""} onChange={(value) => updateField("experience", value)} editable={editing} />
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-2 text-xl font-semibold">Skills</h2>
            <p className="mb-6 text-sm text-slate-400">
              Skills and proficiency levels detected from your assessments are
              selected automatically. You can review them here before saving.
            </p>
            <div className="space-y-3">
              {availableSkills.length === 0 && (
                <p className="rounded-lg border border-slate-800 p-4 text-sm text-slate-400">
                  Complete a skill assessment to see your assessed skills here.
                </p>
              )}
              {availableSkills.map((skill) => {
                const selected = profile.skills.find((item) => item.skillId === skill.id);
                return (
                  <div
                    key={skill.id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(selected)}
                        disabled={!editing}
                        onChange={(event) => {
                          const skills = event.target.checked
                            ? [...profile.skills, { skillId: skill.id, proficiencyLevel: 1 }]
                            : profile.skills.filter((item) => item.skillId !== skill.id);
                          updateField("skills", skills);
                        }}
                        className="h-4 w-4 accent-cyan-400"
                      />
                      <span>
                        <span className="block font-medium">{skill.name}</span>
                        <span className="text-xs text-slate-500">{skill.category}</span>
                        {selected && assessedSkillIds.includes(skill.id) && (
                          <span className="mt-1 block text-xs text-cyan-400">
                            Assessment result applied
                          </span>
                        )}
                      </span>
                    </label>
                    {selected && (
                      <select
                        value={selected.proficiencyLevel}
                        disabled={!editing}
                        onChange={(event) => {
                          const proficiencyLevel = Number(event.target.value);
                          updateField(
                            "skills",
                            profile.skills.map((item) =>
                              item.skillId === skill.id
                                ? { ...item, proficiencyLevel }
                                : item
                            )
                          );
                        }}
                        className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white outline-none focus:border-cyan-400"
                      >
                        <option value={0}>Beginner</option>
                        <option value={1}>Intermediate</option>
                        <option value={2}>Advance</option>
                        <option value={3}>Professional</option>
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {editing && (
            <button type="submit" disabled={saving} className="w-full rounded-xl bg-cyan-500 px-6 py-4 font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50">
              {saving ? "Saving Profile..." : "Save Profile"}
            </button>
          )}
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
  editable = true,
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
  editable?: boolean;
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
        disabled={disabled || !editable}
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
  editable = true,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  editable?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm text-slate-300">{label}</label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        readOnly={!editable}
        placeholder={placeholder}
        rows={5}
        className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 read-only:opacity-70 focus:border-cyan-400"
      />
    </div>
  );
}
