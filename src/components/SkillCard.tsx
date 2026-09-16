type SkillCardProps = {
  name: string;
  level: number;
  category: string;
};

export default function SkillCard({ name, level, category }: SkillCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-semibold text-slate-800">{name}</h4>
        <span className="text-xs text-slate-500">{category}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-200">
        <div
          className="h-2.5 rounded-full bg-sky-600"
          style={{ width: `${level}%` }}
        ></div>
      </div>
      <p className="mt-2 text-sm text-slate-600">{level}% proficiency</p>
    </div>
  );
}
