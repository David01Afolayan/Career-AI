import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import SkillCard from "../../components/SkillCard";
import BackButton from "@/components/BackButton";

const skills = [
  { name: "Communication", level: 86, category: "Soft Skill" },
  { name: "Python", level: 92, category: "Technical" },
  { name: "Data Analysis", level: 78, category: "Analytical" },
  { name: "Project Planning", level: 81, category: "Management" },
];

export default function SkillsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-slate-950 p-6 lg:p-10">
          <BackButton />
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-400">
            Skills overview
          </p>
          <h1 className="mb-6 mt-2 text-3xl font-bold text-white">
            Your skills
          </h1>
          <div className="grid gap-4 md:grid-cols-2">
            {skills.map((skill) => (
              <SkillCard key={skill.name} {...skill} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
