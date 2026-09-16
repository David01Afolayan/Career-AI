type SkillCardProps = {
  name: string;
  level: number;
  category: string;
};

export default function SkillCard({ name, level, category }: SkillCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900 p-4 transition hover:-translate-y-1 hover:border-blue-400/40">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold text-white">{name}</h4>
        <span className="text-xs text-slate-400">{category}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-800">
        <div
          className="h-2.5 rounded-full bg-blue-500"
          style={{ width: `${level}%` }}
        ></div>
      </div>
      <p className="mt-2 text-sm text-slate-400">{level}% proficiency</p>
    </div>
  );
}
