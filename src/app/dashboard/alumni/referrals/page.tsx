"use client";

import { useState, useEffect } from "react";
import { Send, Building2, Users, Briefcase, Mail, Phone, CheckCircle2, MapPin, Calendar, DollarSign, Link } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { submitReferral, getUserReferrals } from "@/actions/alumni/submitReferral";
import { useSession } from "next-auth/react";

export default function AlumniReferralsPage() {
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [userReferrals, setUserReferrals] = useState<any[]>([]);
    const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);

    const [formData, setFormData] = useState({
        companyName: "",
        jobTitle: "",
        jobLocation: "",
        experienceRequired: "",
        skillsRequired: "",
        numberOfPositions: "",
        salary: "",
        jobDescription: "",
        applicationDeadline: "",
        contactPerson: "",
        contactEmail: "",
        contactPhone: "",
        referralLink: "",
        additionalNotes: "",
    });

    useEffect(() => {
        loadUserReferrals();
    }, [session]);

    const loadUserReferrals = async () => {
        if (!session?.user?.email) return;

        setIsLoadingReferrals(true);
        try {
            const referrals = await getUserReferrals(session.user.email);
            setUserReferrals(referrals);
        } catch (error) {
            console.error("Error loading user referrals:", error);
        } finally {
            setIsLoadingReferrals(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user?.email || !session?.user?.name) {
            toast.error("Please login to submit a referral");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await submitReferral({
                alumniEmail: session.user.email,
                alumniName: session.user.name,
                ...formData,
            });

            if (result.success) {
                setSubmitted(true);
                toast.success("Referral published successfully! Students can now see it.");

                // Reload user referrals
                loadUserReferrals();

                // Reset form after 3 seconds
                setTimeout(() => {
                    setSubmitted(false);
                    setFormData({
                        companyName: "",
                        jobTitle: "",
                        jobLocation: "",
                        experienceRequired: "",
                        skillsRequired: "",
                        numberOfPositions: "",
                        salary: "",
                        jobDescription: "",
                        applicationDeadline: "",
                        contactPerson: "",
                        contactEmail: "",
                        contactPhone: "",
                        referralLink: "",
                        additionalNotes: "",
                    });
                }, 3000);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error submitting referral:", error);
            toast.error("Failed to submit referral. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md">
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold">Referral Published Successfully!</h3>
                            <p className="text-muted-foreground">
                                Your referral is now live and visible to all students on their dashboard.
                                Students can directly contact you for this opportunity.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Student Referrals</h1>
                <p className="mt-2 text-muted-foreground">
                    Help current students by sharing job opportunities from your company
                </p>
            </div>

            {/* Info Card */}
            <Card className="border-blue-200 bg-blue-50/50">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-blue-600" />
                        Why Refer Students?
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <p>🎯 Help students get industry exposure and job opportunities</p>
                    <p>🤝 Strengthen the alumni-student connection</p>
                    <p>🏢 Build a talent pipeline for your company</p>
                    <p>📢 Your referral will be instantly visible to all students on their dashboard</p>
                </CardContent>
            </Card>

            {/* Referral Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Job Referral Form</CardTitle>
                    <CardDescription>
                        Fill in the details below. Your referral will be instantly published to all students.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Company Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Company Information
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="companyName">Company Name *</Label>
                                    <Input
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        placeholder="e.g., Tech Innovations Inc."
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="jobTitle">Job Title *</Label>
                                    <Input
                                        id="jobTitle"
                                        name="jobTitle"
                                        value={formData.jobTitle}
                                        onChange={handleChange}
                                        placeholder="e.g., Software Engineer"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Job Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                Job Details
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="jobLocation">Location *</Label>
                                    <Input
                                        id="jobLocation"
                                        name="jobLocation"
                                        value={formData.jobLocation}
                                        onChange={handleChange}
                                        placeholder="e.g., Bangalore, India / Remote"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="experienceRequired">Experience Required *</Label>
                                    <Input
                                        id="experienceRequired"
                                        name="experienceRequired"
                                        value={formData.experienceRequired}
                                        onChange={handleChange}
                                        placeholder="e.g., 0-2 years / Freshers"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="numberOfPositions">Number of Positions</Label>
                                    <Input
                                        id="numberOfPositions"
                                        name="numberOfPositions"
                                        type="number"
                                        value={formData.numberOfPositions}
                                        onChange={handleChange}
                                        placeholder="e.g., 5"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="salary">Salary Range</Label>
                                    <Input
                                        id="salary"
                                        name="salary"
                                        value={formData.salary}
                                        onChange={handleChange}
                                        placeholder="e.g., ₹3-5 LPA"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="skillsRequired">Skills Required *</Label>
                                <Input
                                    id="skillsRequired"
                                    name="skillsRequired"
                                    value={formData.skillsRequired}
                                    onChange={handleChange}
                                    placeholder="e.g., React, Node.js, MongoDB, Python"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="jobDescription">Job Description *</Label>
                                <Textarea
                                    id="jobDescription"
                                    name="jobDescription"
                                    value={formData.jobDescription}
                                    onChange={handleChange}
                                    placeholder="Describe the role, responsibilities, and requirements..."
                                    rows={5}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="applicationDeadline">Application Deadline</Label>
                                <Input
                                    id="applicationDeadline"
                                    name="applicationDeadline"
                                    type="date"
                                    value={formData.applicationDeadline}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-4">
                            <h3 className="font-semibold flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Contact Information (for interested students)
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="contactPerson">Contact Person Name</Label>
                                    <Input
                                        id="contactPerson"
                                        name="contactPerson"
                                        value={formData.contactPerson}
                                        onChange={handleChange}
                                        placeholder={session?.user?.name || "Your name"}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactEmail">Contact Email *</Label>
                                    <Input
                                        id="contactEmail"
                                        name="contactEmail"
                                        type="email"
                                        value={formData.contactEmail}
                                        onChange={handleChange}
                                        placeholder={session?.user?.email || "your.email@company.com"}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="contactPhone">Contact Phone</Label>
                                    <Input
                                        id="contactPhone"
                                        name="contactPhone"
                                        type="tel"
                                        value={formData.contactPhone}
                                        onChange={handleChange}
                                        placeholder="+91 9876543210"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="referralLink">Referral/Application Link</Label>
                                <Input
                                    id="referralLink"
                                    name="referralLink"
                                    type="url"
                                    value={formData.referralLink}
                                    onChange={handleChange}
                                    placeholder="https://company.com/careers/apply or referral link"
                                />
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="space-y-2">
                            <Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
                            <Textarea
                                id="additionalNotes"
                                name="additionalNotes"
                                value={formData.additionalNotes}
                                onChange={handleChange}
                                placeholder="Any additional information you'd like to share with the admin..."
                                rows={3}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <Button type="submit" disabled={isSubmitting} className="flex-1">
                                {isSubmitting ? (
                                    <>
                                        <span className="animate-spin mr-2">⏳</span>
                                        Sending to Admin...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-4 w-4" />
                                        Send Referral
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Previous Referrals */}
            <Card>
                <CardHeader>
                    <CardTitle>Your Previous Referrals</CardTitle>
                    <CardDescription>Track the referrals you've submitted</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoadingReferrals ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <span className="animate-spin inline-block">⏳</span>
                            <p className="mt-2">Loading your referrals...</p>
                        </div>
                    ) : userReferrals.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Users className="mx-auto h-12 w-12 mb-2 opacity-50" />
                            <p>No referrals submitted yet</p>
                            <p className="text-sm mt-1">Your referral history will appear here</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {userReferrals.map((referral) => (
                                <Card key={referral.id} className="border-l-4 border-l-green-500">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg">{referral.jobTitle}</CardTitle>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {referral.companyName}
                                                </p>
                                            </div>
                                            <Badge variant="default">Live</Badge>
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
                                                <DollarSign className="h-4 w-4" />
                                                <span>Salary: {referral.salary}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>Positions: {referral.numberOfPositions}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>Deadline: {referral.applicationDeadline}</span>
                                            </div>
                                            {referral.referralLink && (
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Link className="h-4 w-4" />
                                                    <a
                                                        href={referral.referralLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline truncate"
                                                    >
                                                        {referral.referralLink}
                                                    </a>
                                                </div>
                                            )}
                                        </div>

                                        {referral.jobDescription && (
                                            <div>
                                                <p className="text-sm font-medium mb-1">Description</p>
                                                <p className="text-sm text-muted-foreground">{referral.jobDescription}</p>
                                            </div>
                                        )}

                                        <div className="text-xs text-muted-foreground border-t pt-2">
                                            Posted on {new Date(referral.timestamp).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
