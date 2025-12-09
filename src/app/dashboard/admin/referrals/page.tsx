"use client";

import { useEffect, useState } from "react";
import { Building2, MapPin, Briefcase, DollarSign, Calendar, Users, Loader2, Link } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getAllReferrals } from "@/actions/alumni/submitReferral";

interface Referral {
    rowNumber: number;
    timestamp: string;
    status: string;
    alumniEmail: string;
    alumniName: string;
    companyName: string;
    jobTitle: string;
    jobLocation: string;
    experienceRequired: string;
    skillsRequired: string;
    numberOfPositions: string;
    salary: string;
    jobDescription: string;
    applicationDeadline: string;
    contactPerson: string;
    contactEmail: string;
    contactPhone: string;
    referralLink: string;
    additionalNotes: string;
}

export default function AdminReferralsPage() {
    const [referrals, setReferrals] = useState<Referral[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadReferrals = async () => {
        setIsLoading(true);
        try {
            const data = await getAllReferrals();
            setReferrals(data);
        } catch (error) {
            console.error("Error loading referrals:", error);
            toast.error("Failed to load referrals");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadReferrals();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Alumni Referrals</h1>
                <p className="mt-2 text-muted-foreground">
                    View all job referrals posted by alumni. These are automatically visible to students.
                </p>
            </div>

            {referrals.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Building2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                        <p className="text-muted-foreground">No referrals yet</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6">
                    {referrals.map((referral) => (
                        <Card key={referral.rowNumber}>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-xl">{referral.jobTitle}</CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Posted by {referral.alumniName} ({referral.alumniEmail})
                                        </p>
                                    </div>
                                    <Badge variant="default">Live</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Company Information */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="flex items-start gap-3">
                                        <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Company</p>
                                            <p className="text-sm text-muted-foreground">{referral.companyName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Location</p>
                                            <p className="text-sm text-muted-foreground">{referral.jobLocation}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Experience</p>
                                            <p className="text-sm text-muted-foreground">{referral.experienceRequired}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Salary</p>
                                            <p className="text-sm text-muted-foreground">{referral.salary}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Positions</p>
                                            <p className="text-sm text-muted-foreground">{referral.numberOfPositions}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div>
                                            <p className="text-sm font-medium">Deadline</p>
                                            <p className="text-sm text-muted-foreground">{referral.applicationDeadline}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Job Description */}
                                <div>
                                    <p className="text-sm font-medium mb-2">Job Description</p>
                                    <p className="text-sm text-muted-foreground">{referral.jobDescription}</p>
                                </div>

                                {/* Skills Required */}
                                <div>
                                    <p className="text-sm font-medium mb-2">Skills Required</p>
                                    <p className="text-sm text-muted-foreground">{referral.skillsRequired}</p>
                                </div>

                                {/* Contact Information */}
                                <div className="border-t pt-4">
                                    <p className="text-sm font-medium mb-2">Contact Person</p>
                                    <div className="grid gap-2 text-sm text-muted-foreground">
                                        <p>{referral.contactPerson}</p>
                                        <p>Email: {referral.contactEmail}</p>
                                        <p>Phone: {referral.contactPhone}</p>
                                        {referral.referralLink && (
                                            <p className="flex items-center gap-2">
                                                <Link className="h-4 w-4" />
                                                Referral Link:
                                                <a
                                                    href={referral.referralLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {referral.referralLink}
                                                </a>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {referral.additionalNotes && (
                                    <div>
                                        <p className="text-sm font-medium mb-2">Additional Notes</p>
                                        <p className="text-sm text-muted-foreground">{referral.additionalNotes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
