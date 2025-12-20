"use server";

import { fetchHostelRooms } from "@/lib/google/hostelSheet";

export interface HostelOccupancyData {
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    occupancyPercentage: number;
    maleHostel: {
        occupied: number;
        total: number;
        percentage: number;
    };
    femaleHostel: {
        occupied: number;
        total: number;
        percentage: number;
    };
}

export async function getHostelOccupancy(): Promise<HostelOccupancyData> {
    try {
        const rooms = await fetchHostelRooms();

        let totalBeds = 0;
        let occupiedBeds = 0;
        let maleTotalBeds = 0;
        let maleOccupiedBeds = 0;
        let femaleTotalBeds = 0;
        let femaleOccupiedBeds = 0;

        rooms.forEach((room) => {
            const capacity = room.maxOccupancy || 0;
            const occupied = room.occupants?.length || 0;

            totalBeds += capacity;
            occupiedBeds += occupied;

            if (room.hostel === "male") {
                maleTotalBeds += capacity;
                maleOccupiedBeds += occupied;
            } else if (room.hostel === "female") {
                femaleTotalBeds += capacity;
                femaleOccupiedBeds += occupied;
            }
        });

        const availableBeds = totalBeds - occupiedBeds;
        const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
        const malePercentage = maleTotalBeds > 0 ? Math.round((maleOccupiedBeds / maleTotalBeds) * 100) : 0;
        const femalePercentage = femaleTotalBeds > 0 ? Math.round((femaleOccupiedBeds / femaleTotalBeds) * 100) : 0;

        return {
            totalBeds,
            occupiedBeds,
            availableBeds,
            occupancyPercentage,
            maleHostel: {
                occupied: maleOccupiedBeds,
                total: maleTotalBeds,
                percentage: malePercentage,
            },
            femaleHostel: {
                occupied: femaleOccupiedBeds,
                total: femaleTotalBeds,
                percentage: femalePercentage,
            },
        };
    } catch (error) {
        console.error("Error getting hostel occupancy:", error);
        // Return default values on error
        return {
            totalBeds: 0,
            occupiedBeds: 0,
            availableBeds: 0,
            occupancyPercentage: 0,
            maleHostel: { occupied: 0, total: 0, percentage: 0 },
            femaleHostel: { occupied: 0, total: 0, percentage: 0 },
        };
    }
}
