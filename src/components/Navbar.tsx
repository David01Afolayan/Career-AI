"use client";

import StudentMenu from "@/components/StudentMenu";

export default function Navbar() {
  return (
    <nav className="relative flex items-center justify-between border-b border-white/10 bg-slate-950 px-6 py-5">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Career<span className="text-blue-400">AI</span>
        </h1>
      </div>

      <StudentMenu />
    </nav>
  );
}
