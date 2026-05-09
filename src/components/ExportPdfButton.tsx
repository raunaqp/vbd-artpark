import { Download } from "lucide-react";
import { exportTabAsPDF, type ExportSection } from "@/lib/export_view_pdf";
import { useFilters } from "@/contexts/FilterContext";
import { useDisease } from "@/contexts/DiseaseContext";
import { useStateSelection } from "@/contexts/StateContext";
import { stateOptions } from "@/data/mockData";

interface Props {
  tabName: string;
  buildSections: () => ExportSection[];
}

export default function ExportPdfButton({ tabName, buildSections }: Props) {
  const { appliedFilters } = useFilters();
  const { diseaseName } = useDisease();
  const { stateId } = useStateSelection();
  const stateLabel = stateOptions.find((s) => s.id === stateId)?.label ?? "State";

  const handleClick = () => {
    const path = [stateLabel];
    if (appliedFilters.district !== "All Districts") path.push(appliedFilters.district);
    if (appliedFilters.block !== "All Blocks") path.push(appliedFilters.block);
    if (appliedFilters.ward !== "All Wards") path.push(appliedFilters.ward);
    exportTabAsPDF({
      tabName,
      state: stateLabel,
      disease: diseaseName,
      geographyPath: path.join(" > "),
      asOfDate: new Date().toISOString().split("T")[0],
      sections: buildSections(),
    });
  };

  return (
    <button
      onClick={handleClick}
      className="h-8 px-3 rounded-md border border-input text-sm flex items-center gap-1.5 text-foreground hover:bg-muted transition-colors"
      title="Download current view as PDF"
    >
      <Download className="h-3.5 w-3.5" /> Export PDF
    </button>
  );
}
