"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, Send, ArrowLeft, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import {
    getChatList,
    getMessages,
    sendMessage,
    markMessagesAsRead,
    type ChatMessage,
} from "@/actions/alumni/chat";
import { getUserConnections } from "@/actions/alumni/connections";

// Memoized chat item component
const ChatItem = React.memo(({
    chat,
    isSelected,
    onSelect
}: {
    chat: any;
    isSelected: boolean;
    onSelect: (email: string, name: string) => void;
}) => (
    <div
        onClick={() => onSelect(chat.email, chat.name)}
        className={`p-4 cursor-pointer hover:bg-muted transition-colors border-b ${isSelected ? "bg-muted" : ""}`}
    >
        <div className="flex items-start gap-3">
            <Avatar>
                <AvatarFallback>
                    {chat.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "AL"}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{chat.name}</p>
                    {chat.unreadCount > 0 && (
                        <Badge variant="default" className="shrink-0">
                            {chat.unreadCount}
                        </Badge>
                    )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                    {chat.lastMessage}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    {new Date(chat.lastMessageTime).toLocaleDateString()}
                </p>
            </div>
        </div>
    </div>
));
ChatItem.displayName = "ChatItem";

// Memoized connection item component
const ConnectionItem = React.memo(({
    connection,
    isSelected,
    onSelect
}: {
    connection: any;
    isSelected: boolean;
    onSelect: (email: string, name: string) => void;
}) => (
    <div
        onClick={() => onSelect(connection.connectedEmail, connection.connectedName)}
        className={`p-4 cursor-pointer hover:bg-muted transition-colors border-b ${isSelected ? "bg-muted" : ""}`}
    >
        <div className="flex items-start gap-3">
            <Avatar>
                <AvatarFallback>
                    {connection.connectedName?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "AL"}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{connection.connectedName}</p>
                <p className="text-sm text-muted-foreground">Start a conversation</p>
            </div>
        </div>
    </div>
));
ConnectionItem.displayName = "ConnectionItem";

// Memoized message component
const MessageBubble = React.memo(({
    message,
    isSender
}: {
    message: ChatMessage;
    isSender: boolean;
}) => (
    <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[70%] rounded-lg p-3 ${isSender ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            <p className="text-sm">{message.message}</p>
            <p className={`text-xs mt-1 ${isSender ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {new Date(message.timestamp).toLocaleString()}
            </p>
        </div>
    </div>
));
MessageBubble.displayName = "MessageBubble";

export default function AlumniChatPage() {
    const { data: session } = useSession();
    const [chatList, setChatList] = useState<any[]>([]);
    const [selectedChat, setSelectedChat] = useState<string | null>(null);
    const [selectedChatName, setSelectedChatName] = useState<string>("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [connections, setConnections] = useState<any[]>([]);
    const chatIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const messageIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const loadChatData = useCallback(async () => {
        if (!session?.user?.email) return;

        try {
            const [chats, conns] = await Promise.all([
                getChatList(session.user.email),
                getUserConnections(session.user.email),
            ]);
            setChatList(chats);
            setConnections(conns);
        } catch (error) {
            console.error("Error loading chat data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [session?.user?.email]);

    const loadMessages = useCallback(async (otherEmail: string) => {
        if (!session?.user?.email) return;

        try {
            const msgs = await getMessages(session.user.email, otherEmail);
            setMessages(msgs);
        } catch (error) {
            console.error("Error loading messages:", error);
        }
    }, [session?.user?.email]);

    useEffect(() => {
        loadChatData();
        // Increase refresh interval to reduce load
        chatIntervalRef.current = setInterval(loadChatData, 10000); // Changed from 5s to 10s
        return () => {
            if (chatIntervalRef.current) {
                clearInterval(chatIntervalRef.current);
            }
        };
    }, [loadChatData]);

    useEffect(() => {
        if (selectedChat && session?.user?.email) {
            loadMessages(selectedChat);
            markMessagesAsRead(session.user.email, selectedChat);
            // Increase message refresh interval
            messageIntervalRef.current = setInterval(() => loadMessages(selectedChat), 5000); // Changed from 3s to 5s
            return () => {
                if (messageIntervalRef.current) {
                    clearInterval(messageIntervalRef.current);
                }
            };
        }
    }, [selectedChat, session?.user?.email, loadMessages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    };

    const handleSendMessage = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!messageInput.trim() || !selectedChat || !session?.user?.email || !session?.user?.name) {
            return;
        }

        setIsSending(true);

        try {
            const result = await sendMessage({
                senderEmail: session.user.email,
                senderName: session.user.name,
                receiverEmail: selectedChat,
                receiverName: selectedChatName,
                message: messageInput.trim(),
            });

            if (result.success) {
                setMessageInput("");
                // Only reload messages for current chat, not all chat data
                await loadMessages(selectedChat);
                // Optionally reload chat list in background without awaiting
                loadChatData();
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            setIsSending(false);
        }
    }, [messageInput, selectedChat, session?.user?.email, session?.user?.name, selectedChatName, loadMessages, loadChatData]);

    const handleSelectChat = useCallback((email: string, name: string) => {
        setSelectedChat(email);
        setSelectedChatName(name);
    }, []);

    // Memoize connections without chats to avoid recalculation
    const connectionsWithoutChats = useMemo(() => {
        return connections.filter(conn => !chatList.some(chat => chat.email === conn.connectedEmail));
    }, [connections, chatList]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground animate-pulse" />
                    <p className="text-muted-foreground">Loading chats...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Alumni Chat</h1>
                <p className="mt-2 text-muted-foreground">
                    Connect and chat with your fellow alumni
                </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Chat List */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Conversations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[600px]">
                            {chatList.length === 0 && connections.length === 0 ? (
                                <div className="p-6 text-center text-muted-foreground">
                                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No conversations yet</p>
                                    <p className="text-sm mt-1">Connect with alumni to start chatting</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {/* Show existing chats */}
                                    {chatList.map((chat) => (
                                        <ChatItem
                                            key={chat.email}
                                            chat={chat}
                                            isSelected={selectedChat === chat.email}
                                            onSelect={handleSelectChat}
                                        />
                                    ))}

                                    {/* Show connections without chats */}
                                    {connectionsWithoutChats.map((conn) => (
                                        <ConnectionItem
                                            key={conn.connectedEmail}
                                            connection={conn}
                                            isSelected={selectedChat === conn.connectedEmail}
                                            onSelect={handleSelectChat}
                                        />
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>

                {/* Chat Window */}
                <Card className="lg:col-span-2">
                    {selectedChat ? (
                        <>
                            <CardHeader className="border-b">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedChat(null)}
                                        className="lg:hidden"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Button>
                                    <Avatar>
                                        <AvatarFallback>
                                            {selectedChatName
                                                ?.split(" ")
                                                .map((n: string) => n[0])
                                                .join("")
                                                .toUpperCase() || "AL"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{selectedChatName}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{selectedChat}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <ScrollArea className="h-[480px] p-4" ref={scrollRef}>
                                    {messages.length === 0 ? (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <div className="text-center">
                                                <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>No messages yet</p>
                                                <p className="text-sm">Send a message to start the conversation</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {messages.map((msg) => (
                                                <MessageBubble
                                                    key={msg.id}
                                                    message={msg}
                                                    isSender={msg.senderEmail === session?.user?.email}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                                <div className="border-t p-4">
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <Input
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            placeholder="Type a message..."
                                            disabled={isSending}
                                        />
                                        <Button type="submit" disabled={isSending || !messageInput.trim()}>
                                            <Send className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="flex items-center justify-center h-[600px]">
                            <div className="text-center text-muted-foreground">
                                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                                <p>Select a conversation to start chatting</p>
                            </div>
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
}
