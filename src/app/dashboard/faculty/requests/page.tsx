"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getFacultyRequests } from "@/actions/federation/facultyRequests";
import { FacultyRequest, RequestStatus } from "@/types/facultyRequest";
import { Loader2, Calendar, Clock, MessageCircle, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function FacultyRequestsPage() {
  const { data: session, status } = useSession();
  const [requests, setRequests] = useState<FacultyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RequestStatus | "all">("all");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.email) {
      loadRequests();
    }
  }, [status, session?.user?.email]);

  const loadRequests = async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    try {
      const data = await getFacultyRequests(session.user.email, "faculty");
      setRequests(data);
    } catch (error) {
      console.error("Failed to load requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.PENDING:
        return "bg-yellow-500";
      case RequestStatus.ACCEPTED:
        return "bg-green-500";
      case RequestStatus.REJECTED:
        return "bg-red-500";
      case RequestStatus.COMPLETED:
        return "bg-blue-500";
      case RequestStatus.CANCELLED:
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredRequests =
    filter === "all"
      ? requests
      : requests.filter((req) => req.status === filter);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Student Requests</h1>
        <p className="text-muted-foreground mt-2">
          Manage consultation requests from students
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All ({requests.length})
        </Button>
        <Button
          variant={filter === RequestStatus.PENDING ? "default" : "outline"}
          onClick={() => setFilter(RequestStatus.PENDING)}
        >
          Pending ({requests.filter((r) => r.status === RequestStatus.PENDING).length})
        </Button>
        <Button
          variant={filter === RequestStatus.ACCEPTED ? "default" : "outline"}
          onClick={() => setFilter(RequestStatus.ACCEPTED)}
        >
          Accepted ({requests.filter((r) => r.status === RequestStatus.ACCEPTED).length})
        </Button>
        <Button
          variant={filter === RequestStatus.COMPLETED ? "default" : "outline"}
          onClick={() => setFilter(RequestStatus.COMPLETED)}
        >
          Completed ({requests.filter((r) => r.status === RequestStatus.COMPLETED).length})
        </Button>
      </div>

      {/* Requests List */}
      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No requests found
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.requestId}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{request.subject}</CardTitle>
                    <CardDescription>{request.topic}</CardDescription>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{request.studentName}</p>
                      <p className="text-xs text-muted-foreground">
                        {request.studentInstitutionName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      {request.preferredDate && request.preferredTime ? (
                        <>
                          <p className="text-sm font-medium">
                            {format(new Date(request.preferredDate), "PPP")}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {request.preferredTime} {request.duration && `(${request.duration} mins)`}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">
                          Schedule not set yet
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    {request.description}
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <Link href={`/dashboard/student/faculty-request/chat/${request.requestId}`}>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      View & Respond
                      {request.unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {request.unreadCount}
                        </Badge>
                      )}
                    </Button>
                  </Link>

                  <p className="text-xs text-muted-foreground ml-auto">
                    Requested: {format(new Date(request.createdAt), "PPp")}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
