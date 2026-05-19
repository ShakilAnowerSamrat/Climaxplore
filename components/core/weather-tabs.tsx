'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WeatherTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function WeatherTabs({ activeTab, onTabChange }: WeatherTabsProps) {
  // Props are received but handled by parent Tabs component
  return (
    <TabsList className="grid w-full grid-cols-4 md:grid-cols-5 lg:grid-cols-9 gap-1">
      <TabsTrigger value="weather">Weather & Risk</TabsTrigger>
      <TabsTrigger value="forecast">Forecast</TabsTrigger>
      <TabsTrigger value="map">Interactive Map</TabsTrigger>
      <TabsTrigger value="activity">Activity Setup</TabsTrigger>
      <TabsTrigger value="preferences">Preferences</TabsTrigger>
      <TabsTrigger value="data">Data & History</TabsTrigger>
      <TabsTrigger value="analysis">Advanced Analysis</TabsTrigger>
      <TabsTrigger value="historical">Historical Data</TabsTrigger>
      <TabsTrigger value="ai-assistant">🤖 AI Assistant</TabsTrigger>
    </TabsList>
  );
}