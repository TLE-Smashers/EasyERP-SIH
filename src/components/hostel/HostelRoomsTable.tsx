"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HostelRoom } from "@/types/hostel";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { EditRoomDialog } from "@/components/hostel/EditRoomDialog";
import { X, Edit2, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface HostelRoomsTableProps {
  data: HostelRoom[];
  onDeallocate?: (studentId: string) => void;
}

export function HostelRoomsTable({ data, onDeallocate }: HostelRoomsTableProps) {
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [selectedRoom, setSelectedRoom] = React.useState<HostelRoom | null>(null);
  const [deletingRoom, setDeletingRoom] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const exportToCSV = () => {
    const headers = ['Hostel', 'Room Number', 'Max Occupancy', 'Current Occupancy', 'Status', 'Occupants'];
    const csvRows = [
      headers.join(','),
      ...data.map(room => {
        const status = room.occupants.length === 0 ? 'Available' : room.occupants.length < room.maxOccupancy ? 'Partially Filled' : 'Full';
        return [
          `"${room.hostel === 'male' ? 'Boys' : 'Girls'}"`,
          `"${room.roomNumber}"`,
          `"${room.maxOccupancy}"`,
          `"${room.occupants.length}"`,
          `"${status}"`,
          `"${room.occupants.join(', ')}"`
        ].join(',');
      })
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hostel-rooms-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const performDeallocate = async (studentId: string) => {
    try {
      setLoadingId(studentId);
      const res = await fetch("/api/hostel/deallocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const result = await res.json();
      setDialogOpen(false);
      setSelectedStudentId(null);
      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      setDialogOpen(false);
      setSelectedStudentId(null);
      toast({
        title: "Error",
        description: "Failed to deallocate student",
        variant: "destructive",
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;

    try {
      setDeletingRoom(true);
      const res = await fetch("/api/hostel/rooms/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomNumber: selectedRoom.roomNumber }),
      });
      const result = await res.json();

      toast({
        title: result.success ? "Success" : "Error",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });

      setDeleteDialogOpen(false);
      setSelectedRoom(null);

      if (result.success) {
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    } finally {
      setDeletingRoom(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center mb-4">
        <Button onClick={exportToCSV} variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto">
        <div className="rounded-xl border min-w-max mx-0 shadow-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="font-bold text-center">Hostel</TableHead>
                <TableHead className="font-bold text-center">Room Number</TableHead>
                <TableHead className="font-bold text-center">Occupants</TableHead>
                <TableHead className="font-bold text-center">Max Occupancy</TableHead>
                <TableHead className="font-bold text-center">Status</TableHead>
                <TableHead className="font-bold text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length ? data.map((room) => (
                <TableRow key={room.roomNumber} className="hover:bg-muted/20 transition-all">
                  <TableCell className="text-center">
                    <Badge variant={room.hostel === "male" ? "default" : "secondary"}>{room.hostel === "male" ? "Boys" : "Girls"}</Badge>
                  </TableCell>
                  <TableCell className="text-center">{room.roomNumber}</TableCell>
                  <TableCell className="text-center">
                    {room.occupants.length ? (
                      <div className="flex flex-wrap gap-2 justify-center">
                        {room.occupants.map((studentId) => (
                          <span
                            key={studentId}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors
                              bg-green-100 border-green-300 text-green-900"
                          >
                            <span className="font-semibold text-xs">{studentId}</span>
                            <Dialog open={dialogOpen && selectedStudentId === studentId} onOpenChange={open => { setDialogOpen(open); if (!open) setSelectedStudentId(null); }}>
                              <DialogTrigger asChild>
                                <button
                                  className="ml-1 text-xs text-gray-500 hover:text-red-600 p-0 rounded-full transition-colors"
                                  onClick={() => { setDialogOpen(true); setSelectedStudentId(studentId); }}
                                  title="Deallocate"
                                  disabled={loadingId === studentId}
                                  style={{ background: 'transparent', border: 'none' }}
                                >
                                  <X size={14} strokeWidth={2} className="inline-block align-middle" />
                                </button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Deallocate Student</DialogTitle>
                                </DialogHeader>
                                <div className="py-2">Are you sure you want to deallocate <b>{studentId}</b> from this room?</div>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancel</Button>
                                  </DialogClose>
                                  <Button variant="destructive" onClick={() => performDeallocate(studentId)} disabled={loadingId === studentId}>
                                    {loadingId === studentId ? "Removing..." : "Confirm"}
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-muted-foreground">Empty</span>}
                  </TableCell>
                  <TableCell className="text-center">{room.maxOccupancy}</TableCell>
                  <TableCell className="text-center">
                    {room.occupants.length === 0 ? (
                      <Badge variant="secondary">Available</Badge>
                    ) : room.occupants.length < room.maxOccupancy ? (
                      <Badge variant="outline">Partially Filled</Badge>
                    ) : (
                      <Badge variant="default">Full</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRoom(room);
                          setEditDialogOpen(true);
                        }}
                      >
                        <Edit2 size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setSelectedRoom(room);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={room.occupants.length > 0}
                      >
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">No rooms found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Room Dialog */}
      {selectedRoom && (
        <EditRoomDialog
          room={selectedRoom}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
        />
      )}

      {/* Delete Room Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            Are you sure you want to delete room <b>{selectedRoom?.roomNumber}</b>? This action cannot be undone.
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteRoom}
              disabled={deletingRoom}
            >
              {deletingRoom ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
