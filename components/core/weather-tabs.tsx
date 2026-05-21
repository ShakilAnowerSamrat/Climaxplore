'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WeatherTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function WeatherTabs({ activeTab, onTabChange }: WeatherTabsProps) {
  return (
    <TabsList className="w-full flex items-center justify-start gap-x-8 gap-y-3 overflow-x-auto pb-2 mb-6 border-b border-slate-200/50 dark:border-slate-800/40 bg-transparent scrollbar-none h-auto rounded-none justify-items-start flex-nowrap">
      <TabsTrigger 
        value="weather" 
        className="group relative inline-flex items-center px-3 py-3 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        Weather Risk
      </TabsTrigger>

      <TabsTrigger 
        value="forecast" 
        className="group relative inline-flex items-center px-3 py-3 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        Forecast
      </TabsTrigger>

      <TabsTrigger 
        value="map" 
        className="group relative inline-flex items-center px-3 py-3 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        Dynamic Map
      </TabsTrigger>

      <TabsTrigger 
        value="activity" 
        className="group relative inline-flex items-center px-3 py-3 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        Activity Setup
      </TabsTrigger>

      <TabsTrigger 
        value="preferences" 
        className="group relative inline-flex items-center px-3 py-3 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        Preferences
      </TabsTrigger>

      <TabsTrigger 
        value="data" 
        className="group relative inline-flex items-center px-3 py-3 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        History Logs
      </TabsTrigger>

      <TabsTrigger 
        value="analysis" 
        className="group relative inline-flex items-center px-3 py-3 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        Advanced Analysis
      </TabsTrigger>

      <TabsTrigger 
        value="historical" 
        className="group relative inline-flex items-center px-3 py-3 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        Historical Stats
      </TabsTrigger>

      <TabsTrigger 
        value="ai-assistant" 
        className="group relative inline-flex items-center px-3 py-3 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200 flex-none min-w-max outline-none focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        AI Assistant
      </TabsTrigger>
    </TabsList>
  );
}