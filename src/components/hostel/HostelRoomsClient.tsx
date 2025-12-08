"use client";
import React from "react";
import { HostelRoom } from "@/types/hostel";
import { HostelRoomsTable } from "@/components/hostel/HostelRoomsTable";
import { AddRoomDialog } from "@/components/hostel/AddRoomDialog";
import { PageHeader } from "@/components/ui/page-header";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HostelRoomsClient({ rooms }: { rooms: HostelRoom[] }) {
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter(r => r.occupants.length === 0).length;
  const fullRooms = rooms.filter(r => r.occupants.length === r.maxOccupancy).length;
  const [hostelType, setHostelType] = React.useState<'all' | 'male' | 'female'>('all');
  const filteredRooms = hostelType === 'all' ? rooms : rooms.filter(r => r.hostel === hostelType);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <PageHeader 
        title="Hostel Room Management" 
        description="Manage hostel rooms, allocations, and occupancy"
        actions={
          <div className="flex gap-3">
            <AddRoomDialog />
            <Link href="/dashboard/hostel">
              <Button variant="outline" className="font-semibold">Back to Applications</Button>
            </Link>
          </div>
        }
      />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 my-4">
        <div className="flex gap-4">
          <Button variant={hostelType === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setHostelType('all')}>All</Button>
          <Button variant={hostelType === 'male' ? 'default' : 'outline'} size="sm" onClick={() => setHostelType('male')}>Boys Hostel</Button>
          <Button variant={hostelType === 'female' ? 'default' : 'outline'} size="sm" onClick={() => setHostelType('female')}>Girls Hostel</Button>
        </div>
        <div className="flex gap-6 text-sm font-medium">
          <span>Total Rooms: <b>{totalRooms}</b></span>
          <span>Available: <b>{availableRooms}</b></span>
          <span>Full: <b>{fullRooms}</b></span>
        </div>
      </div>
      <div className="rounded-xl border bg-background shadow-lg p-0">
        <HostelRoomsTable data={filteredRooms} />
      </div>
    </div>
  );
}
