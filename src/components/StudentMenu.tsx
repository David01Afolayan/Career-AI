"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

const links = [
  ["Dashboard", "/dashboard"],
  ["Profile", "/profile"],
  ["Skill Assessment", "/assessment"],
  ["Assessment History", "/assessment/history"],
  ["Career Recommendations", "/ai-result"],
  ["Careers", "/careers"],
  ["Skill Gap", "/skill-gap"],
  ["Learning Roadmap", "/roadmap"],
  ["Progress", "/progress"],
];

export default function StudentMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg border border-slate-700 p-2 text-slate-300 hover:border-blue-400 hover:text-white"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
          {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 max-h-[calc(100vh-6rem)] w-64 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
          {links.map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="block rounded-lg px-4 py-3 text-sm text-slate-300 hover:bg-blue-500/10 hover:text-white">
              {label}
            </Link>
          ))}
          <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="mt-2 w-full border-t border-slate-700 px-4 py-3 text-left text-sm font-semibold text-red-300 hover:bg-red-500/10">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
