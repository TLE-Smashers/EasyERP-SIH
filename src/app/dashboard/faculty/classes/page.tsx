"use client";

import * as React from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Mock data - will be replaced with actual data from sheets
const mockClasses = [
    {
        courseCode: "CS101",
        courseName: "Introduction to Programming",
        class: "B.Tech CSE",
        semester: "1st",
        section: "A",
        totalStudents: 60,
    },
    {
        courseCode: "CS301",
        courseName: "Data Structures",
        class: "B.Tech CSE",
        semester: "3rd",
        section: "B",
        totalStudents: 55,
    },
];

const mockSchedule = [
    {
        day: "Monday",
        timeSlot: "9:00 AM - 10:00 AM",
        courseCode: "CS101",
        courseName: "Introduction to Programming",
        room: "Lab 1",
        class: "B.Tech CSE 1st Sem",
        section: "A",
    },
    {
        day: "Monday",
        timeSlot: "11:00 AM - 12:00 PM",
        courseCode: "CS301",
        courseName: "Data Structures",
        room: "Room 301",
        class: "B.Tech CSE 3rd Sem",
        section: "B",
    },
    {
        day: "Wednesday",
        timeSlot: "9:00 AM - 10:00 AM",
        courseCode: "CS101",
        courseName: "Introduction to Programming",
        room: "Lab 1",
        class: "B.Tech CSE 1st Sem",
        section: "A",
    },
];

export default function FacultyClassesPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Classes</h1>
                <p className="text-muted-foreground">
                    View your teaching assignments and schedule
                </p>
            </div>

            {/* Current Assignments */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Assignments</CardTitle>
                    <CardDescription>Courses you are teaching this semester</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {mockClasses.map((cls, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <CardTitle className="text-lg">{cls.courseName}</CardTitle>
                                            <CardDescription>{cls.courseCode}</CardDescription>
                                        </div>
                                        <Badge variant="secondary">{cls.semester} Semester</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Class:</span>
                                        <span>{cls.class} - Section {cls.section}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">Students:</span>
                                        <span>{cls.totalStudents}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Weekly Schedule */}
            <Card>
                <CardHeader>
                    <CardTitle>Weekly Schedule</CardTitle>
                    <CardDescription>Your class schedule for the week</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Day</TableHead>
                                <TableHead>Time</TableHead>
                                <TableHead>Course</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Room</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mockSchedule.map((schedule, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">{schedule.day}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            {schedule.timeSlot}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium">{schedule.courseName}</div>
                                            <div className="text-sm text-muted-foreground">{schedule.courseCode}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {schedule.class} {schedule.section && `- ${schedule.section}`}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                            {schedule.room}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
