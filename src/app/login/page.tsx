"use client";

import { FormEvent, useState } from "react";
import { Suspense } from "react";
import { getSession, signIn, signOut } from "next-auth/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAdminLogin = pathname === "/login/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);

  const registered = searchParams.get("registered");
  const reset = searchParams.get("reset");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      ...(isAdminLogin ? { adminKey } : {}),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    if (isAdminLogin) {
      const session = await getSession();
      if (session?.user?.role !== "ADMIN") {
        await signOut({ redirect: false });
        setError("This account does not have administrator access.");
        setLoading(false);
        return;
      }
    }

    router.push(isAdminLogin ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <main className={`min-h-screen px-6 py-10 ${isAdminLogin ? "bg-slate-900" : "flex items-center justify-center bg-slate-950"}`}>
      <div className={`w-full ${isAdminLogin ? "mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-950 shadow-2xl lg:grid-cols-[1fr_420px]" : "mx-auto max-w-md"}`}>
        {isAdminLogin && (
          <section className="hidden flex-col justify-between bg-gradient-to-br from-cyan-950 via-slate-950 to-blue-950 p-10 lg:flex">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cyan-400">CareerAI Administration</p>
              <h2 className="mt-8 text-4xl font-bold leading-tight text-white">Manage the future of career learning.</h2>
              <p className="mt-5 max-w-md leading-7 text-slate-400">
                Use the secure administrator portal to manage students, careers, skills, resources, and assessment questions.
              </p>
            </div>
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-5">
              <p className="text-sm font-semibold text-cyan-300">Administrator access</p>
              <p className="mt-2 text-sm text-slate-400">Only accounts assigned the ADMIN role can continue to the control panel.</p>
            </div>
          </section>
        )}

        <div className={isAdminLogin ? "p-8 sm:p-10" : "p-0"}>
          <div className="mb-8 text-center">
            {isAdminLogin && (
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/15 text-cyan-300 ring-1 ring-cyan-400/30">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7">
                  <path d="M12 3 19 6v5c0 4.5-2.9 8.3-7 10-4.1-1.7-7-5.5-7-10V6l7-3Z" />
                  <path d="m9.5 12 1.7 1.7 3.5-3.5" />
                </svg>
              </div>
            )}
            <h1 className="text-4xl font-bold text-white">
              {isAdminLogin ? "Admin Sign In" : "Welcome Back"}
            </h1>

          <p className="mt-3 text-slate-400">
            {isAdminLogin
              ? "Sign in to manage the CareerAI platform."
              : "Login to continue your CareerAI journey."}
          </p>
          </div>

          <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl"
        >
          {registered && (
            <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
              Account created successfully. You can now login.
            </div>
          )}

          {reset === "success" && (
            <div className="mb-5 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-400">
              Password reset successfully. You can now login.
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Email
              </label>

              <input
                type="email"
                name={isAdminLogin ? "admin-email" : "email"}
                autoComplete={isAdminLogin ? "username" : "email"}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name={isAdminLogin ? "admin-password" : "password"}
                  autoComplete={isAdminLogin ? "current-password" : "current-password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 pr-12 text-white outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 hover:text-white"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    {showPassword ? (
                      <>
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.5 4 9.5 6a16.7 16.7 0 0 1-3.1 3.8" />
                        <path d="M6.6 6.6C4.8 7.8 3.5 9.4 2.5 10c1 2 4.5 6 9.5 6 1.1 0 2.1-.2 3-.5" />
                      </>
                    ) : (
                      <>
                        <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                        <circle cx="12" cy="12" r="2.5" />
                      </>
                    )}
                  </svg>
                </button>
              </div>

              <div className="mt-2 text-right">
                <a href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
                  Forgot password?
                </a>
              </div>
            </div>

            {isAdminLogin && (
              <div>
                <label className="mb-2 block text-sm text-slate-300">Administrator Key</label>
                <div className="relative">
                  <input
                    type={showAdminKey ? "text" : "password"}
                    name="admin-key"
                    autoComplete="off"
                    required
                    value={adminKey}
                    onChange={(event) => setAdminKey(event.target.value)}
                    placeholder="Enter your unique administrator key"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 pr-12 text-white outline-none focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminKey((visible) => !visible)}
                    aria-label={showAdminKey ? "Hide administrator key" : "Show administrator key"}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-slate-400 hover:text-white"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      {showAdminKey ? (
                        <>
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                          <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.5 4 9.5 6a16.7 16.7 0 0 1-3.1 3.8" />
                        </>
                      ) : (
                        <>
                          <path d="M2.5 12S6 6 12 6s9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                          <circle cx="12" cy="12" r="2.5" />
                        </>
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400">
            {!isAdminLogin && (
              <>
                Don't have an account?{" "}
                <a href="/register" className="text-blue-400 hover:text-blue-300">
                  Create Account
                </a>
              </>
            )}
            {isAdminLogin && (
              <Link href="/register/admin" className="text-cyan-400 hover:text-cyan-300">
                Create Admin Account
              </Link>
            )}
          </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}