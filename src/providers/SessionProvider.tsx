

"use client";
import React, { createContext, useContext, useState, useEffect, type FC, type ReactNode } from "react";

export interface SessionData {
  user?: {
    name?: string;
    email?: string;
    role?: string;
    [key: string]: any;
  };
  expires?: string;
  [key: string]: any;
}

interface SessionContextType {
  session: SessionData | null;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function useSession(): SessionContextType {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}

interface SessionProviderProps {
  children: ReactNode;
}

export const SessionProvider: FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<SessionData | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem("session");
    if (cached) {
      setSession(JSON.parse(cached));
    } else {
      fetch("/api/auth/session")
        .then(res => res.json())
        .then(data => {
          setSession(data);
          localStorage.setItem("session", JSON.stringify(data));
        });
    }
  }, []);

  const logout = () => {
    setSession(null);
    localStorage.removeItem("session");
    // Add any additional logout logic here
  };

  return (
    <SessionContext.Provider value={{ session, logout }}>
      {children}
    </SessionContext.Provider>
  );
};
