import { useState, useEffect } from 'react';

// Create a simple toast system
let toasts = [];
let listeners = [];

// Generate unique ID for each toast
const genId = () => Math.random().toString(36).substring(2, 9);

// Add a toast to the queue
export function toast(props) {
  const id = genId();
  const newToast = { id, ...props };
  
  toasts = [...toasts, newToast];
  notifyListeners();
  
  // Auto dismiss after 5 seconds unless specified
  const timeoutDuration = props.duration || 5000;
  setTimeout(() => {
    dismiss(id);
  }, timeoutDuration);
  
  return {
    id,
    dismiss: () => dismiss(id),
    update: (props) => update({ id, ...props })
  };
}

// Update a toast
function update(props) {
  toasts = toasts.map(t => (t.id === props.id ? { ...t, ...props } : t));
  notifyListeners();
}

// Dismiss a toast or all toasts
export function dismiss(toastId) {
  toasts = toastId ? toasts.filter(t => t.id !== toastId) : [];
  notifyListeners();
}

// Notify all listeners of state change
function notifyListeners() {
  listeners.forEach(listener => {
    listener(toasts);
  });
}

// Hook to subscribe to toast state
export function useToast() {
  const [localToasts, setLocalToasts] = useState(toasts);
  
  useEffect(() => {
    listeners.push(setLocalToasts);
    
    return () => {
      listeners = listeners.filter(listener => listener !== setLocalToasts);
    };
  }, []);
  
  return {
    toasts: localToasts,
    toast,
    dismiss
  };
}

export default useToast;