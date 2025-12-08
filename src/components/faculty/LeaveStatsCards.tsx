"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaveRequest } from "@/types/leave";
import { Clock, CheckCircle2, XCircle, Ban } from "lucide-react";

interface LeaveStatsCardsProps {
    requests: LeaveRequest[];
}

export function LeaveStatsCards({ requests }: LeaveStatsCardsProps) {
    const stats = {
        pending: requests.filter(r => r.status === "pending").length,
        approved: requests.filter(r => r.status === "approved").length,
        rejected: requests.filter(r => r.status === "rejected").length,
        cancelled: requests.filter(r => r.status === "cancelled").length,
    };

    const cards = [
        {
            title: "Pending",
            value: stats.pending,
            icon: Clock,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
        {
            title: "Approved",
            value: stats.approved,
            icon: CheckCircle2,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Rejected",
            value: stats.rejected,
            icon: XCircle,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
        {
            title: "Cancelled",
            value: stats.cancelled,
            icon: Ban,
            color: "text-gray-600",
            bgColor: "bg-gray-50",
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
                        <p className="text-xs text-muted-foreground mt-1">
                            {card.value === 1 ? "request" : "requests"}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
