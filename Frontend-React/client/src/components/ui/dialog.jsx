import { useState, useEffect, createContext, useContext, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Create context for dialog state
const DialogContext = createContext({
  open: false,
  setOpen: () => {},
  contentRef: null,
});

export function Dialog({ 
  children, 
  open, 
  onOpenChange,
  modal = true
}) {
  const [internalOpen, setInternalOpen] = useState(open || false);
  const [contentRef, setContentRef] = useState(null);
  
  // Allow controlled and uncontrolled usage
  const isOpen = open !== undefined ? open : internalOpen;
  
  const handleOpenChange = (value) => {
    setInternalOpen(value);
    if (onOpenChange) {
      onOpenChange(value);
    }
  };
  
  // Handle Escape key press
  useEffect(() => {
    if (!isOpen) return;
    
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (modal) {
          event.preventDefault();
          handleOpenChange(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, modal]);
  
  // Prevent scroll when dialog is open
  useEffect(() => {
    if (!isOpen || !modal) return;
    
    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, modal]);
  
  const contextValue = {
    open: isOpen,
    setOpen: handleOpenChange,
    contentRef,
    setContentRef,
  };
  
  return (
    <DialogContext.Provider value={contextValue}>
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({ children, asChild }) {
  const { setOpen } = useContext(DialogContext);
  
  const handleClick = (e) => {
    setOpen(true);
    
    // Call the original onClick if it exists
    if (children.props.onClick) {
      children.props.onClick(e);
    }
  };
  
  if (asChild) {
    return cloneElement(children, {
      onClick: handleClick,
    });
  }
  
  return (
    <button onClick={handleClick} type="button">
      {children}
    </button>
  );
}

export function DialogContent({ 
  children, 
  className, 
  ...props 
}) {
  const { open, setOpen, setContentRef } = useContext(DialogContext);
  
  if (!open) return null;
  
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      
      {/* Dialog */}
      <div
        role="dialog"
        ref={setContentRef}
        className={cn(
          "fixed z-50 grid w-full max-w-lg gap-4 rounded-lg border bg-background p-6 shadow-lg animate-in fade-in-0 zoom-in-95 duration-300",
          className
        )}
        {...props}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        
        {/* Close button */}
        <button
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => setOpen(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ 
  className, 
  ...props 
}) {
  return (
    <div
      className={cn(
        "flex flex-col space-y-1.5 text-left",
        className
      )}
      {...props}
    />
  );
}

export function DialogTitle({ 
  className, 
  ...props 
}) {
  return (
    <h2
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function DialogDescription({ 
  className, 
  ...props 
}) {
  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function DialogFooter({ 
  className, 
  ...props 
}) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
        className
      )}
      {...props}
    />
  );
}