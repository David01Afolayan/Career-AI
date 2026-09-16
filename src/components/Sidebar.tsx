const menu = [
  { label: "Overview", href: "/dashboard" },
  { label: "Assessment", href: "/assessment" },
  { label: "Skills", href: "/skills" },
  { label: "Roadmap", href: "/roadmap" },
  { label: "Careers", href: "/careers" },
  { label: "Admin", href: "/admin" },
];

export default function Sidebar() {
  return (
      <aside className="h-full w-64 border-r border-white/10 bg-slate-950 p-4">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Menu</p>
      </div>
      <nav className="space-y-2">
        {menu.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}
