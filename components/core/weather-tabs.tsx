'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WeatherTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function WeatherTabs({ activeTab, onTabChange }: WeatherTabsProps) {
  return (
    <TabsList className="w-full flex items-center justify-start gap-x-8 gap-y-3 overflow-x-auto pb-2 mb-6 border-b border-slate-200/50 dark:border-slate-800/40 bg-transparent scrollbar-none h-auto rounded-none justify-items-start">
      <TabsTrigger 
        value="weather" 
        className="group relative inline-flex items-center px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max"
      >
        Weather Risk
      </TabsTrigger>

      <TabsTrigger 
        value="forecast" 
        className="group relative inline-flex items-center px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max"
      >
        Forecast
      </TabsTrigger>

      <TabsTrigger 
        value="map" 
        className="group relative inline-flex items-center px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max"
      >
        Dynamic Map
      </TabsTrigger>

      <TabsTrigger 
        value="activity" 
        className="group relative inline-flex items-center px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max"
      >
        Activity Setup
      </TabsTrigger>

      <TabsTrigger 
        value="preferences" 
        className="group relative inline-flex items-center px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max"
      >
        Preferences
      </TabsTrigger>

      <TabsTrigger 
        value="data" 
        className="group relative inline-flex items-center px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max"
      >
        History Logs
      </TabsTrigger>

      <TabsTrigger 
        value="analysis" 
        className="group relative inline-flex items-center px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max"
      >
        Advanced Analysis
      </TabsTrigger>

      <TabsTrigger 
        value="historical" 
        className="group relative inline-flex items-center px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max"
      >
        Historical Stats
      </TabsTrigger>

      <TabsTrigger 
        value="ai-assistant" 
        className="group relative inline-flex items-center px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max"
      >
        AI Assistant
      </TabsTrigger>
    </TabsList>
  );
}