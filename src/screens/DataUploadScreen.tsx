import { useState, useCallback } from "react";
import { Upload, FileText } from "lucide-react";

export default function DataUploadScreen() {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", age: "", gender: "Male", location: "", diagnosisDate: "", testResult: "Positive" });

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) setFileName(file.name);
  }, []);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* CSV Upload */}
      <div className="section-card p-6">
        <h3 className="section-title mb-4">Upload CSV Data</h3>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-10 text-center transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-border"}`}
        >
          <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">Drag and drop a CSV file here, or click to browse</p>
          <input type="file" accept=".csv" onChange={handleFile} className="hidden" id="csv-upload" />
          <label htmlFor="csv-upload" className="inline-block h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer leading-9">
            Browse Files
          </label>
          {fileName && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-foreground">
              <FileText className="h-4 w-4" />
              {fileName}
            </div>
          )}
        </div>
      </div>

      {/* Manual Entry */}
      <div className="section-card p-6">
        <h3 className="section-title mb-4">Manual Entry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <label className="text-xs font-medium text-muted-foreground">Location *</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Diagnosis Date *</label>
            <input type="date" value={form.diagnosisDate} onChange={(e) => setForm({ ...form, diagnosisDate: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Test Result *</label>
            <select value={form.testResult} onChange={(e) => setForm({ ...form, testResult: e.target.value })} className="mt-1 w-full h-9 rounded-md border border-input px-3 text-sm">
              <option>Positive</option>
              <option>Negative</option>
              <option>Pending</option>
            </select>
          </div>
        </div>
        <button className="mt-6 h-10 px-6 rounded-md bg-primary text-primary-foreground font-medium text-sm">Submit Entry</button>
      </div>
    </div>
  );
}
