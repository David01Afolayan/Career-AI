"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

const studentLinks = [
  ["Dashboard", "/dashboard"],
  ["Profile", "/profile"],
  ["Skill Assessment", "/assessment"],
  ["Assessment History", "/assessment/history"],
  ["Field Tests Taken", "/assessment/field-tests"],
  ["Career Recommendations", "/ai-result"],
  ["Careers", "/careers"],
  ["Skill Gap", "/skill-gap"],
  ["Learning Roadmap", "/roadmap"],
  ["Progress", "/progress"],
];

const adminLinks = [
  ["Admin Dashboard", "/admin"],
  ["Administrator Profile", "/profile"],
  ["Manage Students", "/admin/students"],
  ["Manage Careers", "/admin/careers"],
  ["Manage Skills", "/admin/skills"],
  ["Manage Assessments", "/admin/questions"],
  ["Manage Resources", "/admin/resources"],
];

export default function StudentMenu({ role = "STUDENT" }: { role?: string }) {
  const [open, setOpen] = useState(false);
  const isAdmin = role === "ADMIN";
  const links = isAdmin ? adminLinks : studentLinks;
  const accentClasses = isAdmin
    ? {
        border: "hover:border-cyan-400",
        text: "text-cyan-400",
        background: "hover:bg-cyan-500/10",
      }
    : {
        border: "hover:border-blue-400",
        text: "text-blue-400",
        background: "hover:bg-blue-500/10",
      };

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className={`rounded-lg border border-slate-700 p-2 text-slate-300 ${accentClasses.border} hover:text-white`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6">
          {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
        </svg>
      </button>
      {open && (
        <>
          <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/70" />
          <aside className="fixed right-0 top-0 z-50 h-full w-80 max-w-[90vw] overflow-y-auto border-l border-slate-800 bg-slate-900 p-6 pb-10 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <p className={`text-sm font-semibold uppercase tracking-wider ${accentClasses.text}`}>
                {isAdmin ? "Administrator Navigation" : "Student Navigation"}
              </p>
              <button type="button" aria-label="Close navigation" onClick={() => setOpen(false)} className="rounded-lg p-2 text-2xl text-slate-400 hover:bg-slate-800 hover:text-white">×</button>
            </div>
            <nav className="mt-6 space-y-2" aria-label={isAdmin ? "Administrator navigation" : "Student navigation"}>
              {links.map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)} className={`block rounded-xl px-4 py-3 font-medium text-slate-300 ${accentClasses.background} hover:text-white`}>
                  {label}
                </Link>
              ))}
            </nav>
            <button type="button" onClick={() => signOut({ callbackUrl: "/login" })} className="mt-8 w-full rounded-xl border border-red-500/40 px-4 py-3 text-left font-semibold text-red-300 hover:bg-red-500/10">
              Sign Out
            </button>
          </aside>
        </>
      )}
    </>
  );
}
