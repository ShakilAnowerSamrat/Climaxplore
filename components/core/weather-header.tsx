'use client';

import { Satellite, Github, AlertOctagon, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface WeatherHeaderProps {
  onMissionControlToggle: () => void;
  weatherAnomalies: any[];
}

export function WeatherHeader({
  onMissionControlToggle,
  weatherAnomalies,
}: WeatherHeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const getThemeIcon = () => {
    if (!mounted) return <Monitor className="h-3.5 w-3.5" />;
    if (theme === 'light') return <Sun className="h-3.5 w-3.5" />;
    if (theme === 'dark') return <Moon className="h-3.5 w-3.5" />;
    return <Monitor className="h-3.5 w-3.5" />;
  };

  const getThemeLabel = () => {
    if (!mounted) return 'Theme';
    if (theme === 'light') return 'Light';
    if (theme === 'dark') return 'Dark';
    return 'System';
  };

  return (
    <header className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-8 border-b border-slate-200/50 dark:border-slate-800/40">
      <div className="space-y-2 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase tracking-widest font-mono">
          NASA Space Apps Challenge 2025
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tighter leading-none text-slate-900 dark:text-white uppercase select-none">
          Climaxplore
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono tracking-tight leading-snug">
          Atmospheric Risk & Meteorological Intel • Parade Risk Assessment Protocol
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 md:self-end">
        <button
          onClick={cycleTheme}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all shadow-sm active:scale-95 duration-100 uppercase tracking-wider font-mono cursor-pointer"
          aria-label="Toggle theme"
        >
          {getThemeIcon()}
          {getThemeLabel()}
        </button>

        <button
          onClick={onMissionControlToggle}
          className="inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 rounded-md text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-sm active:scale-95 duration-100 uppercase tracking-wider font-mono cursor-pointer"
        >
          <Satellite className="h-3.5 w-3.5" />
          Mission Control
        </button>

        <a
          href="https://github.com/ShakilAnowerSamrat/Climaxplore"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-md text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all shadow-sm active:scale-95 duration-100 uppercase tracking-wider font-mono"
        >
          <Github className="h-3.5 w-3.5" />
          GitHub
        </a>

        {weatherAnomalies.length > 0 && (
          <div className="w-full md:w-auto inline-flex items-center gap-2 px-4 py-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-800 dark:text-rose-300 rounded-md text-xs font-mono uppercase tracking-tight">
            <AlertOctagon className="h-3.5 w-3.5 text-rose-600 dark:text-rose-500 animate-pulse" />
            <span>
              {weatherAnomalies.length} anomaly detected
            </span>
          </div>
        )}
      </div>
    </header>
  );
}