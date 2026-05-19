'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWeatherContext } from '@/contexts/weather-context';
import { cn } from '@/lib/utils';
import { addMonths, format } from 'date-fns';
import { CalendarDaysIcon, CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import { getMonthDisplayName } from '../utils/weather-helpers';

interface WeatherAnalysisHeaderProps {
  activeTab: 'current' | 'future';
  selectedMonth: string;
  selectedDate: Date;
  futureWeather: any;
  isLoadingFuture: boolean;
  monthlyPrediction: any;
  isLoadingMonthly: boolean;
  locationName: string;
  onActiveTabChange: (value: 'current' | 'future') => void;
  onSelectedMonthChange: (value: string) => void;
  onSelectedDateChange: (date: Date | undefined) => void;
}

export function WeatherAnalysisHeader({
  activeTab,
  selectedMonth,
  selectedDate: propSelectedDate,
  futureWeather,
  isLoadingFuture,
  monthlyPrediction,
  isLoadingMonthly,
  locationName,
  onActiveTabChange,
  onSelectedMonthChange,
  onSelectedDateChange,
}: WeatherAnalysisHeaderProps) {
  // 🎯 Use Context for real-time date updates
  const { selectedDate: contextSelectedDate } = useWeatherContext();

  // Use context date with prop as fallback
  const selectedDate = contextSelectedDate || propSelectedDate;
  // 🔧 State to control popover open/close
  const [calendarOpen, setCalendarOpen] = useState(false);

  // 🔧 Handle date selection - close popover and trigger data fetch
  const handleDateSelect = (date: Date | undefined) => {
    console.log('[Calendar] Date selected:', date);
    if (date) {
      onSelectedDateChange(date);
      setCalendarOpen(false); // Close popover after selection
    }
  };

  // 🔧 Handle month change in month selector - trigger data fetch
  const handleMonthChange = (value: string) => {
    console.log('[Calendar] Month selector changed:', value);
    onSelectedMonthChange(value);

    // If switching back to current month, refetch NASA data for selected date
    if (value === 'current') {
      onSelectedDateChange(selectedDate);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weather Analysis</span>
          <div className="flex items-center gap-4">
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[200px]">
                <CalendarDaysIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Month</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <SelectItem key={month} value={`month${month}`}>
                    {format(addMonths(new Date(), month), 'MMMM yyyy')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedMonth === 'current' && (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-[240px] justify-start text-left font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date('2001-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}

            <Tabs
              value={activeTab}
              onValueChange={(value) =>
                onActiveTabChange(value as 'current' | 'future')
              }
            >
              <TabsList>
                <TabsTrigger value="current">Current</TabsTrigger>
                <TabsTrigger
                  value="future"
                  disabled={
                    selectedMonth === 'current'
                      ? !futureWeather && !isLoadingFuture
                      : !monthlyPrediction && !isLoadingMonthly
                  }
                >
                  {selectedMonth === 'current' ? 'Future' : 'Predicted'}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardTitle>
        <CardDescription>
          {activeTab === 'current'
            ? 'Current weather conditions and risk assessment'
            : selectedMonth === 'current'
            ? `Weather forecast for ${format(selectedDate, 'PPP')}`
            : `Predicted weather for ${getMonthDisplayName(selectedMonth)}`}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}