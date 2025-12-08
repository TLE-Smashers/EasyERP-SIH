"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { PieChart, Pie, Cell, Legend } from "recharts"

interface AbsentStudentData {
  name: string
  value: number
  fill: string
  [key: string]: string | number
}

const defaultData: AbsentStudentData[] = [
  { name: "0 Days", value: 236, fill: "#10b981" },
  { name: "1-4 Days", value: 11, fill: "#eab308" },
  { name: "5-9 Days", value: 4, fill: "#f97316" },
  { name: "10-14 Days", value: 127, fill: "#ef4444" },
]

const chartConfig = defaultData.reduce((acc, item) => {
  acc[item.name.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')] = {
    label: item.name,
    color: item.fill,
  }
  return acc
}, {} as any)

export function AbsentStudentPercentageChart() {
  const total = defaultData.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>% Student Absent YTD (year To Date)</CardTitle>
        <CardDescription>Distribution of absent days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-full flex justify-center">
            <ChartContainer config={chartConfig} className="h-56 w-full max-w-sm">
              <PieChart>
                <Pie
                  data={defaultData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {defaultData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-3xl font-bold">{total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-4 w-full max-w-sm">
            {defaultData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm flex-shrink-0" 
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
                <span className="text-sm font-semibold ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
