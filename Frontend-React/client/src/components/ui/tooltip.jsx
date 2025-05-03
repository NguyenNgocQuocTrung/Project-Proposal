import { useState, useContext, createContext, cloneElement } from 'react';
import { createPortal } from 'react-dom';

// Create context for tooltip
const TooltipContext = createContext({
  open: false,
  setOpen: () => {},
  content: null,
});

// Tooltip provider component
export function TooltipProvider({ children }) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  
  // Value to be passed to context
  const value = {
    open,
    setOpen,
    content,
    setContent,
    position,
    setPosition,
  };
  
  return (
    <TooltipContext.Provider value={value}>
      {children}
      {open && content && typeof document !== 'undefined' && 
        createPortal(
          <div 
            className="absolute z-50 px-3 py-2 text-sm bg-black text-white rounded shadow-lg animate-in fade-in-50 data-[side=bottom]:slide-in-from-top-1"
            style={{ 
              top: `${position.top}px`, 
              left: `${position.left}px`,
              maxWidth: '250px',
            }}
          >
            {content}
          </div>,
          document.body
        )
      }
    </TooltipContext.Provider>
  );
}

// Hook to access tooltip context
export function useTooltip() {
  const context = useContext(TooltipContext);
  if (!context) {
    throw new Error('useTooltip must be used within a TooltipProvider');
  }
  return context;
}

// Tooltip trigger component
export function TooltipTrigger({ children, content, delayDuration = 300 }) {
  const { setOpen, setContent, setPosition } = useTooltip();
  let timeout;
  
  const handleMouseEnter = (e) => {
    clearTimeout(timeout);
    const rect = e.currentTarget.getBoundingClientRect();
    setContent(content);
    
    // Position the tooltip above the element
    setPosition({
      top: rect.top - 10,  // 10px above the element
      left: rect.left + (rect.width / 2), // Center horizontally
    });
    
    timeout = setTimeout(() => {
      setOpen(true);
    }, delayDuration);
  };
  
  const handleMouseLeave = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      setOpen(false);
    }, 100);
  };
  
  // Clone the child element and add event handlers
  return cloneElement(children, {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  });
}

export function Tooltip({ children, content, delay }) {
  return (
    <TooltipTrigger content={content} delayDuration={delay}>
      {children}
    </TooltipTrigger>
  );
}