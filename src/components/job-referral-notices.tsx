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
                const data = await getJobReferrals();
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
                    <h3 className="text-lg font-semibold">Job Opportunities</h3>
                    <Badge variant="secondary">{referrals.length} New</Badge>
                </div>
            )}

            <div className="space-y-3">
                {referrals.map((referral) => (
                    <Card key={referral.id} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                    <CardTitle className="text-base">{referral.jobTitle}</CardTitle>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {referral.companyName}
                                    </p>
                                </div>
                                <Badge variant="default" className="shrink-0">Alumni Referral</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid gap-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="h-4 w-4" />
                                    <span>{referral.jobLocation}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Briefcase className="h-4 w-4" />
                                    <span>Experience: {referral.experienceRequired}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    <span>Deadline: {referral.applicationDeadline}</span>
                                </div>
                            </div>

                            {referral.jobDescription && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {referral.jobDescription}
                                </p>
                            )}

                            <div className="flex items-center justify-between pt-2 border-t">
                                <p className="text-xs text-muted-foreground">
                                    Referred by {referral.alumniName}
                                </p>
                                <Button size="sm" variant="default" asChild>
                                    <a href={referral.referralLink || `mailto:${referral.contactEmail}`} target={referral.referralLink ? "_blank" : undefined} rel={referral.referralLink ? "noopener noreferrer" : undefined}>
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Apply
                                    </a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
