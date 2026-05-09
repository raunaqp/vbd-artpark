// Shared "Download current view" PDF exporter.
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type ExportSection =
  | { title: string; type: "table"; headers: string[]; rows: (string | number)[][] }
  | { title: string; type: "kv"; lines: string[] };

export interface ExportOpts {
  tabName: string;
  state: string;
  disease: string;
  geographyPath: string;
  asOfDate: string;
  sections: ExportSection[];
}

export function exportTabAsPDF(opts: ExportOpts) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });

  // Header
  doc.setFontSize(16);
  doc.setTextColor(31, 58, 95);
  doc.text(`${opts.tabName} — ${opts.geographyPath}`, 40, 50);
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`${opts.disease.toUpperCase()} · As of ${opts.asOfDate} · PRISM-H v3 (mock data)`, 40, 70);

  let y = 100;
  for (const section of opts.sections) {
    if (y > 740) { doc.addPage(); y = 50; }
    doc.setFontSize(13);
    doc.setTextColor(31, 58, 95);
    doc.text(section.title, 40, y);
    y += 18;

    if (section.type === "table") {
      autoTable(doc, {
        startY: y,
        head: [section.headers],
        body: section.rows.map(r => r.map(c => String(c ?? ""))),
        styles: { fontSize: 9, cellPadding: 4 },
        headStyles: { fillColor: [232, 238, 244], textColor: [31, 58, 95] },
        margin: { left: 40, right: 40 },
      });
      // @ts-expect-error autoTable adds lastAutoTable to doc
      y = doc.lastAutoTable.finalY + 24;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(34, 34, 34);
      for (const line of section.lines) {
        if (y > 780) { doc.addPage(); y = 50; }
        doc.text(line, 40, y);
        y += 16;
      }
      y += 12;
    }
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(
      `Generated ${new Date().toISOString().split("T")[0]} · Page ${i}/${pageCount} · ARTPARK PRISM-H`,
      40, 820,
    );
  }

  const slug = opts.tabName.toLowerCase().replace(/\s+/g, "-");
  doc.save(`prism-h-${slug}-${opts.asOfDate}.pdf`);
}
