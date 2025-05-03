import { useState, useEffect, createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

// Create context for tabs
const TabsContext = createContext({
  value: '',
  onValueChange: () => {},
});

export function Tabs({ 
  defaultValue, 
  value, 
  onValueChange,
  className,
  children 
}) {
  const [selectedTab, setSelectedTab] = useState(value || defaultValue || '');
  
  // Update the selected tab when the value prop changes
  useEffect(() => {
    if (value !== undefined) {
      setSelectedTab(value);
    }
  }, [value]);
  
  const handleValueChange = (newValue) => {
    if (onValueChange) {
      onValueChange(newValue);
    } else if (value === undefined) {
      setSelectedTab(newValue);
    }
  };
  
  const contextValue = {
    value: selectedTab,
    onValueChange: handleValueChange,
  };
  
  return (
    <TabsContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children }) {
  return (
    <div className={cn('inline-flex items-center justify-center bg-muted p-1 rounded-md', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ className, value, children, disabled }) {
  const { value: selectedValue, onValueChange } = useContext(TabsContext);
  const isSelected = selectedValue === value;
  
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isSelected 
          ? 'bg-background text-foreground shadow-sm'
          : 'text-muted-foreground hover:bg-muted/80',
        className
      )}
      onClick={() => onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ className, value, children }) {
  const { value: selectedValue } = useContext(TabsContext);
  const isSelected = selectedValue === value;
  
  if (!isSelected) return null;
  
  return (
    <div
      role="tabpanel"
      className={cn(
        'ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      {children}
    </div>
  );
}