"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="relative flex items-center justify-between border-b border-white/10 bg-slate-950 px-6 py-5">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Career<span className="text-blue-400">AI</span>
        </h1>
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:border-blue-400 hover:text-white"
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
            {menuOpen ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-12 z-50 w-64 rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
            {[
              ["Dashboard", "/dashboard"],
              ["Profile", "/profile"],
              ["Assessment", "/assessment"],
              ["Assessment History", "/assessment/history"],
              ["Careers", "/careers"],
              ["Skill Gap", "/skill-gap"],
              ["Learning Roadmap", "/roadmap"],
              ["Progress", "/progress"],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="block rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-blue-500/10 hover:text-white">
                {label}
              </a>
            ))}
            <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="mt-2 w-full rounded-lg border-t border-slate-700 px-4 py-3 text-left text-sm font-semibold text-red-300 hover:bg-red-500/10">
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
