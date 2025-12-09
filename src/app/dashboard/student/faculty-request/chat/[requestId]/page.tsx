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
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();
  const requestId = params.requestId as string;

  const [request, setRequest] = useState<FacultyRequest | null>(null);
  const [messages, setMessages] = useState<FacultyRequestMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [meetLink, setMeetLink] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [duration, setDuration] = useState("60");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isFaculty = session?.user?.role === "faculty";

  useEffect(() => {
    if (requestId && session?.user?.email) {
      loadData();
      // Poll for new messages every 5 seconds
      const interval = setInterval(loadMessages, 5000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, session?.user?.email]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestData, messagesData] = await Promise.all([
        getFacultyRequestById(requestId),
        getFacultyRequestMessages(requestId),
      ]);

      if (!requestData) {
        toast({
          title: "Error",
          description: "Request not found",
          variant: "destructive",
        });
        router.back();
        return;
      }

      setRequest(requestData);
      setMessages(messagesData);

      // Mark messages as read
      if (session?.user?.email) {
        await markFacultyRequestMessagesAsRead(requestId, session.user.email);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const messagesData = await getFacultyRequestMessages(requestId);
      setMessages(messagesData);

      // Mark as read
      if (session?.user?.email) {
        await markFacultyRequestMessagesAsRead(requestId, session.user.email);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !session?.user?.email || !session?.user?.name) {
      return;
    }

    setSending(true);
    try {
      const result = await sendFacultyRequestMessage({
        requestId,
        senderEmail: session.user.email,
        senderName: session.user.name,
        senderType: isFaculty ? "faculty" : "student",
        message: newMessage,
      });

      if (result.success) {
        setNewMessage("");
        await loadMessages();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (status: RequestStatus) => {
    if (!request) return;

    // Validate required fields when accepting
    if (status === RequestStatus.ACCEPTED) {
      if (!scheduleDate || !scheduleTime || !meetLink) {
        toast({
          title: "Missing Information",
          description: "Please provide meeting date, time, and Google Meet link",
          variant: "destructive",
        });
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
        toast({
          title: "Success",
          description: result.message,
        });
        await loadData();
        setResponseMessage("");
        setMeetLink("");
        setScheduleDate("");
        setScheduleTime("");
        setDuration("60");
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
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

        {/* Chat */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
            <CardDescription>
              Discuss the details of this consultation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="h-96 overflow-y-auto space-y-3 p-4 border rounded-lg bg-muted/20">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet. Start the conversation!
                </p>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderEmail === session?.user?.email;

                  return (
                    <div
                      key={message.messageId}
                      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-background border"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-medium">{message.senderName}</p>
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            {message.senderType}
                          </Badge>
                        </div>
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {format(new Date(message.timestamp), "p")}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                disabled={sending}
              />
              <Button type="submit" disabled={sending || !newMessage.trim()}>
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      </>
      )}
    </div>
  );
}
