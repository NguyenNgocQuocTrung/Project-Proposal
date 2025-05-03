import { useToast } from "@/hooks/use-toast";
import { XIcon } from "lucide-react";
import { useEffect, useState } from "react";

function Toast({ toast, onDismiss }) {
  // Determine variant styling
  const getVariantClass = () => {
    switch (toast.variant) {
      case "destructive":
        return "bg-destructive text-destructive-foreground";
      case "success":
        return "bg-green-500 text-white";
      default:
        return "bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700";
    }
  };
  
  return (
    <div 
      className={`relative flex items-center justify-between rounded-md shadow-lg p-4 mb-3 max-w-md w-full animate-in slide-in-from-right-full transition-all ${getVariantClass()}`}
      role="alert"
    >
      <div className="flex-1 mr-4">
        {toast.title && (
          <h3 className="font-semibold">{toast.title}</h3>
        )}
        {toast.description && (
          <p className={`text-sm ${toast.variant === "default" ? "text-gray-600 dark:text-gray-300" : ""}`}>
            {toast.description}
          </p>
        )}
      </div>
      <button
        className="inline-flex shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={() => onDismiss(toast.id)}
      >
        <XIcon className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, dismiss } = useToast();
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end">
      {toasts.map((toast) => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onDismiss={dismiss} 
        />
      ))}
    </div>
  );
}