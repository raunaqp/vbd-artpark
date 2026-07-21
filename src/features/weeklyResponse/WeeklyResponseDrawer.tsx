import { useEffect, useMemo, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Search } from "lucide-react";
import { ACTIVITY_TAXONOMY } from "@/data/mock_dataset";
import { getWardsUnderSelection, getActiveDisease } from "@/data/canonical";
import { makeRecordId } from "./types";
import type { AreaAggregate } from "./aggregation";
import type { WeeklyResponseRecord } from "./types";
import { useRole } from "@/contexts/RoleContext";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  agg: AreaAggregate | null;
  stateId: string;
  epiWeek: string;
  weekEnding: string;
  forecastGeneratedAt: string;
  onSave: (rec: WeeklyResponseRecord) => void;
  historyRecords: WeeklyResponseRecord[]; // records for this row across recent weeks
}

const todayIso = () => new Date().toISOString().slice(0, 10);
const riskLabel = (r: string) => (r === "no_data" ? "No forecast" : r.charAt(0).toUpperCase() + r.slice(1));

export default function WeeklyResponseDrawer({ open, onOpenChange, agg, stateId, epiWeek, forecastGeneratedAt, onSave }: Props) {
  const { currentRole } = useRole();
  const existing = agg?.primary;

  const [activityDate, setActivityDate] = useState<string>(todayIso());
  const [activities, setActivities] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);
  const [wardSearch, setWardSearch] = useState<string>("");
  const [personnel, setPersonnel] = useState<string>("");
  const [designation, setDesignation] = useState<string>("");
  const [households, setHouseholds] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const row = agg?.row;

  // Wards/villages available for this geography. `parent` is shown as muted context.
  const wardOptions = useMemo(() => {
    if (!row) return [];
    return getWardsUnderSelection(getActiveDisease(), stateId, row.district || undefined, row.block || undefined, row.ward || undefined);
  }, [row, stateId]);

  useEffect(() => {
    if (!open || !row) return;
    if (existing) {
      setActivityDate(existing.activity_date || todayIso());
      setActivities(existing.activities_performed || []);
      setWards(existing.wards_affected || (row.ward ? [row.ward] : []));
      setPersonnel(existing.personnel_deployed?.toString() || "");
      setDesignation(existing.personnel_designation || "");
      setHouseholds(existing.households_covered?.toString() || "");
      setNotes(existing.notes || "");
    } else {
      setActivityDate(todayIso());
      setActivities([]);
      // At ward level, preselect that ward; the officer can add more siblings.
      setWards(row.ward ? [row.ward] : []);
      setPersonnel("");
      setDesignation("");
      setHouseholds("");
      setNotes("");
    }
    setWardSearch("");
    setError(null);
  }, [open, existing, row]);

  const toggleActivity = (a: string) =>
    setActivities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  const toggleWard = (w: string) =>
    setWards((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));

  const filteredWardOptions = useMemo(() => {
    const q = wardSearch.trim().toLowerCase();
    if (!q) return wardOptions;
    return wardOptions.filter((o) => o.ward.toLowerCase().includes(q) || o.parent.toLowerCase().includes(q));
  }, [wardOptions, wardSearch]);

  const parentOf = (ward: string) => wardOptions.find((o) => o.ward === ward)?.parent;

  if (!agg || !row) return null;
  const forecastRef = `FR-${epiWeek}`;
  const forecastGen = existing?.forecast_generated_at || forecastGeneratedAt;

  const handleSave = () => {
    if (activities.length === 0) { setError("Select at least one activity performed."); return; }
    if (wards.length === 0) { setError("Select at least one ward where activities were performed."); return; }
    const personnelNum = Number(personnel);
    if (!personnel || !Number.isFinite(personnelNum) || personnelNum <= 0) { setError("Personnel deployed must be greater than 0."); return; }
    const householdsNum = Number(households);
    if (households === "" || !Number.isFinite(householdsNum) || householdsNum < 0) { setError("Households covered must be 0 or more."); return; }

    const now = new Date().toISOString();
    const geographyId = row.key;
    const id = makeRecordId(geographyId, epiWeek);
    const rec: WeeklyResponseRecord = {
      id,
      epidemiological_week: epiWeek,
      forecast_ref: forecastRef,
      forecast_generated_at: forecastGen,
      risk_level_at_capture: row.risk,
      state: stateId,
      disease: getActiveDisease(),
      district: row.district || "",
      block_or_mun: row.block,
      ward_or_village: row.ward,
      geography_level: row.ward ? "ward" : row.block ? "block" : "district",
      geography_id: geographyId,
      geography_name: row.name,
      field_activity_status: "yes",
      reporting_status: "completed",
      activity_date: activityDate,
      activities_performed: activities,
      wards_affected: wards,
      personnel_deployed: personnelNum,
      personnel_designation: designation || undefined,
      households_covered: householdsNum,
      notes: notes || undefined,
      logged_by_user_id: existing?.logged_by_user_id || currentRole.id,
      logged_by_name: existing?.logged_by_name || currentRole.userName,
      logged_by_role: existing?.logged_by_role || currentRole.roleName,
      recorded_at: existing?.recorded_at || now,
      logged_at: existing?.recorded_at || now,
      updated_at: now,
    };
    onSave(rec);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{existing ? "Edit weekly response" : "Log weekly response"}</SheetTitle>
        </SheetHeader>

        {/* Read-only prefill (auto-filled from scope + forecast + user) */}
        <div className="mt-3 rounded-md bg-muted/40 p-3 text-xs space-y-0.5">
          <div><span className="text-muted-foreground">Area:</span> <span className="font-medium">{row.name}</span></div>
          <div><span className="text-muted-foreground">Geography:</span> {[row.district, row.block, row.ward].filter(Boolean).join(" › ")}</div>
          <div><span className="text-muted-foreground">Epidemiological week:</span> {epiWeek}</div>
          <div><span className="text-muted-foreground">Forecast reference:</span> {forecastRef}</div>
          <div><span className="text-muted-foreground">Forecast risk at capture:</span> {riskLabel(row.risk)}</div>
          <div><span className="text-muted-foreground">Logged by:</span> {currentRole.userName} · {currentRole.roleName}</div>
        </div>

        <div className="mt-4 space-y-5">
          {/* 1 — Activity Date */}
          <div>
            <Label htmlFor="activityDate" className="text-sm">Activity date <span className="text-risk-high">*</span></Label>
            <Input id="activityDate" type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} className="mt-1" />
          </div>

          {/* 2 — Activities Performed (multi-select, ordered ACTIVITY_TAXONOMY) */}
          <div>
            <Label className="text-sm">Activities performed <span className="text-risk-high">*</span></Label>
            <div className="mt-2 grid grid-cols-1 gap-1.5 rounded-md border border-border p-2">
              {ACTIVITY_TAXONOMY.map((a) => (
                <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={activities.includes(a)} onCheckedChange={() => toggleActivity(a)} />
                  <span>{a}</span>
                </label>
              ))}
            </div>
            {activities.length > 0 && <div className="text-[10px] text-muted-foreground mt-1">{activities.length} selected</div>}
          </div>

          {/* 3 — Wards where activities performed (mandatory, hierarchy-aware, searchable) */}
          <div>
            <Label className="text-sm">Wards where activities performed <span className="text-risk-high">*</span></Label>
            {wards.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {wards.map((w) => (
                  <span key={w} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary text-xs px-2 py-0.5">
                    {w}
                    {parentOf(w) && <span className="text-primary/60">· {parentOf(w)}</span>}
                    <button type="button" onClick={() => toggleWard(w)} className="hover:text-risk-high"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="mt-2 relative">
              <Search className="absolute left-2 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={wardSearch}
                onChange={(e) => setWardSearch(e.target.value)}
                placeholder={`Search ${wardOptions.length} wards to add…`}
                className="pl-7 h-8 text-sm"
              />
            </div>
            <ScrollArea className="mt-1 h-40 rounded-md border border-border">
              <div className="p-1">
                {filteredWardOptions.length === 0 && (
                  <div className="text-xs text-muted-foreground px-2 py-3 text-center">No wards match "{wardSearch}"</div>
                )}
                {filteredWardOptions.map((o) => (
                  <label key={`${o.parent}/${o.ward}`} className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted/50 cursor-pointer">
                    <Checkbox checked={wards.includes(o.ward)} onCheckedChange={() => toggleWard(o.ward)} />
                    <span className="flex-1">{o.ward}</span>
                    <span className="text-[11px] text-muted-foreground">· {o.parent}</span>
                  </label>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* 4 & 5 — Personnel Deployed + Designation */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="personnel" className="text-sm">Personnel deployed <span className="text-risk-high">*</span></Label>
              <Input id="personnel" type="number" min={1} value={personnel} onChange={(e) => setPersonnel(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label htmlFor="designation" className="text-sm">Personnel designation</Label>
              <Input id="designation" value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="e.g. ASHA + PHC Nurse" className="mt-1" />
            </div>
          </div>

          {/* 6 — Households Covered */}
          <div>
            <Label htmlFor="households" className="text-sm">Households covered <span className="text-risk-high">*</span></Label>
            <Input id="households" type="number" min={0} value={households} onChange={(e) => setHouseholds(e.target.value)} className="mt-1" />
          </div>

          {/* 7 — Notes (optional, 500 max) */}
          <div>
            <Label htmlFor="notes" className="text-sm">Notes (optional)</Label>
            <Textarea id="notes" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="mt-1" />
            <div className="text-[10px] text-muted-foreground text-right">{notes.length}/500</div>
          </div>

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
