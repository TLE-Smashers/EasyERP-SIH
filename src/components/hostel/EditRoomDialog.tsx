"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { HostelRoom } from "@/types/hostel";
import { useToast } from "@/hooks/use-toast";

interface EditRoomDialogProps {
    room: HostelRoom;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditRoomDialog({ room, open, onOpenChange }: EditRoomDialogProps) {
    const [loading, setLoading] = React.useState(false);
    const [hostel, setHostel] = React.useState<"male" | "female">(room.hostel);
    const [roomNumber, setRoomNumber] = React.useState(room.roomNumber);
    const [maxOccupancy, setMaxOccupancy] = React.useState(room.maxOccupancy.toString());
    const { toast } = useToast();
    const router = useRouter();

    React.useEffect(() => {
        if (open) {
            setHostel(room.hostel);
            setRoomNumber(room.roomNumber);
            setMaxOccupancy(room.maxOccupancy.toString());
        }
    }, [open, room]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/hostel/rooms/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldRoomNumber: room.roomNumber,
                    newRoomNumber: roomNumber,
                    hostel,
                    maxOccupancy: parseInt(maxOccupancy),
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                });
                onOpenChange(false);
                router.refresh();
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
                description: "Failed to update room",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Room</DialogTitle>
                    <DialogDescription>
                        Update the room details. Changes will affect all related records.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-hostel">Hostel Type</Label>
                            <Select value={hostel} onValueChange={(v) => setHostel(v as "male" | "female")}>
                                <SelectTrigger id="edit-hostel">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Boys Hostel</SelectItem>
                                    <SelectItem value="female">Girls Hostel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-roomNumber">Room Number</Label>
                            <Input
                                id="edit-roomNumber"
                                placeholder="e.g., B-101, G-205"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-maxOccupancy">Max Occupancy</Label>
                            <Select value={maxOccupancy} onValueChange={setMaxOccupancy}>
                                <SelectTrigger id="edit-maxOccupancy">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Room"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
