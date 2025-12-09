"use client";

/**
 * Attendance Statistics Cards with Filtering
 * Display overview of daily attendance stats with clickable filters
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, UserX, Clock, Home, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterType = "all" | "present" | "absent" | "late" | "leave";

interface AttendanceStats {
    present: number;
    absent: number;
    late: number;
    halfDay: number;
    onLeave: number;
    wfh: number;
    total: number;
}

interface AttendanceStatsCardsProps {
    stats: AttendanceStats;
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
}

export function AttendanceStatsCards({ stats, activeFilter, onFilterChange }: AttendanceStatsCardsProps) {
    const presentPercentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : "0";
    const absentPercentage = stats.total > 0 ? ((stats.absent / stats.total) * 100).toFixed(1) : "0";
    const latePercentage = stats.total > 0 ? (((stats.late + stats.halfDay) / stats.total) * 100).toFixed(1) : "0";
    const leavePercentage = stats.total > 0 ? (((stats.onLeave + stats.wfh) / stats.total) * 100).toFixed(1) : "0";

    const cards = [
        {
            title: "Total Faculty",
            value: stats.total,
            percentage: null,
            filter: "all" as FilterType,
            icon: Users,
            color: "text-[#303960]",
            bgColor: "bg-[#F0EDE3]",
            activeBorder: "border-[#303960]",
        },
        {
            title: "Present",
            value: stats.present,
            percentage: presentPercentage,
            filter: "present" as FilterType,
            icon: UserCheck,
            color: "text-green-600",
            bgColor: "bg-green-50",
            activeBorder: "border-green-600",
        },
        {
            title: "Absent",
            value: stats.absent,
            percentage: absentPercentage,
            filter: "absent" as FilterType,
            icon: UserX,
            color: "text-red-600",
            bgColor: "bg-red-50",
            activeBorder: "border-red-600",
        },
        {
            title: "Late / Half Day",
            value: stats.late + stats.halfDay,
            percentage: latePercentage,
            filter: "late" as FilterType,
            icon: Clock,
            color: "text-[#F6C570]",
            bgColor: "bg-[#FFF8EE]",
            activeBorder: "border-[#F6C570]",
        },
        {
            title: "Leave / WFH",
            value: stats.onLeave + stats.wfh,
            percentage: leavePercentage,
            filter: "leave" as FilterType,
            icon: Home,
            color: "text-[#F5B19C]",
            bgColor: "bg-[#FFF5F1]",
            activeBorder: "border-[#F5B19C]",
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {cards.map((card) => {
                const isActive = activeFilter === card.filter;
                return (
                    <Card 
                        key={card.title} 
                        className={cn(
                            "shadow-sm hover:shadow-lg transition-all cursor-pointer",
                            isActive && `border-2 ${card.activeBorder} shadow-md`
                        )}
                        onClick={() => onFilterChange(card.filter)}
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                            <div className={`p-2 rounded-full ${card.bgColor}`}>
                                <card.icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-2xl font-bold ${card.color}`}>
                                {card.value}
                            </div>
                            {card.percentage && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    {card.percentage}% of total
                                </p>
                            )}
                            {!card.percentage && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    faculty members
                                </p>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
