"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/register/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Unable to create the administrator account.");
        return;
      }
      router.push("/login/admin?registered=true");
    } catch {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 px-6 py-10 text-white">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-950 shadow-2xl lg:grid-cols-[1fr_420px]">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-cyan-950 via-slate-950 to-blue-950 p-10 lg:flex">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">CareerAI Administration</p>
            <h1 className="mt-8 text-4xl font-bold leading-tight">Create a trusted administrator account.</h1>
            <p className="mt-5 max-w-md leading-7 text-slate-400">Administrator accounts can manage the platform and its learning data.</p>
          </div>
          <p className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5 text-sm text-slate-400">
            Sign in as an existing administrator before creating another administrator account.
          </p>
        </section>

        <div className="p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Secure setup</p>
          <h2 className="mt-3 text-3xl font-bold">Create Admin Account</h2>
          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            {[
              ["name", "Full Name", "Administrator name", "text"],
              ["email", "Email", "admin@example.com", "email"],
              ["password", "Password", "At least 8 characters", "password"],
            ].map(([name, label, placeholder, type]) => (
              <div key={name}>
                <label className="mb-2 block text-sm text-slate-300">{label}</label>
                <input
                  name={name}
                  type={type}
                  required
                  minLength={name === "password" ? 8 : undefined}
                  value={form[name as keyof typeof form]}
                  onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))}
                  placeholder={placeholder}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full rounded-lg bg-cyan-600 py-3 font-semibold text-white hover:bg-cyan-500 disabled:opacity-50">
              {loading ? "Creating Admin Account..." : "Create Admin Account"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-400">
            Already have admin access? <Link href="/login/admin" className="text-cyan-400 hover:text-cyan-300">Admin Sign In</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
