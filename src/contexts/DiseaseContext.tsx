import { createContext, useContext, useState, type ReactNode } from "react";

export type DiseaseType = "dengue" | "malaria" | "chikungunya" | "other_vbd";

export interface DiseaseInfo {
  id: DiseaseType;
  label: string;
  shortLabel: string;
  testTypes: string[];
  actions: {
    high: { district: string[]; block: string[]; ward: string[] };
    moderate: { district: string[]; block: string[]; ward: string[] };
    low: { district: string[]; block: string[]; ward: string[] };
  };
  caseMultiplier: number; // to vary mock data per disease
}

export const diseases: DiseaseInfo[] = [
  {
    id: "dengue",
    label: "Dengue",
    shortLabel: "Dengue",
    testTypes: ["NS1", "IgM"],
    caseMultiplier: 1,
    actions: {
      high: {
        district: [
          "Deploy rapid response teams to affected blocks",
          "Increase hospital preparedness — stock IV fluids, platelets",
          "Activate district-level RRT with epidemiologist",
          "Issue public health advisory for the district",
        ],
        block: [
          "Intensive fogging in all affected wards (daily)",
          "Conduct larval surveys in identified clusters",
          "Set up temporary fever screening camps",
          "Deploy entomological team for vector assessment",
        ],
        ward: [
          "Remove stagnant water from all containers and tyres",
          "Door-to-door fever surveys — identify unreported cases",
          "Source reduction by ASHA / ANM workers",
          "Community mobilisation and IEC activities",
        ],
      },
      moderate: {
        district: [
          "Fogging in hotspot blocks (alternate days)",
          "Increase testing camps at PHCs",
          "Share advisory with block medical officers",
        ],
        block: [
          "Larval surveys in parks, construction sites, water bodies",
          "Strengthen syndromic surveillance at sub-centres",
          "Community awareness drives at schools and markets",
        ],
        ward: [
          "Anti-larval measures in public areas",
          "Monitor fever cases at ASHA level",
          "Distribute mosquito nets to vulnerable households",
        ],
      },
      low: {
        district: ["Routine surveillance and data review", "Preventive messaging via IEC"],
        block: ["Monitor weekly case trends", "Ensure timely data reporting"],
        ward: ["Routine environmental sanitation", "Awareness posters at community centres"],
      },
    },
  },
  {
    id: "malaria",
    label: "Malaria",
    shortLabel: "Malaria",
    testTypes: ["RDT", "Microscopy"],
    caseMultiplier: 0.7,
    actions: {
      high: {
        district: [
          "Deploy rapid response teams with anti-malarial drugs",
          "Activate indoor residual spraying (IRS) in affected blocks",
          "Distribute LLINs (long-lasting insecticidal nets)",
          "Issue district-wide malaria advisory",
        ],
        block: [
          "Indoor residual spraying in high-risk wards",
          "Mass blood survey (fever screening + RDT)",
          "Identify and treat breeding sites near water bodies",
          "Deploy ASHA workers for fever surveillance",
        ],
        ward: [
          "Door-to-door fever testing with RDT kits",
          "Distribute bed nets to every household",
          "Source reduction near stagnant water, ponds, ditches",
          "Community awareness on bed net usage",
        ],
      },
      moderate: {
        district: [
          "Targeted IRS in hotspot blocks",
          "Increase RDT testing at PHCs",
          "Coordinate with block medical officers on drug supply",
        ],
        block: [
          "Focal spraying in identified clusters",
          "Strengthen syndromic surveillance at sub-centres",
          "Community awareness on fever reporting",
        ],
        ward: [
          "Monitor fever cases at ASHA level",
          "Ensure bed net usage compliance",
          "Routine anti-larval operations near water sources",
        ],
      },
      low: {
        district: ["Routine surveillance and data review", "Preventive messaging via IEC"],
        block: ["Monitor weekly case trends", "Ensure timely data reporting"],
        ward: ["Routine environmental sanitation", "Awareness posters at community centres"],
      },
    },
  },
  {
    id: "chikungunya",
    label: "Chikungunya",
    shortLabel: "Chikungunya",
    testTypes: ["IgM ELISA", "RT-PCR"],
    caseMultiplier: 0.5,
    actions: {
      high: {
        district: [
          "Deploy rapid response teams to affected blocks",
          "Activate vector control teams for Aedes management",
          "Issue public advisory on joint pain / fever symptoms",
          "Stock analgesics and supportive care at hospitals",
        ],
        block: [
          "Intensive source reduction campaigns",
          "Conduct larval surveys in all wards",
          "Set up temporary fever and joint pain screening camps",
          "Deploy entomological team for vector assessment",
        ],
        ward: [
          "Remove stagnant water from all containers",
          "Door-to-door fever + joint pain surveys",
          "Source reduction by ASHA / ANM workers",
          "Community mobilisation for clean surroundings",
        ],
      },
      moderate: {
        district: [
          "Fogging in hotspot blocks (alternate days)",
          "Increase testing at PHCs",
          "Share advisory with block medical officers",
        ],
        block: [
          "Larval surveys in parks, construction sites",
          "Strengthen syndromic surveillance at sub-centres",
          "Community awareness drives",
        ],
        ward: [
          "Anti-larval measures in public areas",
          "Monitor fever + arthralgia cases at ASHA level",
          "Community awareness on symptoms",
        ],
      },
      low: {
        district: ["Routine surveillance and data review", "Preventive messaging via IEC"],
        block: ["Monitor weekly case trends", "Ensure timely data reporting"],
        ward: ["Routine environmental sanitation", "Awareness posters at community centres"],
      },
    },
  },
  {
    id: "other_vbd",
    label: "Other VBDs",
    shortLabel: "Other VBDs",
    testTypes: ["RDT", "ELISA", "PCR"],
    caseMultiplier: 0.3,
    actions: {
      high: {
        district: [
          "Deploy rapid response teams",
          "Activate vector control operations",
          "Issue public health advisory",
          "Coordinate with state epidemiologist",
        ],
        block: [
          "Intensive vector control in affected wards",
          "Conduct fever screening camps",
          "Deploy entomological team",
          "Strengthen syndromic surveillance",
        ],
        ward: [
          "Door-to-door fever surveys",
          "Source reduction by health workers",
          "Community mobilisation and IEC activities",
          "Ensure timely case reporting",
        ],
      },
      moderate: {
        district: ["Targeted vector control", "Increase testing at PHCs", "Share advisory with BMOs"],
        block: ["Focal spraying in clusters", "Community awareness drives", "Syndromic surveillance"],
        ward: ["Anti-vector measures", "Monitor fever cases", "Community awareness"],
      },
      low: {
        district: ["Routine surveillance", "Preventive messaging"],
        block: ["Monitor weekly trends", "Timely data reporting"],
        ward: ["Environmental sanitation", "Awareness activities"],
      },
    },
  },
];

interface DiseaseContextType {
  currentDisease: DiseaseInfo;
  setDisease: (id: DiseaseType) => void;
  diseaseName: string;
}

const DiseaseContext = createContext<DiseaseContextType | null>(null);

export function DiseaseProvider({ children }: { children: ReactNode }) {
  const [diseaseId, setDiseaseId] = useState<DiseaseType>("dengue");
  const currentDisease = diseases.find((d) => d.id === diseaseId) || diseases[0];

  return (
    <DiseaseContext.Provider value={{ currentDisease, setDisease: setDiseaseId, diseaseName: currentDisease.label }}>
      {children}
    </DiseaseContext.Provider>
  );
}

export function useDisease(): DiseaseContextType {
  const ctx = useContext(DiseaseContext);
  if (!ctx) throw new Error("useDisease must be used within DiseaseProvider");
  return ctx;
}
