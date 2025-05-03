import { useState, useRef, useEffect, forwardRef, createContext, useContext, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Create context for select
const SelectContext = createContext({
  value: undefined,
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
  triggerRef: null,
  contentRef: null,
});

export function Select({ 
  children, 
  value, 
  defaultValue, 
  onValueChange,
  disabled = false
}) {
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);
  
  // Allow controlled and uncontrolled usage
  const selectedValue = value !== undefined ? value : internalValue;
  
  const handleValueChange = (newValue) => {
    setInternalValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
    setOpen(false);
  };
  
  // Close select when clicking outside
  useEffect(() => {
    if (!open) return;
    
    const handleClickOutside = (event) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);
  
  // Handle Escape key press
  useEffect(() => {
    if (!open) return;
    
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);
  
  const contextValue = {
    value: selectedValue,
    onValueChange: handleValueChange,
    open,
    setOpen,
    triggerRef,
    contentRef,
    disabled,
  };
  
  return (
    <SelectContext.Provider value={contextValue}>
      {children}
    </SelectContext.Provider>
  );
}

export const SelectTrigger = forwardRef(({ 
  className, 
  children, 
  ...props 
}, ref) => {
  const { value, open, setOpen, triggerRef, disabled } = useContext(SelectContext);
  
  // Merge refs
  const handleRef = (el) => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(el);
      } else {
        ref.current = el;
      }
    }
    triggerRef.current = el;
  };
  
  return (
    <button
      type="button"
      role="combobox"
      aria-expanded={open}
      aria-haspopup="listbox"
      ref={handleRef}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
});

SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({ placeholder, className }) {
  const { value } = useContext(SelectContext);
  
  return (
    <span className={cn("block truncate", !value && "text-muted-foreground", className)}>
      {value ? value : placeholder}
    </span>
  );
}

export function SelectContent({ 
  className, 
  position = 'popper', 
  align = 'start',
  sideOffset = 4,
  ...props
}) {
  const { open, contentRef, triggerRef } = useContext(SelectContext);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  
  // Calculate position when open or triggerRef changes
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + sideOffset + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [open, sideOffset]);
  
  if (!open) return null;
  
  return createPortal(
    <div
      ref={contentRef}
      style={{
        position: 'absolute',
        top: `${coords.top}px`,
        left: `${coords.left}px`,
        width: `${coords.width}px`,
      }}
      className={cn(
        "z-50 overflow-hidden rounded-md border border-gray-200 bg-white text-gray-950 shadow-md animate-in fade-in-80 zoom-in-95 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-50",
        className
      )}
      {...props}
    />
  , document.body);
}

export function SelectItem({ 
  className, 
  children, 
  value,
  disabled,
  ...props 
}) {
  const { value: selectedValue, onValueChange } = useContext(SelectContext);
  const isSelected = selectedValue === value;
  
  return (
    <div
      role="option"
      aria-selected={isSelected}
      data-selected={isSelected ? true : undefined}
      className={cn(
        "relative flex cursor-pointer select-none items-center py-1.5 px-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-800 dark:focus:bg-gray-800",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      onClick={() => !disabled && onValueChange(value)}
      {...props}
    >
      <span className="flex-1">{children}</span>
      {isSelected && (
        <Check className="h-4 w-4 ml-2" />
      )}
    </div>
  );
}