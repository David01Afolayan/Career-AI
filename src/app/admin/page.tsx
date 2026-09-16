import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Total Users</p>
                <h2 className="mt-2 text-3xl font-bold">1,284</h2>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Assessments</p>
                <h2 className="mt-2 text-3xl font-bold">764</h2>
              </div>
              <div className="rounded-2xl bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Career Matches</p>
                <h2 className="mt-2 text-3xl font-bold">92%</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
