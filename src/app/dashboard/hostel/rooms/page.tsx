
import { fetchHostelRooms } from "@/lib/google/hostelSheet";
import { HostelRoom } from "@/types/hostel";
import { HostelRoomsTable } from "@/components/hostel/HostelRoomsTable";
import { HostelRoomsClient } from "@/components/hostel/HostelRoomsClient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function HostelRoomsPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }
  const userRole = session.user.role;
  if (userRole !== "hostel" && userRole !== "admin") {
    redirect("/dashboard");
  }

  const rooms: HostelRoom[] = await fetchHostelRooms();

  return <HostelRoomsClient rooms={rooms} />;
}
