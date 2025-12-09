import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type StorageMode = "cloud" | "local";

interface StorageContextType {
  mode: StorageMode;
  setMode: (mode: StorageMode) => void;
  isCloudAvailable: boolean;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

const STORAGE_MODE_KEY = "foodtrack_storage_mode";

interface StorageProviderProps {
  children: ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  const [isCloudAvailable, setIsCloudAvailable] = useState(false);
  const [mode, setModeState] = useState<StorageMode>("local");

  useEffect(() => {
    // Check if Supabase is configured
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const cloudAvailable = !!(supabaseUrl && supabaseKey && supabaseUrl !== "undefined");
    setIsCloudAvailable(cloudAvailable);

    // Load saved preference
    const savedMode = localStorage.getItem(STORAGE_MODE_KEY) as StorageMode | null;
    if (savedMode && (savedMode === "cloud" || savedMode === "local")) {
      // Only use cloud if it's available
      setModeState(savedMode === "cloud" && cloudAvailable ? "cloud" : "local");
    } else {
      // Default to cloud if available, otherwise local
      setModeState(cloudAvailable ? "cloud" : "local");
    }
  }, []);

  const setMode = (newMode: StorageMode) => {
    if (newMode === "cloud" && !isCloudAvailable) {
      console.warn("Cloud storage is not available");
      return;
    }
    setModeState(newMode);
    localStorage.setItem(STORAGE_MODE_KEY, newMode);
  };

  return (
    <StorageContext.Provider value={{ mode, setMode, isCloudAvailable }}>
      {children}
    </StorageContext.Provider>
  );
}

export function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error("useStorage must be used within a StorageProvider");
  }
  return context;
}
