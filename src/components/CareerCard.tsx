type CareerCardProps = {
  title: string;
  description: string;
  skills: string[];
  match: number;
};

export default function CareerCard({ title, description, skills, match }: CareerCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-800">{title}</h3>
        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
          {match}% match
        </span>
      </div>
      <p className="mb-4 text-sm text-slate-600">{description}</p>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <span key={skill} className="rounded-full bg-sky-100 px-2 py-1 text-xs text-sky-700">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
