import { useState, useCallback } from "react";
import { Upload, FileText, Info, Download, CheckCircle } from "lucide-react";
import { uploadFormats } from "@/data/mockData";

export default function DataUploadScreen() {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState("nvbdcp_linelist");
  const [previewData, setPreviewData] = useState<string[][] | null>(null);
  const [form, setForm] = useState({
    name: "", age: "", gender: "Male", location: "", district: "",
    block: "", village: "", diagnosisDate: "", testType: "NS1",
    testResult: "Positive", urbanRural: "Urban", referredBy: "ASHA",
  });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith(".csv") || file.name.endsWith(".xlsx") || file.name.endsWith(".xls"))) {
      setFileName(file.name);
      // Simulated preview
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

  const currentFormat = uploadFormats.find((f) => f.id === selectedFormat);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
                selectedFormat === fmt.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/30"
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

        {/* Preview */}
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
              <button className="h-9 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium">
                Upload & Process
              </button>
              <span className="text-xs text-muted-foreground">Columns will be auto-mapped to system schema</span>
            </div>
          </div>
        )}
      </div>

      {/* Manual Entry — NVBDCP fields */}
      <div className="section-card p-6">
        <h3 className="section-title mb-4">Manual Entry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Name", key: "name", type: "text" },
            { label: "Age", key: "age", type: "number" },
          ].map((f) => (
            <div key={f.key}>
              <label className="text-xs font-medium text-muted-foreground">{f.label} *</label>
              <input
                type={f.type}
                value={form[f.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm"
              />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground">Gender *</label>
            <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm">
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">District *</label>
            <input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Block / CHC</label>
            <input value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Village / Ward</label>
            <input value={form.village} onChange={(e) => setForm({ ...form, village: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Address</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Diagnosis Date *</label>
            <input type="date" value={form.diagnosisDate} onChange={(e) => setForm({ ...form, diagnosisDate: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Test Type *</label>
            <select value={form.testType} onChange={(e) => setForm({ ...form, testType: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm">
              <option>NS1</option>
              <option>IgM</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Test Result *</label>
            <select value={form.testResult} onChange={(e) => setForm({ ...form, testResult: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm">
              <option>Positive</option>
              <option>Negative</option>
              <option>Pending</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Urban / Rural</label>
            <select value={form.urbanRural} onChange={(e) => setForm({ ...form, urbanRural: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm">
              <option>Urban</option>
              <option>Rural</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Referred By</label>
            <select value={form.referredBy} onChange={(e) => setForm({ ...form, referredBy: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm">
              <option>ASHA</option>
              <option>ANM</option>
              <option>AWW</option>
              <option>HW</option>
              <option>MO</option>
            </select>
          </div>
        </div>
        <button className="mt-6 h-10 px-6 rounded-md bg-primary text-primary-foreground font-medium text-sm">Submit Entry</button>
      </div>
    </div>
  );
}
