"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeaveBalance } from "@/types/leave";
import { Calendar, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface LeaveBalanceCardProps {
    balance: LeaveBalance | null;
}

export function LeaveBalanceCard({ balance }: LeaveBalanceCardProps) {
    if (!balance) {
        return (
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle>Leave Balance</CardTitle>
                    <CardDescription>Your available leave balance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Balance Found</h3>
                        <p className="text-sm text-muted-foreground">
                            Your leave balance has not been initialized yet. Please contact HR.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const leaveTypes = [
        { type: "Casual Leave", total: balance.casualLeave.allocated, used: balance.casualLeave.used },
        { type: "Sick Leave", total: balance.sickLeave.allocated, used: balance.sickLeave.used },
        { type: "Earned Leave", total: balance.earnedLeave.allocated, used: balance.earnedLeave.used },
    ];

    const getAvailable = (total: number, used: number) => total - used;
    const getPercentageUsed = (total: number, used: number) =>
        total > 0 ? (used / total) * 100 : 0;

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Leave Balance
                </CardTitle>
                <CardDescription>
                    Academic Year: {balance.academicYear} | Updated: {new Date(balance.lastUpdated).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {leaveTypes.map((leave) => {
                        const available = getAvailable(leave.total, leave.used);
                        const percentageUsed = getPercentageUsed(leave.total, leave.used);
                        const isLow = available <= 2 && leave.total > 0;

                        return (
                            <div key={leave.type} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{leave.type}</span>
                                        {isLow && (
                                            <Badge variant="destructive" className="text-xs">Low</Badge>
                                        )}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <span className="font-semibold text-foreground">{available}</span> / {leave.total} days
                                    </div>
                                </div>
                                <Progress
                                    value={percentageUsed}
                                    className="h-2"
                                    indicatorClassName={isLow ? "bg-red-500" : ""}
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Used: {leave.used} days</span>
                                    <span>{percentageUsed.toFixed(0)}% utilized</span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Summary */}
                    <div className="pt-4 border-t">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-2xl font-bold text-blue-600">
                                    {leaveTypes.reduce((sum, l) => sum + getAvailable(l.total, l.used), 0)}
                                </div>
                                <div className="text-xs text-muted-foreground">Available</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-orange-600">
                                    {leaveTypes.reduce((sum, l) => sum + l.used, 0)}
                                </div>
                                <div className="text-xs text-muted-foreground">Used</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-600">
                                    {leaveTypes.reduce((sum, l) => sum + l.total, 0)}
                                </div>
                                <div className="text-xs text-muted-foreground">Total</div>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
