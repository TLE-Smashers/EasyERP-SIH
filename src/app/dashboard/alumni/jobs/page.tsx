"use client";

import { Briefcase, MapPin, Calendar, Building, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/lib/utils/dateFormat";

const jobOpportunities = [
    {
        id: "1",
        title: "Senior Software Engineer",
        company: "Tech Innovations Inc.",
        location: "Bangalore, India",
        type: "Full-time",
        postedBy: "Rahul Sharma (Class of 2018)",
        postedDate: "2025-01-05",
        description: "Looking for experienced software engineers with expertise in React and Node.js.",
        requirements: ["5+ years experience", "React.js", "Node.js", "MongoDB"],
        salary: "₹15-25 LPA",
    },
    {
        id: "2",
        title: "Data Scientist",
        company: "Analytics Pro",
        location: "Hyderabad, India",
        type: "Full-time",
        postedBy: "Priya Patel (Class of 2017)",
        postedDate: "2025-01-03",
        description: "Seeking data scientists for machine learning and AI projects.",
        requirements: ["Python", "Machine Learning", "TensorFlow", "3+ years experience"],
        salary: "₹12-20 LPA",
    },
    {
        id: "3",
        title: "Product Manager",
        company: "StartupHub",
        location: "Mumbai, India",
        type: "Full-time",
        postedBy: "Amit Kumar (Class of 2016)",
        postedDate: "2024-12-28",
        description: "Product management role for SaaS products.",
        requirements: ["5+ years PM experience", "Agile", "B2B SaaS"],
        salary: "₹18-30 LPA",
    },
];

export default function AlumniJobsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Job Opportunities</h1>
                <p className="mt-2 text-muted-foreground">
                    Exclusive job postings shared by fellow alumni
                </p>
            </div>

            <div className="grid gap-6">
                {jobOpportunities.map((job) => (
                    <Card key={job.id}>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="text-xl">{job.title}</CardTitle>
                                    <div className="mt-2 flex items-center gap-2">
                                        <Building className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{job.company}</span>
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <Badge className="gap-1">
                                            <MapPin className="h-3 w-3" />
                                            {job.location}
                                        </Badge>
                                        <Badge variant="outline">{job.type}</Badge>
                                        <Badge variant="secondary">{job.salary}</Badge>
                                    </div>
                                </div>
                                <Button>
                                    Apply Now
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">{job.description}</p>
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-medium">Requirements:</p>
                                <div className="flex flex-wrap gap-2">
                                    {job.requirements.map((req, idx) => (
                                        <Badge key={idx} variant="outline">
                                            {req}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    Posted by {job.postedBy} on {formatDateShort(job.postedDate)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
