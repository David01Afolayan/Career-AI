type CareerCardProps = {
  title: string;
  description: string;
  skills: string[];
  match: number;
};

export default function CareerCard({ title, description, skills, match }: CareerCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 transition hover:-translate-y-1 hover:border-blue-400/40">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">{title}</h3>
        <span className="rounded-full bg-blue-400/10 px-2.5 py-1 text-xs font-bold text-blue-300">
          {match}% match
        </span>
      </div>
      <p className="mb-4 text-sm text-slate-400">{description}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="rounded-full bg-blue-400/10 px-2 py-1 text-xs text-blue-300">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
