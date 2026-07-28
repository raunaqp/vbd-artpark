import { useMemo, useState } from "react";
import { X } from "lucide-react";
import type { MockCase } from "@/data/mock_line_listing";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "@/hooks/use-toast";
import {
  saveCaseEdit,
  getBaseCase,
  getCaseNotes,
  type EditFields,
} from "@/lib/caseStore";
import {
  CASE_STATES,
  stateIdForLabel,
  hierarchyLabels,
  districtsForState,
  blocksForDistrict,
  wardsForBlock,
  urbanRuralForBlock,
} from "@/lib/caseHierarchy";

const TEST_TYPES: MockCase["testType"][] = ["NS1", "IgM", "RDT"];
const RESULTS: MockCase["testResult"][] = ["Positive", "Negative"];
const NOTES_MAX = 500;

interface Props {
  caseData: MockCase; // merged (effective) case
  onClose: () => void;
  onSaved: () => void;
}

interface FormState {
  testType: MockCase["testType"];
  testResult: MockCase["testResult"];
  date: string;
  state: string;
  stateId: MockCase["stateId"];
  district: string;
  block: string;
  ward: string;
  notes: string;
}

export default function EditCaseModal({ caseData, onClose, onSaved }: Props) {
  const { currentRole } = useRole();
  const openSnapshot = useMemo<FormState>(() => ({
    testType: caseData.testType,
    testResult: caseData.testResult,
    date: caseData.date,
    state: caseData.state,
    stateId: caseData.stateId,
    district: caseData.district,
    block: caseData.block,
    ward: caseData.ward,
    notes: getCaseNotes(caseData.uhid),
  }), [caseData]);

  const [form, setForm] = useState<FormState>(openSnapshot);
  const labels = hierarchyLabels(form.state);

  const districtOpts = useMemo(() => districtsForState(form.state), [form.state]);
  const blockOpts = useMemo(() => blocksForDistrict(form.state, form.district), [form.state, form.district]);
  const wardOpts = useMemo(() => wardsForBlock(form.state, form.district, form.block), [form.state, form.district, form.block]);

  // Cascading resets: state → district → block → ward.
  const onState = (label: string) => {
    const d0 = districtsForState(label)[0] ?? "";
    const b0 = blocksForDistrict(label, d0)[0] ?? "";
    const w0 = wardsForBlock(label, d0, b0)[0] ?? "";
    setForm((f) => ({ ...f, state: label, stateId: stateIdForLabel(label), district: d0, block: b0, ward: w0 }));
  };
  const onDistrict = (d: string) => {
    const b0 = blocksForDistrict(form.state, d)[0] ?? "";
    const w0 = wardsForBlock(form.state, d, b0)[0] ?? "";
    setForm((f) => ({ ...f, district: d, block: b0, ward: w0 }));
  };
  const onBlock = (b: string) => {
    const w0 = wardsForBlock(form.state, form.district, b)[0] ?? "";
    setForm((f) => ({ ...f, block: b, ward: w0 }));
  };

  const dirty = (Object.keys(openSnapshot) as (keyof FormState)[]).some((k) => form[k] !== openSnapshot[k]);

  const submit = () => {
    const base = getBaseCase(caseData.uhid);
    if (!base) return;
    // Persist only fields that differ from the immutable base record.
    const fields: EditFields = {};
    if (form.testType !== base.testType) fields.testType = form.testType;
    if (form.testResult !== base.testResult) fields.testResult = form.testResult;
    if (form.date !== base.date) fields.date = form.date;
    if (form.state !== base.state) { fields.state = form.state; fields.stateId = form.stateId; }
    if (form.district !== base.district) fields.district = form.district;
    if (form.block !== base.block) fields.block = form.block;
    if (form.ward !== base.ward) fields.ward = form.ward;
    const geoChanged = form.state !== base.state || form.district !== base.district || form.block !== base.block;
    if (geoChanged) {
      const ur = urbanRuralForBlock(form.state, form.district, form.block);
      if (ur !== base.urbanRural) fields.urbanRural = ur;
    }
    const baseNotes = "";
    if (form.notes !== baseNotes) fields.notes = form.notes.slice(0, NOTES_MAX);

    saveCaseEdit(caseData.uhid, fields, currentRole.userName);
    toast({ title: "Case updated", description: "Aggregations refreshed." });
    onSaved();
    onClose();
  };

  const selCls = "h-9 w-full rounded-md border border-input bg-background px-2 text-sm";
  const roCls = "h-9 w-full rounded-md border border-input bg-muted/50 px-2 text-sm flex items-center text-muted-foreground";

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="bg-card rounded-lg border border-border shadow-lg w-full max-w-lg max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-border sticky top-0 bg-card">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Edit case</h3>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">{caseData.uhid}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {/* Read-only */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Age (locked)"><div className={roCls}>{caseData.age}</div></Field>
            <Field label="Gender (locked)"><div className={roCls}>{caseData.gender}</div></Field>
          </div>

          {/* Clinical */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Test type">
              <select className={selCls} value={form.testType} onChange={(e) => setForm((f) => ({ ...f, testType: e.target.value as MockCase["testType"] }))}>
                {TEST_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Test result">
              <select className={selCls} value={form.testResult} onChange={(e) => setForm((f) => ({ ...f, testResult: e.target.value as MockCase["testResult"] }))}>
                {RESULTS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Date of testing">
            <input type="date" className={selCls} value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </Field>

          {/* Geography — cascading */}
          <Field label="State">
            <select className={selCls} value={form.state} onChange={(e) => onState(e.target.value)}>
              {CASE_STATES.map((s) => <option key={s.id} value={s.label}>{s.label}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={labels.level_1}>
              <select className={selCls} value={form.district} onChange={(e) => onDistrict(e.target.value)}>
                {districtOpts.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label={labels.level_2}>
              <select className={selCls} value={form.block} onChange={(e) => onBlock(e.target.value)}>
                {blockOpts.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </Field>
          </div>
          <Field label={labels.level_3}>
            <select className={selCls} value={form.ward} onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))}>
              {wardOpts.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </Field>

          {/* Notes */}
          <Field label={`Notes (optional, ${form.notes.length}/${NOTES_MAX})`}>
            <textarea
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm resize-none"
              rows={3}
              maxLength={NOTES_MAX}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </Field>
        </div>

        <div className="flex justify-end gap-2 px-5 py-3 border-t border-border sticky bottom-0 bg-card">
          <button onClick={onClose} className="h-8 px-3 rounded-md border border-input text-xs text-muted-foreground hover:bg-muted/50">Cancel</button>
          <button
            onClick={submit}
            disabled={!dirty}
            className="h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground mb-1 block">{label}</span>
      {children}
    </label>
  );
}
