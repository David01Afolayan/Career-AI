export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-6 py-5">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Career<span className="text-blue-400">AI</span>
        </h1>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-300">
        <a href="/" className="hover:text-white">Home</a>
        <a href="/dashboard" className="hover:text-white">Dashboard</a>
        <a href="/assessment" className="hover:text-white">Assessment</a>
        <a href="/careers" className="hover:text-white">Careers</a>
        <a href="/login" className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500">
          Login
        </a>
      </div>
    </nav>
  );
}
