import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NO_ACTIVITY_REASONS, makeRecordId } from "./types";
import type { AreaAggregate } from "./aggregation";
import type { NoActivityReason, WeeklyResponseRecord } from "./types";
import { useRole } from "@/contexts/RoleContext";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  agg: AreaAggregate | null;
  stateId: string;
  epiWeek: string;
  forecastGeneratedAt: string;
  onSave: (rec: WeeklyResponseRecord) => void;
}

/** Lightweight "no field activity this week" log: a reason + optional note. */
export default function NoActivityDialog({ open, onOpenChange, agg, stateId, epiWeek, forecastGeneratedAt, onSave }: Props) {
  const { currentRole } = useRole();
  const existing = agg?.primary;

  const [reason, setReason] = useState<NoActivityReason>("Staff unavailable");
  const [reasonOther, setReasonOther] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const row = agg?.row;

  useEffect(() => {
    if (!open) return;
    setReason((existing?.no_activity_reason as NoActivityReason) || "Staff unavailable");
    setReasonOther(existing?.no_activity_reason_other || "");
    setNotes(existing?.notes || "");
    setError(null);
  }, [open, existing]);

  if (!agg || !row) return null;
  const forecastGen = existing?.forecast_generated_at || forecastGeneratedAt;

  const handleSave = () => {
    if (reason === "Other" && !reasonOther.trim()) { setError("Please specify the reason."); return; }
    const now = new Date().toISOString();
    const geographyId = row.key;
    const rec: WeeklyResponseRecord = {
      id: makeRecordId(geographyId, epiWeek),
      epidemiological_week: epiWeek,
      forecast_ref: `FR-${epiWeek}`,
      forecast_generated_at: forecastGen,
      risk_level_at_capture: row.risk,
      state: stateId,
      district: row.district || "",
      block_or_municipality: row.block,
      ward_or_village: row.ward,
      geography_level: row.ward ? "ward" : row.block ? "block" : "district",
      geography_id: geographyId,
      geography_name: row.name,
      field_activity_status: "no",
      reporting_status: "no_activity",
      no_activity_reason: reason,
      no_activity_reason_other: reason === "Other" ? reasonOther : undefined,
      notes: notes || undefined,
      logged_by_user_id: existing?.logged_by_user_id || currentRole.id,
      logged_by_name: existing?.logged_by_name || currentRole.userName,
      logged_by_role: existing?.logged_by_role || currentRole.roleName,
      recorded_at: existing?.recorded_at || now,
      updated_at: now,
    };
    onSave(rec);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Mark as no activity</SheetTitle>
        </SheetHeader>

        <div className="mt-3 rounded-md bg-muted/40 p-3 text-xs space-y-0.5">
          <div><span className="text-muted-foreground">Area:</span> <span className="font-medium">{row.name}</span></div>
          <div><span className="text-muted-foreground">Geography:</span> {[row.district, row.block, row.ward].filter(Boolean).join(" › ")}</div>
          <div><span className="text-muted-foreground">Epidemiological week:</span> {epiWeek}</div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Records that no field activity was possible this week — keeps the area from being flagged as overdue.
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <Label className="text-sm">Reason <span className="text-risk-high">*</span></Label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as NoActivityReason)}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {NO_ACTIVITY_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {reason === "Other" && (
            <div>
              <Label className="text-sm">Please specify <span className="text-risk-high">*</span></Label>
              <Input value={reasonOther} onChange={(e) => setReasonOther(e.target.value)} className="mt-1" />
            </div>
          )}

          <div>
            <Label htmlFor="na-notes" className="text-sm">Notes (optional)</Label>
            <Textarea id="na-notes" maxLength={200} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1" />
            <div className="text-[10px] text-muted-foreground text-right">{notes.length}/200</div>
          </div>

          {error && <div className="text-xs text-risk-high">{error}</div>}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
