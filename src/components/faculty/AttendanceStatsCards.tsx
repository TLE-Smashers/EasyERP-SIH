"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, UserX, Clock, Home } from "lucide-react";

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
}

export function AttendanceStatsCards({ stats }: AttendanceStatsCardsProps) {
    const presentPercentage = stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : "0";
    const absentPercentage = stats.total > 0 ? ((stats.absent / stats.total) * 100).toFixed(1) : "0";

    const cards = [
        {
            title: "Present",
            value: stats.present,
            percentage: presentPercentage,
            icon: UserCheck,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Absent",
            value: stats.absent,
            percentage: absentPercentage,
            icon: UserX,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
        {
            title: "Late / Half Day",
            value: stats.late + stats.halfDay,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
        {
            title: "Leave / WFH",
            value: stats.onLeave + stats.wfh,
            icon: Home,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
                <Card key={card.title} className="shadow-sm hover:shadow-md transition-shadow">
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
            ))}
        </div>
    );
}
