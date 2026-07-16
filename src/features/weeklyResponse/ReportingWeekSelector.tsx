import { EPI_WEEKS } from "@/data/mock_dataset";

interface Props {
  value: string;
  onChange: (w: string) => void;
}

export default function ReportingWeekSelector({ value, onChange }: Props) {
  // Show the last 12 epi-weeks in reverse order
  const options = EPI_WEEKS.slice(-12).reverse();
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-muted-foreground">Reporting week:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium"
      >
        {options.map((w) => (
          <option key={w} value={w}>{w === EPI_WEEKS[EPI_WEEKS.length - 1] ? `${w} (current)` : w}</option>
        ))}
      </select>
    </div>
  );
}
