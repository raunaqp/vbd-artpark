import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ACTION_TYPES, NO_ACTIVITY_REASONS, makeRecordId } from "./types";
import type { AreaAggregate } from "./aggregation";
import type { ActionType, FieldActivityStatus, NoActivityReason, WeeklyResponseRecord } from "./types";
import { useRole } from "@/contexts/RoleContext";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  agg: AreaAggregate | null;
  stateId: string;
  epiWeek: string;
  weekEnding: string;
  onSave: (rec: WeeklyResponseRecord) => void;
  historyRecords: WeeklyResponseRecord[]; // records for this row across recent weeks
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function WeeklyResponseDrawer({ open, onOpenChange, agg, stateId, epiWeek, weekEnding, onSave, historyRecords }: Props) {
  const { currentRole } = useRole();
  const existing = agg?.primary;

  const [status, setStatus] = useState<FieldActivityStatus>("yes");
  const [activityDate, setActivityDate] = useState<string>(todayIso());
  const [personnel, setPersonnel] = useState<string>("");
  const [localities, setLocalities] = useState<string>("");
  const [actions, setActions] = useState<ActionType[]>([]);
  const [sourceRed, setSourceRed] = useState<string>("");
  const [larvalCount, setLarvalCount] = useState<string>("");
  const [foggingCount, setFoggingCount] = useState<string>("");
  const [constrCount, setConstrCount] = useState<string>("");
  const [iecCount, setIecCount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [noReason, setNoReason] = useState<NoActivityReason>("No action required this week");
  const [noReasonOther, setNoReasonOther] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    if (existing) {
      setStatus(existing.field_activity_status);
      setActivityDate(existing.activity_date || todayIso());
      setPersonnel(existing.personnel_deployed?.toString() || "");
      setLocalities(existing.localities_visited || "");
      setActions(existing.actions_taken || []);
      setSourceRed(existing.source_reduction_count?.toString() || "");
      setLarvalCount(existing.larval_surveys_count?.toString() || "");
      setFoggingCount(existing.fogging_operations_count?.toString() || "");
      setConstrCount(existing.construction_sites_inspected_count?.toString() || "");
      setIecCount(existing.iec_activities_count?.toString() || "");
      setNotes(existing.notes || "");
      setNoReason(existing.no_activity_reason || "No action required this week");
      setNoReasonOther(existing.no_activity_reason_other || "");
    } else {
      setStatus("yes"); setActivityDate(todayIso()); setPersonnel(""); setLocalities("");
      setActions([]); setSourceRed(""); setLarvalCount(""); setFoggingCount("");
      setConstrCount(""); setIecCount(""); setNotes(""); setNoReason("No action required this week"); setNoReasonOther("");
    }
    setError(null);
  }, [open, existing]);

  const toggleAction = (a: ActionType) => {
    setActions((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const requiresSourceReductionCount = actions.includes("Source reduction");

  const history = useMemo(() => {
    if (!agg) return [];
    return historyRecords
      .filter((r) => r.geography_id === agg.row.key && r.epidemiological_week !== epiWeek)
      .sort((a, b) => b.epidemiological_week.localeCompare(a.epidemiological_week))
      .slice(0, 4);
  }, [historyRecords, agg, epiWeek]);

  if (!agg) return null;
  const row = agg.row;

  const handleSave = () => {
    if (status === "yes" && !activityDate) { setError("Activity date is required."); return; }
    if (status === "yes" && requiresSourceReductionCount && !sourceRed) { setError("Source reduction count is required."); return; }
    if (status === "no" && noReason === "Other" && !noReasonOther.trim()) { setError("Please specify the reason."); return; }

    const now = new Date().toISOString();
    const geographyId = row.key;
    const id = makeRecordId(geographyId, epiWeek);
    const rec: WeeklyResponseRecord = {
      id,
      epidemiological_week: epiWeek,
      forecast_ref: `FR-${epiWeek}`,
      forecast_generated_at: existing?.forecast_generated_at || weekEnding,
      risk_level_at_capture: row.risk,
      state: stateId,
      district: row.district || "",
      block_or_municipality: row.block,
      ward_or_village: row.ward,
      geography_level: row.ward ? "ward" : (row.block ? "block" : "district"),
      geography_id: geographyId,
      geography_name: row.name,
      field_activity_status: status,
      activity_date: status === "yes" ? activityDate : undefined,
      personnel_deployed: status === "yes" && personnel ? Number(personnel) : undefined,
      localities_visited: status === "yes" ? localities || undefined : undefined,
      actions_taken: status === "yes" ? actions : undefined,
      source_reduction_count: status === "yes" && requiresSourceReductionCount ? Number(sourceRed) : undefined,
      larval_surveys_count: status === "yes" && actions.includes("Larval surveillance") && larvalCount ? Number(larvalCount) : undefined,
      fogging_operations_count: status === "yes" && actions.includes("Fogging / space spraying") && foggingCount ? Number(foggingCount) : undefined,
      construction_sites_inspected_count: status === "yes" && actions.includes("Construction-site inspection") && constrCount ? Number(constrCount) : undefined,
      iec_activities_count: status === "yes" && actions.includes("Community awareness / IEC") && iecCount ? Number(iecCount) : undefined,
      no_activity_reason: status === "no" ? noReason : undefined,
      no_activity_reason_other: status === "no" && noReason === "Other" ? noReasonOther : undefined,
      notes: notes || undefined,
      logged_by_user_id: existing?.logged_by_user_id || currentRole.id,
      logged_by_name: existing?.logged_by_name || currentRole.userName,
      logged_by_role: existing?.logged_by_role || currentRole.roleName,
      recorded_at: existing?.recorded_at || now,
      updated_at: now,
      reporting_status: status === "pending" ? "draft" : "reported",
    };
    onSave(rec);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{existing ? "Edit weekly response" : "Record weekly response"}</SheetTitle>
        </SheetHeader>

        <div className="mt-3 rounded-md bg-muted/40 p-3 text-xs space-y-0.5">
          <div><span className="text-muted-foreground">Area:</span> <span className="font-medium">{row.name}</span></div>
          <div><span className="text-muted-foreground">Geography:</span> {[row.district, row.block, row.ward].filter(Boolean).join(" › ")}</div>
          <div><span className="text-muted-foreground">Epi week:</span> {epiWeek}</div>
          <div><span className="text-muted-foreground">Forecast risk:</span> {row.risk === "unknown" ? "No forecast" : row.risk}</div>
          <div><span className="text-muted-foreground">Reporting officer:</span> {currentRole.userName} · {currentRole.roleName}</div>
          {existing && <div><span className="text-muted-foreground">Recorded:</span> {existing.recorded_at?.slice(0,10)} · Updated: {existing.updated_at?.slice(0,10)}</div>}
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <Label className="text-sm">Was any field activity conducted in this area this week? <span className="text-risk-high">*</span></Label>
            <div className="mt-2 flex gap-2">
              {(["yes", "no", "pending"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`text-xs px-3 py-1.5 rounded-md border ${status === s ? "bg-primary text-primary-foreground border-primary" : "border-border bg-background"}`}
                >
                  {s === "yes" ? "Yes" : s === "no" ? "No" : "Report pending"}
                </button>
              ))}
            </div>
          </div>

          {status === "yes" && (
            <>
              <div>
                <Label htmlFor="activityDate" className="text-sm">When was the field activity conducted? <span className="text-risk-high">*</span></Label>
                <Input id="activityDate" type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="personnel" className="text-sm">How many field personnel visited?</Label>
                <Input id="personnel" type="number" min={0} value={personnel} onChange={(e) => setPersonnel(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="localities" className="text-sm">Which localities or areas were visited?</Label>
                <Input id="localities" value={localities} onChange={(e) => setLocalities(e.target.value)}
                  placeholder="Example: Whitefield Main Road, Ward 84 construction sites" className="mt-1" />
              </div>
              <div>
                <Label className="text-sm">Actions taken</Label>
                <div className="mt-2 grid grid-cols-1 gap-1.5">
                  {ACTION_TYPES.map((a) => (
                    <label key={a} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={actions.includes(a)} onCheckedChange={() => toggleAction(a)} />
                      <span>{a}</span>
                    </label>
                  ))}
                </div>
              </div>
              {requiresSourceReductionCount && (
                <div>
                  <Label htmlFor="src" className="text-sm">Number of source reduction activities completed <span className="text-risk-high">*</span></Label>
                  <Input id="src" type="number" min={0} value={sourceRed} onChange={(e) => setSourceRed(e.target.value)} className="mt-1" />
                </div>
              )}
              {actions.includes("Larval surveillance") && (
                <div><Label className="text-sm">Larval surveys completed</Label>
                  <Input type="number" min={0} value={larvalCount} onChange={(e) => setLarvalCount(e.target.value)} className="mt-1" /></div>
              )}
              {actions.includes("Fogging / space spraying") && (
                <div><Label className="text-sm">Fogging operations completed</Label>
                  <Input type="number" min={0} value={foggingCount} onChange={(e) => setFoggingCount(e.target.value)} className="mt-1" /></div>
              )}
              {actions.includes("Construction-site inspection") && (
                <div><Label className="text-sm">Construction sites inspected</Label>
                  <Input type="number" min={0} value={constrCount} onChange={(e) => setConstrCount(e.target.value)} className="mt-1" /></div>
              )}
              {actions.includes("Community awareness / IEC") && (
                <div><Label className="text-sm">IEC or awareness activities completed</Label>
                  <Input type="number" min={0} value={iecCount} onChange={(e) => setIecCount(e.target.value)} className="mt-1" /></div>
              )}
            </>
          )}

          {status === "no" && (
            <>
              <div>
                <Label className="text-sm">Reason no field activity was conducted</Label>
                <select
                  value={noReason}
                  onChange={(e) => setNoReason(e.target.value as NoActivityReason)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {NO_ACTIVITY_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {noReason === "Other" && (
                <div>
                  <Label className="text-sm">Please specify <span className="text-risk-high">*</span></Label>
                  <Input value={noReasonOther} onChange={(e) => setNoReasonOther(e.target.value)} className="mt-1" />
                </div>
              )}
            </>
          )}

          <div>
            <Label htmlFor="notes" className="text-sm">Additional notes</Label>
            <Textarea id="notes" maxLength={300} value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="mt-1" />
            <div className="text-[10px] text-muted-foreground text-right">{notes.length}/300</div>
          </div>

          {history.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-1.5">Previous Weekly Responses</div>
              <div className="space-y-1.5">
                {history.map((h) => (
                  <div key={h.id} className="rounded-md border border-border p-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{h.epidemiological_week}</span>
                      <span className="text-muted-foreground">{h.activity_date || "—"}</span>
                    </div>
                    <div className="text-muted-foreground mt-0.5">
                      {h.field_activity_status === "yes"
                        ? `Yes · ${h.personnel_deployed || 0} personnel · ${h.actions_taken?.length || 0} actions · SR ${h.source_reduction_count || 0}`
                        : h.field_activity_status === "no"
                          ? `No · ${h.no_activity_reason || ""}`
                          : "Report pending"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && <div className="text-xs text-risk-high">{error}</div>}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save response</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
