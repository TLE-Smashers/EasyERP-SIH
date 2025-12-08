"use client";

import { useEffect, useState } from "react";
import { Users, Mail, GraduationCap, Briefcase, Phone, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchAllAlumni, type AlumniRecord } from "@/actions/alumni/getAlumni";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export default function AlumniDirectoryPage() {
    const { data: session } = useSession();
    const [alumni, setAlumni] = useState<AlumniRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        async function loadAlumni() {
            try {
                const data = await fetchAllAlumni();
                setAlumni(data);
            } catch (error) {
                console.error("Error loading alumni:", error);
                toast.error("Failed to load alumni directory");
            } finally {
                setIsLoading(false);
            }
        }

        loadAlumni();
    }, []);

    const filteredAlumni = alumni
        .filter((person) => {
            // Exclude current user from directory
            if (session?.user?.email && person.email.toLowerCase() === session.user.email.toLowerCase()) {
                return false;
            }

            const query = searchQuery.toLowerCase();
            return (
                person.fullName?.toLowerCase().includes(query) ||
                person.email?.toLowerCase().includes(query) ||
                person.course?.toLowerCase().includes(query) ||
                person.branch?.toLowerCase().includes(query) ||
                person.batch?.toLowerCase().includes(query)
            );
        });
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                    <Skeleton className="h-64" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Alumni Directory</h1>
                <p className="mt-2 text-muted-foreground">
                    Connect with {alumni.length} fellow alumni from your institution
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Search Alumni</CardTitle>
                </CardHeader>
                <CardContent>
                    <Input
                        placeholder="Search by name, email, batch, course, or branch..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </CardContent>
            </Card>

            {filteredAlumni.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground">
                            {searchQuery ? "No alumni found matching your search" : "No alumni records found"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    {filteredAlumni.map((person) => (
                        <Card key={person.id}>
                            <CardHeader>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarImage src={person.photoUrl} alt={person.fullName} />
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                                            {person.fullName
                                                ?.split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .toUpperCase() || "AL"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <CardTitle className="text-lg">{person.fullName}</CardTitle>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {person.enrollmentNumber || "N/A"}
                                        </p>
                                        <Badge variant="outline" className="mt-2">
                                            Class of {person.batch?.split("-")[1] || "N/A"}
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                    <span>
                                        {person.course} - {person.branch}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span>{person.category || "Not specified"}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="truncate">{person.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span>{person.mobileNumber || "Not provided"}</span>
                                </div>
                                <div className="pt-2">
                                    <Button size="sm" className="w-full" asChild>
                                        <a href={`mailto:${person.email}`}>
                                            <Mail className="mr-2 h-4 w-4" />
                                            Connect
                                        </a>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
