"use client";

import { useState, useEffect } from "react";
import { Faculty } from "@/actions/faculty/getFaculty";
import { LeaveBalance } from "@/types/leave";
import { getFacultyLeaveBalance, createLeaveBalance } from "@/actions/faculty/leaveActions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

interface LeaveBalanceTableProps {
    facultyList: Faculty[];
    academicYear: string;
}

export function LeaveBalanceTable({ facultyList, academicYear }: LeaveBalanceTableProps) {
    const [balances, setBalances] = useState<Map<string, LeaveBalance | null>>(new Map());
    const [loading, setLoading] = useState(true);
    const [initializing, setInitializing] = useState<string | null>(null);

    useEffect(() => {
        loadBalances();
    }, [facultyList, academicYear]);

    async function loadBalances() {
        setLoading(true);
        const balanceMap = new Map<string, LeaveBalance | null>();

        for (const faculty of facultyList) {
            const result = await getFacultyLeaveBalance(faculty.id, academicYear);
            balanceMap.set(faculty.id, result.success ? result.data : null);
        }

        setBalances(balanceMap);
        setLoading(false);
    }

    async function handleInitializeBalance(faculty: Faculty) {
        setInitializing(faculty.id);
        try {
            const result = await createLeaveBalance(
                faculty.id,
                faculty.employeeId || "N/A",
                academicYear
            );

            if (result.success) {
                toast.success(`Leave balance initialized for ${faculty.name}`);
                await loadBalances();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error("Failed to initialize leave balance");
        } finally {
            setInitializing(null);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Faculty Name</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead className="text-center">Casual</TableHead>
                        <TableHead className="text-center">Sick</TableHead>
                        <TableHead className="text-center">Earned</TableHead>
                        <TableHead className="text-center">Total Remaining</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {facultyList.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={9} className="text-center text-muted-foreground">
                                No faculty members found
                            </TableCell>
                        </TableRow>
                    ) : (
                        facultyList.map((faculty) => {
                            const balance = balances.get(faculty.id);
                            const hasBalance = balance !== null;

                            return (
                                <TableRow key={faculty.id}>
                                    <TableCell className="font-medium">{faculty.name}</TableCell>
                                    <TableCell>{faculty.employeeId || "N/A"}</TableCell>
                                    <TableCell>{faculty.department || "N/A"}</TableCell>
                                    {hasBalance && balance ? (
                                        <>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-green-600">
                                                        {balance.casualLeave.remaining}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        of {balance.casualLeave.allocated}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-green-600">
                                                        {balance.sickLeave.remaining}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        of {balance.sickLeave.allocated}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-green-600">
                                                        {balance.earnedLeave.remaining}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        of {balance.earnedLeave.allocated}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-lg font-bold text-primary">
                                                    {balance.totalRemaining}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="default">Active</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-muted-foreground">
                                                    Configured
                                                </span>
                                            </TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                Not initialized
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">Pending</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleInitializeBalance(faculty)}
                                                    disabled={initializing === faculty.id}
                                                >
                                                    {initializing === faculty.id ? (
                                                        <>
                                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                            Initializing...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Plus className="mr-2 h-4 w-4" />
                                                            Initialize
                                                        </>
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </>
                                    )}
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
