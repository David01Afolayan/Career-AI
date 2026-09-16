type ProgressBarProps = {
  label: string;
  value: number;
};

export default function ProgressBar({ label, value }: ProgressBarProps) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex justify-between text-sm text-slate-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-slate-200">
        <div className="h-2.5 rounded-full bg-emerald-500" style={{ width: `${value}%` }}></div>
      </div>
    </div>
  );
}
