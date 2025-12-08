"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

interface SuspensionByGradeData {
  grade: string
  outOfSchool: number
  inSchool: number
}

const defaultData: SuspensionByGradeData[] = [
  { grade: "9", outOfSchool: 2.1, inSchool: 1.1 },
  { grade: "10", outOfSchool: 0, inSchool: 2.5 },
  { grade: "11", outOfSchool: 2.1, inSchool: 0.8 },
  { grade: "12", outOfSchool: 0, inSchool: 1.1 },
]

const chartConfig = {
  outOfSchool: {
    label: "Out of School",
    color: "#ef4444",
  },
  inSchool: {
    label: "In School",
    color: "#3b82f6",
  },
}

export function SuspensionByGradeChart({ data = defaultData }: { data?: SuspensionByGradeData[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suspension by Grade</CardTitle>
        <CardDescription>In-school and out-of-school suspensions</CardDescription>
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
              domain={[0, 3]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="outOfSchool" 
              fill="#ef4444"
              name="Out of School"
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
            <Bar 
              dataKey="inSchool" 
              fill="#3b82f6"
              name="In School"
              radius={[4, 4, 0, 0]}
              stackId="a"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
