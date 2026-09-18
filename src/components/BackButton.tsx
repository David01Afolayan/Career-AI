"use client";

import { useRouter } from "next/navigation";

export function BackIcon() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="h-4 w-4"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

export default function BackButton({
  href = "/dashboard",
  label = "Back to Dashboard",
}: {
  href?: string;
  label?: string;
}) {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(href);
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={label}
      title={label}
      className="mb-6 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 text-sm font-medium text-slate-300 transition hover:border-cyan-400 hover:text-white"
    >
      <BackIcon />
      {label !== "Back to Dashboard" && label}
    </button>
  );
}
