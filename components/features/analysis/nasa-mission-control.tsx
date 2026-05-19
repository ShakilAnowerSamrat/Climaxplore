'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AtmosphericConditionsMission } from './components/atmospheric-conditions-mission';
import { EnvironmentalHazardAssessment } from './components/environmental-hazard-assessment';
import { MissionControls } from './components/mission-controls';
import { MissionHeader } from './components/mission-header';
import { MissionLoading } from './components/mission-loading';
import { MissionStatus } from './components/mission-status';
import { NASADataDashboard } from './components/nasa-data-dashboard';
import { SolarActivity } from './components/solar-activity';
import { useNasaMissionControl } from './hooks/use-nasa-mission-control';

interface MissionControlProps {
  weatherData: any;
  location: string;
  onLocationChange: (location: string) => void;
  coordinates?: { lat: number; lon: number };
  selectedDate?: Date;
  nasaData?: any;
}

export function NASAMissionControl({
  weatherData,
  location,
  onLocationChange,
  coordinates,
  selectedDate,
  nasaData,
}: MissionControlProps) {
  const {
    missionTime,
    systemStatus,
    getAtmosphericPressureStatus,
    getVisibilityStatus,
    getUVIndexStatus,
  } = useNasaMissionControl();

  if (!weatherData) {
    return <MissionLoading />;
  }

  const pressureStatus = getAtmosphericPressureStatus(
    weatherData.main?.pressure || 1013
  );
  const visibilityStatus = getVisibilityStatus(weatherData.visibility || 10000);
  const uvStatus = getUVIndexStatus(weatherData.uvi || 0);

  // Extract coordinates from weather data or use provided
  const lat = coordinates?.lat || weatherData.coord?.lat || 0;
  const lon = coordinates?.lon || weatherData.coord?.lon || 0;

  return (
    <div className="min-h-screen bg-background p-4">
      <MissionHeader
        missionTime={missionTime}
        systemStatus={systemStatus}
        location={location}
        selectedDate={selectedDate}
        coordinates={{ lat, lon }}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Mission Overview</TabsTrigger>
          <TabsTrigger value="nasa-data">NASA Data & Analytics</TabsTrigger>
          <TabsTrigger value="systems">Environmental Systems</TabsTrigger>
        </TabsList>

        {/* NASA Data & Analytics Tab */}
        <TabsContent value="nasa-data" className="space-y-6">
          <NASADataDashboard location={{ lat, lon }} locationName={location} />
        </TabsContent>

        {/* Mission Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Primary Weather Systems */}
            <div className="lg:col-span-2 space-y-6">
              {/* Atmospheric Conditions */}
              <AtmosphericConditionsMission
                weatherData={weatherData}
                pressureStatus={pressureStatus}
                nasaData={nasaData}
              />

              {/* Environmental Hazard Assessment */}
              <EnvironmentalHazardAssessment
                weatherData={weatherData}
                visibilityStatus={visibilityStatus}
                uvStatus={uvStatus}
                nasaData={nasaData}
              />
            </div>

            {/* Mission Control Sidebar */}
            <div className="space-y-6">
              {/* Solar Activity */}
              <SolarActivity weatherData={weatherData} />

              {/* Mission Status */}
              <MissionStatus />

              {/* Quick Actions */}
              <MissionControls onLocationChange={onLocationChange} />
            </div>
          </div>
        </TabsContent>

        {/* Environmental Systems Tab */}
        <TabsContent value="systems" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AtmosphericConditionsMission
              weatherData={weatherData}
              pressureStatus={pressureStatus}
              nasaData={nasaData}
            />
            <EnvironmentalHazardAssessment
              weatherData={weatherData}
              visibilityStatus={visibilityStatus}
              uvStatus={uvStatus}
              nasaData={nasaData}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}