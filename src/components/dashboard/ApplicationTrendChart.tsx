"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, AreaChart, Area, CartesianGrid, XAxis, YAxis } from "recharts"

interface ApplicationTrendChartProps {
  data?: {
    date: string
    applied: number
    shortlisted: number
  }[]
}

const chartConfig = {
  applied: {
    label: "Applied",
    color: "#3b82f6",
  },
  shortlisted: {
    label: "Shortlisted",
    color: "#10b981",
  },
}

// Sample data for demonstration - will be replaced with real data
const defaultData = [
  { date: "13 May", applied: 280, shortlisted: 120 },
  { date: "14 May", applied: 320, shortlisted: 150 },
  { date: "15 May", applied: 290, shortlisted: 140 },
  { date: "16 May", applied: 350, shortlisted: 180 },
  { date: "17 May", applied: 310, shortlisted: 160 },
  { date: "18 May", applied: 380, shortlisted: 200 },
]

export function ApplicationTrendChart({ data = defaultData }: ApplicationTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Applications Trend</CardTitle>
            <CardDescription>Applied vs Shortlisted over time</CardDescription>
          </div>
          <select className="text-xs border rounded-md px-2 py-1 bg-background">
            <option>13-18 May</option>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-44 w-full">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
            <XAxis 
              dataKey="date" 
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              className="text-xs"
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area 
              type="monotone" 
              dataKey="applied" 
              stackId="1"
              stroke="#3b82f6" 
              fill="#3b82f6"
              fillOpacity={0.6}
            />
            <Area 
              type="monotone" 
              dataKey="shortlisted" 
              stackId="1"
              stroke="#10b981" 
              fill="#10b981"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
