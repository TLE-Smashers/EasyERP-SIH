"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getFacultyRequestById,
  getFacultyRequestMessages,
  sendFacultyRequestMessage,
  markFacultyRequestMessagesAsRead,
  updateFacultyRequestStatus,
} from "@/actions/federation/facultyRequests";
import { FacultyRequest, FacultyRequestMessage, RequestStatus } from "@/types/facultyRequest";
import { Loader2, Send, ArrowLeft, Video, Calendar, Clock, User, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

export default function FacultyRequestChatPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const requestId = params.requestId as string;

  const [request, setRequest] = useState<FacultyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [meetLink, setMeetLink] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [duration, setDuration] = useState("60");

  const isFaculty = session?.user?.role === "faculty";

  useEffect(() => {
    if (requestId && session?.user?.email) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, session?.user?.email]);

  const loadData = async () => {
    setLoading(true);
    try {
      const requestData = await getFacultyRequestById(requestId);

      if (!requestData) {
        toast.error("Request not found");
        router.back();
        return;
      }

      setRequest(requestData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load request");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: RequestStatus) => {
    if (!request) return;

    // Validate required fields when accepting
    if (status === RequestStatus.ACCEPTED) {
      if (!scheduleDate || !scheduleTime || !meetLink) {
        toast.error("Please provide meeting date, time, and Google Meet link");
        return;
      }
    }

    try {
      const result = await updateFacultyRequestStatus(
        requestId,
        status,
        responseMessage || undefined,
        meetLink || undefined,
        scheduleDate || undefined,
        scheduleTime || undefined,
        duration || undefined
      );

      if (result.success) {
        toast.success(result.message);
        await loadData();
        setResponseMessage("");
        setMeetLink("");
        setScheduleDate("");
        setScheduleTime("");
        setDuration("60");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update status");
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

  if (!request && !loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-8 text-center">
            Request not found
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && request && (
        <>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{request.subject}</h1>
          <p className="text-muted-foreground">{request.topic}</p>
        </div>
        <Badge className={`${getStatusColor(request.status)} ml-auto`}>
          {request.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Request Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Student</p>
              <p className="text-sm">{request.studentName}</p>
              <p className="text-xs text-muted-foreground">
                {request.studentInstitutionName}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Faculty</p>
              <p className="text-sm">{request.facultyName}</p>
              <p className="text-xs text-muted-foreground">
                {request.facultyInstitutionName}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Schedule</p>
              {request.preferredDate && request.preferredTime ? (
                <>
                  <p className="text-sm flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(request.preferredDate), "PPP")}
                  </p>
                  <p className="text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {request.preferredTime} {request.duration && `(${request.duration} mins)`}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Faculty will set the schedule
                </p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm">{request.description}</p>
            </div>

            {request.meetLink && (
              <div className="pt-4 border-t">
                <p className="text-sm font-medium mb-2">Meeting Link</p>
                <a
                  href={request.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-2"
                >
                  <Video className="h-4 w-4" />
                  Join Google Meet
                </a>
              </div>
            )}

            {/* Faculty Actions */}
            {isFaculty && request.status === RequestStatus.PENDING && (
              <div className="pt-4 border-t space-y-3">
                <p className="text-sm font-medium">Set Schedule & Accept Request</p>

                <div className="space-y-2">
                  <Label htmlFor="scheduleDate">
                    <Calendar className="h-3 w-3 inline mr-1" />
                    Meeting Date *
                  </Label>
                  <Input
                    id="scheduleDate"
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduleTime">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Meeting Time *
                  </Label>
                  <Input
                    id="scheduleTime"
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <select
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="30">30 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="meetLink">
                    <Video className="h-3 w-3 inline mr-1" />
                    Google Meet Link *
                  </Label>
                  <Input
                    id="meetLink"
                    placeholder="https://meet.google.com/..."
                    value={meetLink}
                    onChange={(e) => setMeetLink(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responseMessage">Response Message (optional)</Label>
                  <Textarea
                    id="responseMessage"
                    placeholder="Add a message for the student..."
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(RequestStatus.ACCEPTED)}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Accept Request
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleUpdateStatus(RequestStatus.REJECTED)}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            )}

            {isFaculty && request.status === RequestStatus.ACCEPTED && (
              <div className="pt-4 border-t">
                <Button
                  size="sm"
                  onClick={() => handleUpdateStatus(RequestStatus.COMPLETED)}
                  className="w-full"
                >
                  Mark as Completed
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Request Status and Actions - Simplified View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Request Status</CardTitle>
            <CardDescription>
              Current status and available actions for this consultation request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Submitted:</span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(request.createdAt), "PPp")}
                  </span>
                </div>
                {request.responseMessage && (
                  <div className="pt-3 border-t mt-3">
                    <p className="text-sm font-medium mb-1">Response:</p>
                    <p className="text-sm text-muted-foreground">{request.responseMessage}</p>
                  </div>
                )}
              </div>
            </div>

            {request.status === RequestStatus.PENDING && !isFaculty && (
              <div className="p-4 border border-yellow-500/50 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Your request is pending. The faculty will review and respond soon.
                </p>
              </div>
            )}

            {request.status === RequestStatus.ACCEPTED && (
              <div className="p-4 border border-green-500/50 rounded-lg bg-green-50 dark:bg-green-950/20">
                <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-2">
                  Request Accepted!
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your consultation has been scheduled. Please use the meeting link above to join at the scheduled time.
                </p>
              </div>
            )}

            {request.status === RequestStatus.REJECTED && (
              <div className="p-4 border border-red-500/50 rounded-lg bg-red-50 dark:bg-red-950/20">
                <p className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
                  Request Declined
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  Unfortunately, the faculty was unable to accept this request. Please try requesting again or contact another faculty member.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      </>
      )}
    </div>
  );
}
