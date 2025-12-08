"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  FileText,
  Download,
  AlertCircle
} from "lucide-react";

export default function StudentExamsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcomingExams = [
    {
      id: 1,
      subject: "Data Structures",
      code: "CS201",
      type: "Mid-Term",
      date: "November 25, 2025",
      time: "10:00 AM - 1:00 PM",
      duration: "3 hours",
      room: "Room 301, Block A",
      syllabus: "Chapters 1-5",
      status: "scheduled"
    },
    {
      id: 2,
      subject: "Database Management",
      code: "CS301",
      type: "Quiz",
      date: "November 28, 2025",
      time: "2:00 PM - 3:00 PM",
      duration: "1 hour",
      room: "Room 205, Block B",
      syllabus: "Normalization, SQL",
      status: "scheduled"
    },
    {
      id: 3,
      subject: "Web Development",
      code: "CS401",
      type: "Final",
      date: "December 5, 2025",
      time: "9:00 AM - 12:00 PM",
      duration: "3 hours",
      room: "Hall 1, Main Block",
      syllabus: "Full Course",
      status: "scheduled"
    },
  ];

  const completedExams = [
    {
      id: 4,
      subject: "Operating Systems",
      code: "CS202",
      type: "Mid-Term",
      date: "November 10, 2025",
      time: "10:00 AM - 1:00 PM",
      duration: "3 hours",
      room: "Room 301, Block A",
      status: "completed"
    },
  ];

  return (
    <div>
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <p className="text-muted-foreground">
          View your exam schedule and download admit cards
        </p>
      </div>

      {/* Alert */}
      <Card className="border-orange-200 bg-orange-50/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <p className="font-medium text-orange-900">Important Reminder</p>
              <p className="text-sm text-orange-700 mt-1">
                Make sure to download your admit card at least 2 days before the exam.
                Carry your admit card and ID card to the examination hall.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingExams.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedExams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingExams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{exam.subject}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{exam.code}</Badge>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                        {exam.type}
                      </Badge>
                    </div>
                  </div>
                  <Button size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Admit Card
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{exam.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{exam.time}</span>
                      <span className="text-muted-foreground">({exam.duration})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{exam.room}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Syllabus:</span>
                      <span>{exam.syllabus}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedExams.map((exam) => (
            <Card key={exam.id} className="opacity-75">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{exam.subject}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{exam.code}</Badge>
                      <Badge variant="secondary">{exam.type}</Badge>
                      <Badge className="bg-gray-100 text-gray-800">
                        Completed
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{exam.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{exam.time}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
