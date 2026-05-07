import { useState } from "react";
import DashboardLayout, { type TabId } from "@/components/DashboardLayout";
import OverviewScreen from "@/screens/OverviewScreen";
import CaseSurveillanceScreen from "@/screens/CaseSurveillanceScreen";
import ForecastScreen from "@/screens/ForecastScreen";
import WeatherScreen from "@/screens/WeatherScreen";
import HotspotsScreen from "@/screens/HotspotsScreen";
import SignalsScreen from "@/screens/SignalsScreen";
import DataUploadScreen from "@/screens/DataUploadScreen";
import ViewSettingsScreen from "@/screens/ViewSettingsScreen";
import AdminScreen from "@/screens/AdminScreen";
import { RoleProvider } from "@/contexts/RoleContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { DiseaseProvider } from "@/contexts/DiseaseContext";
import { StateProvider } from "@/contexts/StateContext";
import { BlockVisibilityProvider } from "@/contexts/BlockVisibilityContext";
import QADebugPanel from "@/components/QADebugPanel";

const screens: Record<TabId, React.ComponentType<{ onNavigate?: (tab: TabId) => void }>> = {
  overview: OverviewScreen,
  surveillance: CaseSurveillanceScreen,
  forecast: ForecastScreen,
  weather: WeatherScreen,
  hotspots: HotspotsScreen,
  signals: SignalsScreen,
  upload: DataUploadScreen,
  settings: ViewSettingsScreen,
  admin: AdminScreen,
};

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const Screen = screens[activeTab];

  return (
    <StateProvider>
      <RoleProvider>
        <DiseaseProvider>
          <FilterProvider>
            <BlockVisibilityProvider>
              <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
                <Screen onNavigate={setActiveTab} />
              </DashboardLayout>
              <QADebugPanel />
            </BlockVisibilityProvider>
          </FilterProvider>
        </DiseaseProvider>
      </RoleProvider>
    </StateProvider>
  );
}
