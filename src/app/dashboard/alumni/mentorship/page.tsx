"use client";

import { Users, UserCheck, Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AlumniMentorshipPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Mentorship Program</h1>
                <p className="mt-2 text-muted-foreground">
                    Guide current students and give back to your alma mater
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Mentees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Students you're mentoring</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Mentorship sessions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hours Contributed</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">Total mentoring time</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Become a Mentor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border border-dashed p-8 text-center">
                        <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">Share Your Experience</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Help current students navigate their academic journey and career paths
                            by sharing your knowledge and experience.
                        </p>
                        <div className="mt-6 space-y-2">
                            <Button className="w-full" size="lg">
                                Register as a Mentor
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                Commitment: 2-4 hours per month
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Mentorship Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg border p-4">
                            <h4 className="font-semibold">Give Back</h4>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Share your knowledge and help shape the next generation of professionals
                            </p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <h4 className="font-semibold">Stay Connected</h4>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Maintain strong ties with your alma mater and fellow alumni
                            </p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <h4 className="font-semibold">Develop Leadership</h4>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Enhance your coaching and leadership skills through mentoring
                            </p>
                        </div>
                        <div className="rounded-lg border p-4">
                            <h4 className="font-semibold">Recognition</h4>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Receive certificates and recognition for your contributions
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
