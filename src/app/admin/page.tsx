import { requireAdmin } from "@/lib/admin";
import AdminDashboard from "./AdminDashboard";

export default async function AdminPage() {
  await requireAdmin();

  return <AdminDashboard />;
}
