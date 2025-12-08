"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts"

interface AttendanceByDayData {
  day: string
  attendance: number
}

const defaultData: AttendanceByDayData[] = [
  { day: "Mon", attendance: 92 },
  { day: "Tue", attendance: 90 },
  { day: "Wed", attendance: 85 },
  { day: "Thu", attendance: 89 },
  { day: "Fri", attendance: 89 },
]

const chartConfig = {
  attendance: {
    label: "Attendance %",
    color: "#3b82f6",
  },
}

export function AttendanceByDayChart({ data = defaultData }: { data?: AttendanceByDayData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance % by Day of the Week</CardTitle>
        <CardDescription>Weekly attendance pattern</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <RadarChart data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="day" 
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Radar
              name="Attendance %"
              dataKey="attendance"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
