import { useState, useRef, useEffect, createContext, useContext, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// Create context for dropdown
const DropdownMenuContext = createContext({
  open: false,
  setOpen: () => {},
  triggerRef: null,
  contentRef: null,
});

export function DropdownMenu({ 
  children, 
  open, 
  onOpenChange,
  modal = true
}) {
  const [internalOpen, setInternalOpen] = useState(open || false);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);
  
  // Allow controlled and uncontrolled usage
  const isOpen = open !== undefined ? open : internalOpen;
  
  const handleOpenChange = (value) => {
    setInternalOpen(value);
    if (onOpenChange) {
      onOpenChange(value);
    }
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    if (!modal || !isOpen) return;
    
    const handleClickOutside = (event) => {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        handleOpenChange(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, modal]);
  
  // Close dropdown on Escape key
  useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        handleOpenChange(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);
  
  const contextValue = {
    open: isOpen,
    setOpen: handleOpenChange,
    triggerRef,
    contentRef,
  };
  
  return (
    <DropdownMenuContext.Provider value={contextValue}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({ children, asChild }) {
  const { open, setOpen, triggerRef } = useContext(DropdownMenuContext);
  
  const handleClick = (e) => {
    e.preventDefault();
    setOpen(!open);
    
    // Call the original onClick if it exists
    if (children.props.onClick) {
      children.props.onClick(e);
    }
  };
  
  if (asChild) {
    return cloneElement(children, {
      ref: triggerRef,
      onClick: handleClick,
      'aria-expanded': open,
    });
  }
  
  return (
    <button
      ref={triggerRef}
      onClick={handleClick}
      aria-expanded={open}
      type="button"
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({ 
  children, 
  className, 
  align = 'end', 
  sideOffset = 4
}) {
  const { open, contentRef, triggerRef } = useContext(DropdownMenuContext);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  // Calculate position when open changes
  useEffect(() => {
    if (open && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const contentRect = contentRef.current?.getBoundingClientRect() || { width: 200, height: 0 };
      
      let left = 0;
      if (align === 'start') {
        left = triggerRect.left;
      } else if (align === 'center') {
        left = triggerRect.left + (triggerRect.width - contentRect.width) / 2;
      } else if (align === 'end') {
        left = triggerRect.right - contentRect.width;
      }
      
      // Ensure dropdown stays within viewport
      const viewportWidth = window.innerWidth;
      if (left < 10) {
        left = 10;
      } else if (left + contentRect.width > viewportWidth - 10) {
        left = viewportWidth - contentRect.width - 10;
      }
      
      setPosition({
        top: triggerRect.bottom + sideOffset + window.scrollY,
        left: left + window.scrollX,
      });
    }
  }, [open, align, sideOffset]);
  
  if (!open) return null;
  
  return createPortal(
    <div
      ref={contentRef}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2 dark:border-gray-800 dark:bg-gray-800",
        className
      )}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export function DropdownMenuItem({ 
  children, 
  className, 
  onSelect,
  disabled,
  ...props
}) {
  const { setOpen } = useContext(DropdownMenuContext);
  
  const handleClick = (event) => {
    if (disabled) return;
    
    if (onSelect) {
      onSelect();
    }
    
    setOpen(false);
    
    if (props.onClick) {
      props.onClick(event);
    }
  };
  
  return (
    <div
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-100 focus:text-gray-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:focus:bg-gray-800 dark:focus:text-gray-50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}
      onClick={handleClick}
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      data-disabled={disabled || undefined}
    >
      {children}
    </div>
  );
}

export function DropdownMenuSeparator({ className }) {
  return (
    <div
      className={cn("h-px bg-gray-200 dark:bg-gray-700 m-1", className)}
      role="separator"
    />
  );
}