import React from "react";
import { Loader2 } from "lucide-react";

export const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 20, className = "" }) => (
  <Loader2 className={`animate-spin text-blue-600 ${className}`} size={size} />
);
