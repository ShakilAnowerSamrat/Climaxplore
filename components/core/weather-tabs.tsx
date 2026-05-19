'use client';

import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface WeatherTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

export function WeatherTabs({ activeTab, onTabChange }: WeatherTabsProps) {
  return (
    <TabsList className="w-full flex items-center justify-start gap-x-8 gap-y-3 overflow-x-auto pb-4 mb-8 border-b border-slate-200/50 dark:border-slate-800/40 bg-transparent scrollbar-none h-auto rounded-none justify-items-start">
      <TabsTrigger 
        value="weather" 
        className="group relative inline-flex items-center gap-1.5 px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200"
      >
        <span className="font-mono text-[9px] text-slate-300 dark:text-slate-600 group-data-[state=active]:text-cyan-500">01</span>
        Weather Risk
      </TabsTrigger>

      <TabsTrigger 
        value="forecast" 
        className="group relative inline-flex items-center gap-1.5 px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200"
      >
        <span className="font-mono text-[9px] text-slate-300 dark:text-slate-600 group-data-[state=active]:text-cyan-500">02</span>
        Forecast
      </TabsTrigger>

      <TabsTrigger 
        value="map" 
        className="group relative inline-flex items-center gap-1.5 px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200"
      >
        <span className="font-mono text-[9px] text-slate-300 dark:text-slate-600 group-data-[state=active]:text-cyan-500">03</span>
        Dynamic Map
      </TabsTrigger>

      <TabsTrigger 
        value="activity" 
        className="group relative inline-flex items-center gap-1.5 px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200"
      >
        <span className="font-mono text-[9px] text-slate-300 dark:text-slate-600 group-data-[state=active]:text-cyan-500">04</span>
        Activity Setup
      </TabsTrigger>

      <TabsTrigger 
        value="preferences" 
        className="group relative inline-flex items-center gap-1.5 px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200"
      >
        <span className="font-mono text-[9px] text-slate-300 dark:text-slate-600 group-data-[state=active]:text-cyan-500">05</span>
        Preferences
      </TabsTrigger>

      <TabsTrigger 
        value="data" 
        className="group relative inline-flex items-center gap-1.5 px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200"
      >
        <span className="font-mono text-[9px] text-slate-300 dark:text-slate-600 group-data-[state=active]:text-cyan-500">06</span>
        History Logs
      </TabsTrigger>

      <TabsTrigger 
        value="analysis" 
        className="group relative inline-flex items-center gap-1.5 px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200"
      >
        <span className="font-mono text-[9px] text-slate-300 dark:text-slate-600 group-data-[state=active]:text-cyan-500">07</span>
        Advanced Analysis
      </TabsTrigger>

      <TabsTrigger 
        value="historical" 
        className="group relative inline-flex items-center gap-1.5 px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200"
      >
        <span className="font-mono text-[9px] text-slate-300 dark:text-slate-600 group-data-[state=active]:text-cyan-500">08</span>
        Historical Stats
      </TabsTrigger>

      <TabsTrigger 
        value="ai-assistant" 
        className="group relative inline-flex items-center gap-1.5 px-0 py-2 text-xs font-semibold tracking-wider uppercase text-slate-400 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white border-b-2 border-transparent data-[state=active]:border-slate-900 dark:data-[state=active]:border-white bg-transparent shadow-none rounded-none cursor-pointer select-none transition-all duration-200"
      >
        <span className="font-mono text-[9px] text-slate-300 dark:text-slate-600 group-data-[state=active]:text-cyan-500">09</span>
        AI Assistant
      </TabsTrigger>
    </TabsList>
  );
}