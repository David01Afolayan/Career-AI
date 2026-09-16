import CareerCard from "@/components/CareerCard";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { db } from "@/lib/db";

function parseSkills(requiredSkills: string) {
  return requiredSkills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export default async function CareersPage() {
  const careers = await db.career.findMany({
    orderBy: {
      title: "asc",
    },
  });

  return (
    <main className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <section className="flex-1 p-6 lg:p-10">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest text-sky-600">
                Career paths
              </p>

              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Explore technology careers
              </h1>

              <p className="mt-2 max-w-2xl text-slate-600">
                Review career options, the skills they require, and the areas
                you can develop through your personalized roadmap.
              </p>
            </div>

            {careers.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {careers.map((career) => (
                  <CareerCard
                    key={career.id}
                    title={career.title}
                    description={career.description}
                    skills={parseSkills(career.requiredSkills)}
                    match={0}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <h2 className="text-xl font-semibold text-slate-900">
                  No career paths available yet
                </h2>
                <p className="mt-2 text-slate-600">
                  Run the Prisma seed command to add the career catalogue.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
