"use client";

import { useEffect, useState } from "react";
import { UserPlus, UserCheck, X, Check, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
    getPendingRequests,
    getUserConnections,
    respondToConnectionRequest,
    type ConnectionRequest,
    type Connection,
} from "@/actions/alumni/connections";

export default function AlumniConnectionsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
    const [connections, setConnections] = useState<Connection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);

    useEffect(() => {
        loadData();
        const interval = setInterval(loadData, 10000); // Refresh every 10 seconds
        return () => clearInterval(interval);
    }, [session?.user?.email]);

    const loadData = async () => {
        if (!session?.user?.email) return;

        try {
            const [requests, conns] = await Promise.all([
                getPendingRequests(session.user.email),
                getUserConnections(session.user.email),
            ]);
            setPendingRequests(requests);
            setConnections(conns);
        } catch (error) {
            console.error("Error loading connections:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResponse = async (requestId: string, action: "accepted" | "rejected") => {
        setRespondingTo(requestId);

        try {
            const result = await respondToConnectionRequest(requestId, action);

            if (result.success) {
                toast.success(result.message);
                await loadData();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error responding to request:", error);
            toast.error("Failed to respond to request");
        } finally {
            setRespondingTo(null);
        }
    };

    const handleMessage = (email: string) => {
        router.push(`/dashboard/alumni/chat`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                    <p className="text-muted-foreground">Loading connections...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">My Connections</h1>
                <p className="mt-2 text-muted-foreground">
                    Manage your alumni network connections
                </p>
            </div>

            <Tabs defaultValue="connections" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="connections">
                        Connections ({connections.length})
                    </TabsTrigger>
                    <TabsTrigger value="requests">
                        Requests ({pendingRequests.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="connections" className="space-y-4 mt-6">
                    {connections.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <UserCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">No connections yet</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Start connecting with alumni from the directory
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            {connections.map((connection) => (
                                <Card key={connection.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback>
                                                    {connection.connectedName
                                                        ?.split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase() || "AL"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{connection.connectedName}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {connection.connectedEmail}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Connected on{" "}
                                                    {new Date(connection.connectedAt).toLocaleDateString()}
                                                </p>
                                                <Button
                                                    size="sm"
                                                    className="mt-3"
                                                    onClick={() => handleMessage(connection.connectedEmail)}
                                                >
                                                    <MessageCircle className="mr-2 h-4 w-4" />
                                                    Message
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="requests" className="space-y-4 mt-6">
                    {pendingRequests.length === 0 ? (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                <p className="text-muted-foreground">No pending requests</p>
                                <p className="text-sm text-muted-foreground mt-2">
                                    Connection requests will appear here
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {pendingRequests.map((request) => (
                                <Card key={request.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start gap-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarFallback>
                                                    {request.requesterName
                                                        ?.split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase() || "AL"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <h3 className="font-semibold">{request.requesterName}</h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {request.requesterEmail}
                                                </p>
                                                {request.message && (
                                                    <p className="text-sm mt-2 p-2 bg-muted rounded">
                                                        {request.message}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground mt-2">
                                                    {new Date(request.timestamp).toLocaleDateString()}
                                                </p>
                                                <div className="flex gap-2 mt-3">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleResponse(request.id, "accepted")}
                                                        disabled={respondingTo === request.id}
                                                    >
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleResponse(request.id, "rejected")}
                                                        disabled={respondingTo === request.id}
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Decline
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
