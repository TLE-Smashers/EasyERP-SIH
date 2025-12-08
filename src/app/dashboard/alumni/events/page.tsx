"use client";

import {
    Calendar,
    MapPin,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateShort } from "@/lib/utils/dateFormat";

// No static data - events should come from database/Google Sheets
const upcomingEvents: any[] = [];
const pastEvents: any[] = [];

export default function AlumniEventsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold">Alumni Events</h1>
                <p className="mt-2 text-muted-foreground">
                    Stay connected and participate in alumni gatherings and networking events
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Upcoming Events
                        </CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{upcomingEvents.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Events you can register for
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Attendees
                        </CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {upcomingEvents.reduce((acc, e) => acc + e.attendees, 0)}+
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Expected participants
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Events Attended
                        </CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">0</div>
                        <p className="text-xs text-muted-foreground">
                            Your participation history
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Upcoming Events */}
            <div>
                <h2 className="mb-4 text-2xl font-bold">Upcoming Events</h2>
                {upcomingEvents.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">No upcoming events at the moment</p>
                            <p className="text-sm text-muted-foreground mt-2">Check back later for new alumni events</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {upcomingEvents.map((event) => (
                            <Card key={event.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-xl">{event.title}</CardTitle>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <Badge className="gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDateShort(event.date)}
                                                </Badge>
                                                <Badge variant="outline" className="gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {event.time}
                                                </Badge>
                                                <Badge variant="secondary" className="gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {event.location}
                                                </Badge>
                                                <Badge variant="secondary" className="gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {event.attendees}+ attendees
                                                </Badge>
                                            </div>
                                        </div>
                                        {event.registrationOpen && (
                                            <Button size="sm">Register Now</Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {event.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Past Events */}
            <div>
                <h2 className="mb-4 text-2xl font-bold">Past Events</h2>
                {pastEvents.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <CheckCircle2 className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                            <p className="text-muted-foreground">No past events recorded</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {pastEvents.map((event) => (
                            <Card key={event.id} className="opacity-75">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="flex items-center gap-2 text-xl">
                                                {event.title}
                                                <Badge variant="outline" className="gap-1">
                                                    <CheckCircle2 className="h-3 w-3" />
                                                    Completed
                                                </Badge>
                                            </CardTitle>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <Badge variant="secondary" className="gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDateShort(event.date)}
                                                </Badge>
                                                <Badge variant="outline" className="gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {event.time}
                                                </Badge>
                                                <Badge variant="outline" className="gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {event.location}
                                                </Badge>
                                                <Badge variant="outline" className="gap-1">
                                                    <Users className="h-3 w-3" />
                                                    {event.attendees} attended
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        {event.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
