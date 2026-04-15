import { useState, useCallback } from "react";
import { Upload, FileText, Info, Download, CheckCircle, Plus, Trash2 } from "lucide-react";
import { uploadFormats } from "@/data/mockData";

interface ManualRow {
  id: number;
  name: string;
  age: string;
  gender: string;
  district: string;
  block: string;
  village: string;
  diagnosisDate: string;
  testType: string;
  testResult: string;
  urbanRural: string;
  referredBy: string;
}

const emptyRow = (id: number): ManualRow => ({
  id, name: "", age: "", gender: "Male", district: "", block: "", village: "",
  diagnosisDate: "", testType: "NS1", testResult: "Positive", urbanRural: "Urban", referredBy: "ASHA",
});

export default function DataUploadScreen() {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("nvbdcp_linelist");
  const [previewData, setPreviewData] = useState<string[][] | null>(null);
  const [manualRows, setManualRows] = useState<ManualRow[]>([emptyRow(1), emptyRow(2), emptyRow(3)]);
  const [nextId, setNextId] = useState(4);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      setFileName(file.name);
      setPreviewData([
        ["SL. NO", "SS Name", "Date of Testing", "Name", "Sex", "Age", "District", "Result"],
        ["1", "DHH Vizag", "01/04/2026", "Ravi K", "M", "32", "Visakhapatnam", "Positive"],
        ["2", "PHC Tenali", "02/04/2026", "Lakshmi P", "F", "28", "Guntur", "Negative"],
        ["3", "DHH Krishna", "03/04/2026", "Suresh M", "M", "45", "Krishna", "Positive"],
      ]);
    }
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setPreviewData([
        ["SL. NO", "SS Name", "Date of Testing", "Name", "Sex", "Age", "District", "Result"],
        ["1", "DHH Vizag", "01/04/2026", "Ravi K", "M", "32", "Visakhapatnam", "Positive"],
        ["2", "PHC Tenali", "02/04/2026", "Lakshmi P", "F", "28", "Guntur", "Negative"],
      ]);
    }
  };

  const addRow = () => {
    setManualRows([...manualRows, emptyRow(nextId)]);
    setNextId(nextId + 1);
  };

  const removeRow = (id: number) => {
    if (manualRows.length > 1) {
      setManualRows(manualRows.filter((r) => r.id !== id));
    }
  };

  const updateRow = (id: number, field: keyof ManualRow, value: string) => {
    setManualRows(manualRows.map((r) => r.id === id ? { ...r, [field]: value } : r));
  };

  const currentFormat = uploadFormats.find((f) => f.id === selectedFormat);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Info Banner */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2.5 text-sm">
        <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-muted-foreground">Data will reflect in dashboard within 15 minutes after successful upload.</span>
      </div>

      {/* Format Selection + Template Downloads */}
      <div className="section-card p-5">
        <h3 className="section-title mb-1">Select Upload Format</h3>
        <p className="text-xs text-muted-foreground mb-4">Choose the reporting format that matches your data</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {uploadFormats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setSelectedFormat(fmt.id)}
              className={`text-left p-3 rounded-lg border transition-colors ${
                selectedFormat === fmt.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{fmt.name}</span>
                {selectedFormat === fmt.id && <CheckCircle className="h-4 w-4 text-primary" />}
              </div>
              <p className="text-xs text-muted-foreground">{fmt.description}</p>
            </button>
          ))}
        </div>
        {currentFormat && (
          <div className="mt-4 flex items-center gap-3">
            <button className="h-8 px-3 rounded-md border border-input text-sm flex items-center gap-1.5 text-muted-foreground hover:bg-muted/50 transition-colors">
              <Download className="h-3.5 w-3.5" /> Download Template — {currentFormat.name}
            </button>
            <span className="text-xs text-muted-foreground">
              {currentFormat.columns.length} columns: {currentFormat.columns.slice(0, 4).join(", ")}…
            </span>
          </div>
        )}
      </div>

      {/* CSV / Excel Upload */}
      <div className="section-card p-6">
        <h3 className="section-title mb-1">Upload Data File</h3>
        <p className="text-xs text-muted-foreground mb-4">Accepts CSV and Excel files · Columns will be auto-mapped to {currentFormat?.name || "selected"} schema</p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-border"}`}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">Drag and drop a CSV or Excel file here, or click to browse</p>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload" className="inline-block h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer leading-9">
            Browse Files
          </label>
        </div>

        {fileName && previewData && (
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-foreground mb-3">
              <FileText className="h-4 w-4" />
              <span className="font-medium">{fileName}</span>
              <span className="text-xs text-muted-foreground ml-2">Preview (first {previewData.length - 1} rows)</span>
            </div>
            <div className="overflow-auto rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {previewData[0].map((h, i) => (
                      <th key={i} className="text-left py-2 px-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(1).map((row, ri) => (
                    <tr key={ri} className="border-b border-border/50">
                      {row.map((cell, ci) => (
                        <td key={ci} className="py-2 px-3 whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <button className="h-9 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium">Upload & Process</button>
              <span className="text-xs text-muted-foreground">Columns will be auto-mapped to system schema</span>
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry — Editable Table */}
      <div className="section-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="section-title">Manual Entry</h3>
            <p className="text-xs text-muted-foreground mt-1">Add rows to enter cases manually</p>
          </div>
          <button onClick={addRow} className="h-8 px-3 rounded-md border border-input text-sm flex items-center gap-1.5 text-muted-foreground hover:bg-muted/50 transition-colors">
            <Plus className="h-3.5 w-3.5" /> Add Row
          </button>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Name", "Age", "Gender", "District", "Block", "Village", "Date", "Test", "Result", "Area", "Ref By", ""].map((h) => (
                  <th key={h} className="text-left py-2 px-1.5 text-xs font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {manualRows.map((row) => (
                <tr key={row.id} className="border-b border-border/50">
                  <td className="py-1.5 px-1.5"><input value={row.name} onChange={(e) => updateRow(row.id, "name", e.target.value)} className="w-24 h-7 rounded border border-input px-1.5 text-xs" placeholder="Name" /></td>
                  <td className="py-1.5 px-1.5"><input value={row.age} onChange={(e) => updateRow(row.id, "age", e.target.value)} className="w-12 h-7 rounded border border-input px-1.5 text-xs" placeholder="Age" type="number" /></td>
                  <td className="py-1.5 px-1.5">
                    <select value={row.gender} onChange={(e) => updateRow(row.id, "gender", e.target.value)} className="h-7 rounded border border-input px-1 text-xs">
                      <option>Male</option><option>Female</option><option>Other</option>
                    </select>
                  </td>
                  <td className="py-1.5 px-1.5"><input value={row.district} onChange={(e) => updateRow(row.id, "district", e.target.value)} className="w-24 h-7 rounded border border-input px-1.5 text-xs" placeholder="District" /></td>
                  <td className="py-1.5 px-1.5"><input value={row.block} onChange={(e) => updateRow(row.id, "block", e.target.value)} className="w-20 h-7 rounded border border-input px-1.5 text-xs" placeholder="Block" /></td>
                  <td className="py-1.5 px-1.5"><input value={row.village} onChange={(e) => updateRow(row.id, "village", e.target.value)} className="w-20 h-7 rounded border border-input px-1.5 text-xs" placeholder="Village" /></td>
                  <td className="py-1.5 px-1.5"><input type="date" value={row.diagnosisDate} onChange={(e) => updateRow(row.id, "diagnosisDate", e.target.value)} className="h-7 rounded border border-input px-1 text-xs" /></td>
                  <td className="py-1.5 px-1.5">
                    <select value={row.testType} onChange={(e) => updateRow(row.id, "testType", e.target.value)} className="h-7 rounded border border-input px-1 text-xs">
                      <option>NS1</option><option>IgM</option>
                    </select>
                  </td>
                  <td className="py-1.5 px-1.5">
                    <select value={row.testResult} onChange={(e) => updateRow(row.id, "testResult", e.target.value)} className="h-7 rounded border border-input px-1 text-xs">
                      <option>Positive</option><option>Negative</option><option>Pending</option>
                    </select>
                  </td>
                  <td className="py-1.5 px-1.5">
                    <select value={row.urbanRural} onChange={(e) => updateRow(row.id, "urbanRural", e.target.value)} className="h-7 rounded border border-input px-1 text-xs">
                      <option>Urban</option><option>Rural</option>
                    </select>
                  </td>
                  <td className="py-1.5 px-1.5">
                    <select value={row.referredBy} onChange={(e) => updateRow(row.id, "referredBy", e.target.value)} className="h-7 rounded border border-input px-1 text-xs">
                      <option>ASHA</option><option>ANM</option><option>AWW</option><option>HW</option><option>MO</option>
                    </select>
                  </td>
                  <td className="py-1.5 px-1.5">
                    <button onClick={() => removeRow(row.id)} className="h-7 w-7 rounded flex items-center justify-center text-muted-foreground hover:text-risk-high hover:bg-risk-high/10 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="mt-4 h-10 px-6 rounded-md bg-primary text-primary-foreground font-medium text-sm">Submit All Entries</button>
      </div>
    </div>
  );
}
