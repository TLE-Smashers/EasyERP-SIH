"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { PieChart, Pie, Cell } from "recharts"
import type { HostelOccupancyData } from "@/actions/hostel/getHostelOccupancy"

interface OccupancyData {
  name: string
  value: number
  fill: string
  [key: string]: string | number
}

interface HostelOccupancyGaugeProps {
  data: HostelOccupancyData
}

const chartConfig = {
  occupied: {
    label: "Occupied",
    color: "#10b981",
  },
  available: {
    label: "Available",
    color: "#e5e7eb",
  },
}

export function HostelOccupancyGauge({ data }: HostelOccupancyGaugeProps) {
  const { occupiedBeds, availableBeds, totalBeds, occupancyPercentage, maleHostel, femaleHostel } = data

  const chartData: OccupancyData[] = [
    { name: "Occupied", value: occupiedBeds, fill: "#10b981" },
    { name: "Available", value: availableBeds, fill: "#e5e7eb" },
  ]

  // Determine color based on occupancy percentage
  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return "#ef4444" // Red
    if (percentage >= 75) return "#f59e0b" // Orange
    if (percentage >= 60) return "#eab308" // Yellow
    return "#10b981" // Green
  }

  const occupancyColor = getOccupancyColor(occupancyPercentage)

  // Update data with dynamic color
  chartData[0].fill = occupancyColor

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hostel Occupancy</CardTitle>
        <CardDescription>
          Current bed utilization across all hostels
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-full flex justify-center">
            <ChartContainer config={chartConfig} className="h-64 w-full max-w-sm">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div
                className="text-5xl font-bold mb-1"
                style={{ color: occupancyColor }}
              >
                {occupancyPercentage}%
              </div>
              <div className="text-sm text-muted-foreground">Occupancy</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-6 w-full">
            <div className="text-center">
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: occupancyColor }}
              >
                {occupiedBeds}
              </div>
              <div className="text-sm text-muted-foreground">Occupied Beds</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1 text-gray-400">
                {availableBeds}
              </div>
              <div className="text-sm text-muted-foreground">Available Beds</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold mb-1">
                {totalBeds}
              </div>
              <div className="text-sm text-muted-foreground">Total Capacity</div>
            </div>
          </div>
          <div className="mt-6 w-full space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Male Hostel:</span>
              <span className="font-semibold">
                {maleHostel.occupied} / {maleHostel.total} beds ({maleHostel.percentage}%)
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Female Hostel:</span>
              <span className="font-semibold">
                {femaleHostel.occupied} / {femaleHostel.total} beds ({femaleHostel.percentage}%)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
