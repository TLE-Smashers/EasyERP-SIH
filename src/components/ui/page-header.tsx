/**
 * Page Header Component
 * Reusable minimal and clean header for all pages
 * 
 * @example
 * // Simple header with title only
 * <PageHeader title="Dashboard" />
 * 
 * @example
 * // Header with description
 * <PageHeader 
 *   title="Applications" 
 *   description="View and manage all admission applications"
 * />
 * 
 * @example
 * // Header with back button
 * <PageHeader 
 *   title="Application Details"
 *   description="Review student application"
 *   backLabel="Back to Applications"
 *   backHref="/dashboard/admission/applications"
 * />
 * 
 * @example
 * // Header with badge
 * <PageHeader 
 *   title="Application APP-123"
 *   description="John Doe • Submitted on Jan 1, 2025"
 *   badge={{ label: "✅ Completed", variant: "success" }}
 * />
 * 
 * @example
 * // Header with custom actions
 * <PageHeader 
 *   title="Settings"
 *   actions={
 *     <>
 *       <Button variant="outline">Cancel</Button>
 *       <Button>Save Changes</Button>
 *     </>
 *   }
 * />
 */

"use client";

import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  backLabel?: string;
  backHref?: string;
  badge?: {
    label: string;
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
    className?: string;
  };
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  backLabel,
  backHref,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  const getBadgeStyles = (variant?: string) => {
    switch (variant) {
      case "success":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900";
      case "warning":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-900";
      default:
        return "";
    }
  };

  return (
    <div className={cn("", className)}>
      {/* Back Button */}
      {(backLabel || backHref) && (
        <div className="-mb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2 -ml-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {backLabel || "Back"}
          </Button>
        </div>
      )}

      {/* Header Content */}
      <Card className="border-l-4 border-l-primary">
        <div className="px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {(badge || actions) && (
              <div className="flex items-center gap-3">
                {badge && (
                  <Badge
                    variant={badge.variant === "success" || badge.variant === "warning" ? "outline" : badge.variant}
                    className={cn(
                      "text-sm font-medium px-4 py-1.5",
                      getBadgeStyles(badge.variant),
                      badge.className
                    )}
                  >
                    {badge.label}
                  </Badge>
                )}
                {actions && <div className="flex items-center gap-2">{actions}</div>}
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
