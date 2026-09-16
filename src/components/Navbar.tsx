export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div>
        <h1 className="text-2xl font-bold text-sky-700">CareerAI</h1>
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-600">
        <a href="/" className="hover:text-sky-700">Home</a>
        <a href="/dashboard" className="hover:text-sky-700">Dashboard</a>
        <a href="/assessment" className="hover:text-sky-700">Assessment</a>
        <a href="/careers" className="hover:text-sky-700">Careers</a>
        <button className="rounded-full bg-sky-600 px-4 py-2 text-white shadow-sm hover:bg-sky-700">
          Login
        </button>
      </div>
    </nav>
  );
}
