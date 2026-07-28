import { useEffect, useMemo, useState } from "react";
import { Search, Pencil, Archive } from "lucide-react";
import { ALL_CASES, type MockCase } from "@/data/mock_line_listing";

const RESULT_CAP = 50;

// Case Management — global UHID search across all mock cases (all states).
// B.3: search + results table. Edit/Archive wired in B.4/B.5.
export default function CaseManagementPanel() {
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");

  // 250ms debounce on keystrokes.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(term.trim()), 250);
    return () => clearTimeout(t);
  }, [term]);

  const matches = useMemo(() => {
    if (!debounced) return [];
    const q = debounced.toLowerCase();
    return ALL_CASES.filter((c) => c.uhid.toLowerCase().includes(q));
  }, [debounced]);

  const shown = matches.slice(0, RESULT_CAP);
  const overflow = matches.length > RESULT_CAP;

  const onEdit = (c: MockCase) => { void c; /* wired in B.4 */ };
  const onArchive = (c: MockCase) => { void c; /* wired in B.5 */ };

  return (
    <div className="section-card p-5">
      <h3 className="section-title mb-1">Case Management</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Search any case by UHID across all states. Edit or archive individual cases.
      </p>

      {/* Search input */}
      <div className="relative max-w-md mb-4">
        <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search by UHID"
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm font-mono"
          aria-label="Search by UHID"
        />
      </div>

      {/* Empty state — before any search */}
      {!debounced && (
        <div className="text-sm text-muted-foreground py-10 text-center border border-dashed border-border rounded-md">
          Enter a UHID above to search cases
        </div>
      )}

      {/* No results */}
      {debounced && matches.length === 0 && (
        <div className="text-sm text-muted-foreground py-10 text-center border border-dashed border-border rounded-md">
          No cases match this UHID
        </div>
      )}

      {/* Results table */}
      {matches.length > 0 && (
        <div>
          <div className="text-xs text-muted-foreground mb-2">
            {matches.length} match{matches.length === 1 ? "" : "es"}
            {overflow && <span> · showing first {RESULT_CAP} — refine your search</span>}
          </div>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["UHID", "Age", "Gender", "Test Type", "Result", "Date", "State", "District", "Block", "Ward", ""].map((h, i) => (
                    <th key={i} className="text-left py-2 px-2 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((c) => (
                  <tr key={c.uhid} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-2 font-mono text-xs whitespace-nowrap">{c.uhid}</td>
                    <td className="py-2 px-2">{c.age}</td>
                    <td className="py-2 px-2">{c.gender}</td>
                    <td className="py-2 px-2">{c.testType}</td>
                    <td className="py-2 px-2">{c.testResult}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{c.date}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{c.state}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{c.district}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{c.block}</td>
                    <td className="py-2 px-2 whitespace-nowrap">{c.ward}</td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onEdit(c)}
                          className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-input text-xs text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          onClick={() => onArchive(c)}
                          className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-input text-xs text-muted-foreground hover:bg-muted transition-colors"
                        >
                          <Archive className="h-3 w-3" /> Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
