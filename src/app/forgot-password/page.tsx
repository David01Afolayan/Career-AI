"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdminReset = usePathname() === "/forgot-password/admin";

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResetUrl("");
    try {
      const response = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, admin: isAdminReset }),
      });
      const data = await response.json();
      setMessage(data.message ?? data.error ?? "Unable to process the request.");
      if (data.resetUrl) setResetUrl(data.resetUrl);
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
        <h1 className="mt-3 text-3xl font-bold">{isAdminReset ? "Reset admin password" : "Reset your password"}</h1>
        <p className="mt-2 text-slate-400">{isAdminReset ? "Enter your administrator email to receive a secure reset link." : "Enter your email and we&apos;ll help you create a new password."}</p>
        {message && <p className="mt-5 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-300">{message}</p>}
        {resetUrl && <Link href={resetUrl} className="mt-4 block break-all text-sm text-blue-400 underline">Open reset link</Link>}
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder={isAdminReset ? "admin@example.com" : "you@example.com"} className={`mt-6 w-full rounded-lg border px-4 py-3 text-white outline-none ${isAdminReset ? "border-slate-700 bg-slate-900 focus:border-cyan-500" : "border-slate-700 bg-slate-800 focus:border-blue-500"}`} />
        <button type="submit" disabled={loading} className={`mt-5 w-full rounded-lg py-3 font-semibold text-white disabled:opacity-50 ${isAdminReset ? "bg-cyan-600 hover:bg-cyan-500" : "bg-blue-600 hover:bg-blue-500"}`}>{loading ? "Sending..." : "Send reset link"}</button>
        <Link href={isAdminReset ? "/login/admin" : "/login"} className={`mt-6 block text-center text-sm ${isAdminReset ? "text-cyan-400 hover:text-cyan-300" : "text-blue-400 hover:text-blue-300"}`}>Back to login</Link>
      </form>
    </main>
  );
}
