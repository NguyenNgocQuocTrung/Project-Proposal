import { useState, useEffect, useRef, cloneElement, createContext, useContext } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

// Create context for popover
const PopoverContext = createContext({
  open: false,
  setOpen: () => {},
  triggerRef: null,
  contentRef: null,
});

export function Popover({ children }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const contentRef = useRef(null);
  
  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        open &&
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
  
  const value = {
    open,
    setOpen,
    triggerRef,
    contentRef,
  };
  
  return (
    <PopoverContext.Provider value={value}>
      <div className="relative inline-block">{children}</div>
    </PopoverContext.Provider>
  );
}

export function PopoverTrigger({ children, asChild }) {
  const { open, setOpen, triggerRef } = useContext(PopoverContext);
  
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

export function PopoverContent({ 
  children, 
  className, 
  align = 'center', 
  sideOffset = 4 
}) {
  const { open, contentRef, triggerRef } = useContext(PopoverContext);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  // Calculate position when open or when triggerRef changes
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
      
      // Ensure popover stays within viewport
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
  }, [open, align, sideOffset, triggerRef.current]);
  
  if (!open) return null;
  
  return createPortal(
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-2 shadow-md animate-in fade-in-80 data-[side=bottom]:slide-in-from-top-2",
        className
      )}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>,
    document.body
  );
}