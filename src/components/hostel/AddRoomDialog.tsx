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
    DialogTrigger,
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
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AddRoomDialog() {
    const [open, setOpen] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [hostel, setHostel] = React.useState<"male" | "female">("male");
    const [roomNumber, setRoomNumber] = React.useState("");
    const [maxOccupancy, setMaxOccupancy] = React.useState("2");
    const { toast } = useToast();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/hostel/rooms/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    hostel,
                    roomNumber,
                    maxOccupancy: parseInt(maxOccupancy),
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                });
                setOpen(false);
                setRoomNumber("");
                setMaxOccupancy("2");
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
                description: "Failed to add room",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                    <Plus size={16} />
                    Add Room
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add New Room</DialogTitle>
                    <DialogDescription>
                        Create a new hostel room. Fill in the details below.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="hostel">Hostel Type</Label>
                            <Select value={hostel} onValueChange={(v) => setHostel(v as "male" | "female")}>
                                <SelectTrigger id="hostel">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="male">Boys Hostel</SelectItem>
                                    <SelectItem value="female">Girls Hostel</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="roomNumber">Room Number</Label>
                            <Input
                                id="roomNumber"
                                placeholder="e.g., B-101, G-205"
                                value={roomNumber}
                                onChange={(e) => setRoomNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="maxOccupancy">Max Occupancy</Label>
                            <Select value={maxOccupancy} onValueChange={setMaxOccupancy}>
                                <SelectTrigger id="maxOccupancy">
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
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Room"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
