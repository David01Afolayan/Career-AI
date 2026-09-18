"use client";

import { FormEvent, Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdminReset = usePathname() === "/reset-password/admin";
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (password !== confirmation) return setMessage("Passwords do not match.");
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) return setMessage(data.error ?? "Unable to reset your password.");
      router.push(isAdminReset ? "/login/admin?reset=success" : "/login?reset=success");
    } catch {
      setMessage("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }

  }

  return (
    <main className={`flex min-h-screen items-center justify-center px-6 text-white ${isAdminReset ? "bg-slate-900" : "bg-slate-950"}`}>
      <form onSubmit={submit} className={`w-full max-w-md rounded-2xl p-8 shadow-xl ${isAdminReset ? "border border-cyan-500/20 bg-slate-950" : "border border-slate-800 bg-slate-900"}`}>
        {isAdminReset && <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">CareerAI Administration</p>}
        <h1 className="mt-3 text-3xl font-bold">{isAdminReset ? "Create a new admin password" : "Create a new password"}</h1>
        <p className="mt-2 text-slate-400">{isAdminReset ? "Choose a secure administrator password with at least 8 characters." : "Choose a password with at least 8 characters."}</p>
        {message && <p className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{message}</p>}
        <div className="relative mt-6">
          <input type={showPassword ? "text" : "password"} required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className={`w-full rounded-lg border px-4 py-3 pr-12 text-white outline-none ${isAdminReset ? "border-slate-700 bg-slate-900 focus:border-cyan-500" : "border-slate-700 bg-slate-800 focus:border-blue-500"}`} />
          <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 hover:text-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              {showPassword ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.5 4 9.5 6a16.7 16.7 0 0 1-3.1 3.8" /><path d="M6.6 6.6C4.8 7.8 3.5 9.4 2.5 10c1 2 4.5 6 9.5 6 1.1 0 2.1-.2 3-.5" /></> : <><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>}
            </svg>
          </button>
        </div>
        <div className="relative mt-4">
          <input type={showConfirmation ? "text" : "password"} required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Confirm new password" className={`w-full rounded-lg border px-4 py-3 pr-12 text-white outline-none ${isAdminReset ? "border-slate-700 bg-slate-900 focus:border-cyan-500" : "border-slate-700 bg-slate-800 focus:border-blue-500"}`} />
          <button type="button" onClick={() => setShowConfirmation((visible) => !visible)} aria-label={showConfirmation ? "Hide password" : "Show password"} className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 hover:text-white">
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
              {showConfirmation ? <><path d="M3 3l18 18" /><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" /><path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.5 4 9.5 6a16.7 16.7 0 0 1-3.1 3.8" /><path d="M6.6 6.6C4.8 7.8 3.5 9.4 2.5 10c1 2 4.5 6 9.5 6 1.1 0 2.1-.2 3-.5" /></> : <><path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" /></>}
            </svg>
          </button>
        </div>
        <button type="submit" disabled={loading || !token} className={`mt-5 w-full rounded-lg py-3 font-semibold text-white disabled:opacity-50 ${isAdminReset ? "bg-cyan-600 hover:bg-cyan-500" : "bg-blue-600 hover:bg-blue-500"}`}>{loading ? "Updating..." : "Update password"}</button>
      </form>
    </main>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
