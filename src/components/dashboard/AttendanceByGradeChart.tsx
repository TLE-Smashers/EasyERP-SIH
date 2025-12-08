"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

interface AttendanceByGradeProps {
  data?: {
    grade: string
    pastWeek: number
    currentWeek: number
    ytd: number
  }[]
}

const defaultData = [
  { grade: "9", pastWeek: 92, currentWeek: 93, ytd: 90 },
  { grade: "10", pastWeek: 95, currentWeek: 95, ytd: 91 },
  { grade: "11", pastWeek: 87, currentWeek: 91, ytd: 91 },
  { grade: "12", pastWeek: 95, currentWeek: 98, ytd: 91 },
]

const chartConfig = {
  pastWeek: {
    label: "Past Week",
    color: "#3b82f6",
  },
  currentWeek: {
    label: "Current Week",
    color: "#ef4444",
  },
  ytd: {
    label: "YTD",
    color: "#eab308",
  },
}

export function AttendanceByGradeChart({ data = defaultData }: AttendanceByGradeProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance % by Grade</CardTitle>
        <CardDescription>Weekly and year-to-date comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis 
              dataKey="grade" 
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              className="text-xs"
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px' }}
              iconType="rect"
            />
            <Bar 
              dataKey="pastWeek" 
              fill="#3b82f6"
              name="Past Week"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="currentWeek" 
              fill="#ef4444"
              name="Current Week"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="ytd" 
              fill="#eab308"
              name="YTD"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
