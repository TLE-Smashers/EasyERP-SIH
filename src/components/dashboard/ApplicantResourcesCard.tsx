"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { PieChart, Pie, Cell, Legend } from "recharts"

interface GenderData {
  name: string
  value: number
  fill: string
  [key: string]: string | number
}

const data: GenderData[] = [
  { name: "Male", value: 245, fill: "#3b82f6" },
  { name: "Female", value: 178, fill: "#ec4899" },
  { name: "Other", value: 12, fill: "#8b5cf6" },
]

const chartConfig = data.reduce((acc, item) => {
  acc[item.name.toLowerCase().replace(/\s+/g, '_')] = {
    label: item.name,
    color: item.fill,
  }
  return acc
}, {} as any)

export function ApplicantResourcesCard() {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gender Distribution</CardTitle>
        <CardDescription>Applicant gender-wise breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <div className="relative w-full flex justify-center">
            <ChartContainer config={chartConfig} className="h-56 w-full">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill as string} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-3xl font-bold">{total}</div>
              <div className="text-xs text-muted-foreground">Total<br/>Applicants</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4 w-full">
            {data.map((item, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: item.fill as string }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <div className="text-2xl font-bold">{item.value}</div>
                <div className="text-xs text-muted-foreground">{((item.value / total) * 100).toFixed(1)}%</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
