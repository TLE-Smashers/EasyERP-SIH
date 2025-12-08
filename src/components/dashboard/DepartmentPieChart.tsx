"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

interface DepartmentData {
  name: string
  value: number
  fill: string
  [key: string]: string | number
}

interface DepartmentPieChartProps {
  data?: DepartmentData[]
}

const defaultData: DepartmentData[] = [
  { name: "Engineering", value: 120, fill: "#8b5cf6" },
  { name: "Marketing", value: 110, fill: "#3b82f6" },
  { name: "Sales", value: 95, fill: "#06b6d4" },
  { name: "Customer Support", value: 85, fill: "#d946ef" },
  { name: "Finance", value: 65, fill: "#f59e0b" },
  { name: "Human Resources", value: 50, fill: "#10b981" },
]

const chartConfig = defaultData.reduce((acc, item) => {
  acc[item.name.toLowerCase().replace(/\s+/g, '_')] = {
    label: item.name,
    color: item.fill,
  }
  return acc
}, {} as any)

export function DepartmentPieChart({ data = defaultData }: DepartmentPieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Application by Department</CardTitle>
            <CardDescription>Distribution across departments</CardDescription>
          </div>
          <select className="text-xs border rounded-md px-2 py-1 bg-background">
            <option>Today</option>
            <option>This Week</option>
            <option>This Month</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          <div className="flex-1 relative">
            <ChartContainer config={chartConfig} className="h-44 w-full">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
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
              <div className="text-2xl font-bold">{total}</div>
              <div className="text-xs text-muted-foreground ">Total Application</div>
            </div>
          </div>
          <div className="space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-sm" 
                    style={{ backgroundColor: item.fill as string }}
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
