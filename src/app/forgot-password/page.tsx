"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResetUrl("");
    try {
      const response = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
        <h1 className="text-3xl font-bold">Reset your password</h1>
        <p className="mt-2 text-slate-400">Enter your email and we&apos;ll help you create a new password.</p>
        {message && <p className="mt-5 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-300">{message}</p>}
        {resetUrl && <Link href={resetUrl} className="mt-4 block break-all text-sm text-blue-400 underline">Open reset link</Link>}
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-6 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500" />
        <button type="submit" disabled={loading} className="mt-5 w-full rounded-lg bg-blue-600 py-3 font-semibold hover:bg-blue-500 disabled:opacity-50">{loading ? "Sending..." : "Send reset link"}</button>
        <Link href="/login" className="mt-6 block text-center text-sm text-blue-400 hover:text-blue-300">Back to login</Link>
      </form>
    </main>
  );
}
