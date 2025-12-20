"use client";

import { useEffect, useState } from "react";
import { Building2, MapPin, Calendar, ExternalLink, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getApprovedReferrals, type ApprovedReferral } from "@/actions/alumni/submitReferral";
import { Skeleton } from "@/components/ui/skeleton";

interface JobReferralNoticesProps {
    maxDisplay?: number;
    showHeader?: boolean;
}

export default function JobReferralNotices({
    maxDisplay = 3,
    showHeader = true
}: JobReferralNoticesProps) {
    const [referrals, setReferrals] = useState<ApprovedReferral[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        async function loadReferrals() {
            try {
                const data = await getApprovedReferrals();
                setReferrals(data.slice(0, maxDisplay));
            } catch (error) {
                console.error("Error loading job referrals:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadReferrals();
    }, [maxDisplay, mounted]);

    if (!mounted) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="space-y-3">
                {showHeader && <Skeleton className="h-6 w-48" />}
                <Skeleton className="h-32" />
                <Skeleton className="h-32" />
            </div>
        );
    }

    if (referrals.length === 0) {
        return (
            <div className="space-y-4">
                {showHeader && (
                    <h3 className="text-lg font-semibold">Job Opportunities</h3>
                )}
                <Card>
                    <CardContent className="py-12 text-center">
                        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No job opportunities available at the moment</p>
                        <p className="text-sm text-muted-foreground mt-2">Check back later for alumni referrals</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {showHeader && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <h3 className="text-lg font-semibold">Job Opportunities</h3>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                        {referrals.length} New
                    </Badge>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {referrals.map((referral, index) => {
                    const colors = [
                        { solid: "#3b82f6", bg: "bg-blue-100", text: "text-blue-600", border: "border-blue-500" },
                        { solid: "#8b5cf6", bg: "bg-purple-100", text: "text-purple-600", border: "border-purple-500" },
                        { solid: "#10b981", bg: "bg-green-100", text: "text-green-600", border: "border-green-500" },
                        { solid: "#f59e0b", bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-500" },
                        { solid: "#ec4899", bg: "bg-pink-100", text: "text-pink-600", border: "border-pink-500" },
                        { solid: "#06b6d4", bg: "bg-cyan-100", text: "text-cyan-600", border: "border-cyan-500" },
                    ];
                    const colorScheme = colors[index % colors.length];

                    return (
                        <Card key={referral.id} className={`group hover:shadow-xl transition-all duration-300 overflow-hidden border-t-4 ${colorScheme.border} shadow-md`}>
                            {/* Removed gradient header, using border-t-4 instead */}
                            
                            <CardHeader className="pb-3">
                                <div className="flex items-start gap-3">
                                    <div className={`p-3 rounded-xl ${colorScheme.bg} ${colorScheme.text} shrink-0 group-hover:scale-110 transition-transform`}>
                                        <Building2 className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg font-bold line-clamp-1 mb-1">
                                            {referral.jobTitle}
                                        </CardTitle>
                                        <p className="text-base text-muted-foreground font-medium">
                                            {referral.companyName}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-3">
                                <div className="space-y-2.5">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className={`p-2 rounded-md ${colorScheme.bg} ${colorScheme.text}`}>
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">{referral.jobLocation}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className={`p-2 rounded-md ${colorScheme.bg} ${colorScheme.text}`}>
                                            <Briefcase className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">{referral.experienceRequired}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <div className={`p-2 rounded-md ${colorScheme.bg} ${colorScheme.text}`}>
                                            <Calendar className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-medium">{referral.applicationDeadline}</span>
                                    </div>
                                </div>

                                {referral.jobDescription && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t">
                                        {referral.jobDescription}
                                    </p>
                                )}

                                <div className="flex flex-col gap-2 pt-2">
                                    <Button 
                                        size="default" 
                                        className="w-full hover:opacity-90 transition-opacity text-white border-0"
                                        style={{ backgroundColor: colorScheme.solid }}
                                        asChild
                                    >
                                        <a href={`mailto:${referral.contactEmail}`}>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Apply Now
                                        </a>
                                    </Button>
                                    <p className="text-sm text-center text-muted-foreground font-medium">
                                        via {referral.alumniName}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
