import { useState } from "react";
import DashboardLayout, { type TabId } from "@/components/DashboardLayout";
import OverviewScreen from "@/screens/OverviewScreen";
import CaseSurveillanceScreen from "@/screens/CaseSurveillanceScreen";
import ForecastScreen from "@/screens/ForecastScreen";
import WeatherScreen from "@/screens/WeatherScreen";
import HotspotsScreen from "@/screens/HotspotsScreen";
import DataUploadScreen from "@/screens/DataUploadScreen";
import { RoleProvider } from "@/contexts/RoleContext";

const screens: Record<TabId, React.ComponentType> = {
  overview: OverviewScreen,
  surveillance: CaseSurveillanceScreen,
  forecast: ForecastScreen,
  weather: WeatherScreen,
  hotspots: HotspotsScreen,
  upload: DataUploadScreen,
};

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const Screen = screens[activeTab];

  return (
    <RoleProvider>
      <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
        <Screen />
      </DashboardLayout>
    </RoleProvider>
  );
}
