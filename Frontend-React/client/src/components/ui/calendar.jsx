import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

// Days of the week
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Get days in month
const getDaysInMonth = (year, month) => {
  return new Date(year, month + 1, 0).getDate();
};

// Get the first day of the month (0 = Sunday, 1 = Monday, etc.)
const getFirstDayOfMonth = (year, month) => {
  return new Date(year, month, 1).getDay();
};

// Check if two dates are the same day
const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export function Calendar({ 
  mode = 'single', 
  selected, 
  onSelect,
  disabled,
  initialFocus = false, 
  className
}) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(selected || today);
  const [currentMonth, setCurrentMonth] = useState(viewDate.getMonth());
  const [currentYear, setCurrentYear] = useState(viewDate.getFullYear());
  
  // Update viewDate when selected changes
  useEffect(() => {
    if (selected) {
      setViewDate(new Date(selected));
      setCurrentMonth(new Date(selected).getMonth());
      setCurrentYear(new Date(selected).getFullYear());
    }
  }, [selected]);
  
  // Focus on render if initialFocus is true
  useEffect(() => {
    if (initialFocus) {
      const calendarElement = document.getElementById('calendar-container');
      if (calendarElement) {
        calendarElement.focus();
      }
    }
  }, [initialFocus]);
  
  // Navigate to previous month
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Navigate to next month
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Handle date selection
  const handleDateSelect = (date) => {
    if (disabled) return;
    onSelect(date);
  };
  
  // Generate calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const days = [];
    
    // Add empty cells for days before the first of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9" />);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const isToday = isSameDay(date, today);
      const isSelected = selected && isSameDay(date, new Date(selected));
      
      days.push(
        <div key={`day-${day}`} className="text-center">
          <Button
            variant="ghost"
            className={cn(
              "h-9 w-9 p-0 font-normal",
              isToday && "bg-muted",
              isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              !isSelected && !isToday && "hover:bg-muted"
            )}
            onClick={() => handleDateSelect(date)}
            disabled={disabled}
          >
            {day}
          </Button>
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div 
      id="calendar-container"
      className={cn("p-3", className)}
      tabIndex={initialFocus ? 0 : undefined}
    >
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          disabled={disabled}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          disabled={disabled}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map(day => (
          <div key={day} className="text-center text-sm text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>
    </div>
  );
}