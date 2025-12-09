"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts"

interface AdmissionStats {
  total: number
  pending: number
  verified: number
  paymentPending: number
  completed: number
  rejected: number
}

interface AdmissionChartProps {
  stats: AdmissionStats
}

const chartConfig = {
  pending: {
    label: "Pending",
    color: "hsl(var(--chart-1))",
  },
  verified: {
    label: "Verified",
    color: "hsl(var(--chart-2))",
  },
  paymentPending: {
    label: "Payment Pending",
    color: "hsl(var(--chart-3))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-4))",
  },
  rejected: {
    label: "Rejected",
    color: "hsl(var(--chart-5))",
  },
}

export function AdmissionChart({ stats }: AdmissionChartProps) {
  const chartData = [
    { name: "Pending", value: stats.pending, fill: "#3b82f6" },
    { name: "Verified", value: stats.verified, fill: "#8b5cf6" },
    { name: "Payment Pending", value: stats.paymentPending, fill: "#06b6d4" },
    { name: "Completed", value: stats.completed, fill: "#10b981" },
    { name: "Rejected", value: stats.rejected, fill: "#ef4444" },
  ]

  const barData = [
    { status: "Pending", count: stats.pending },
    { status: "Verified", count: stats.verified },
    { status: "Payment", count: stats.paymentPending },
    { status: "Completed", count: stats.completed },
    { status: "Rejected", count: stats.rejected },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Status Overview</CardTitle>
        <CardDescription>Distribution of application statuses</CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <ChartContainer config={chartConfig} className="h-40 w-full">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="status" 
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
            <Bar 
              dataKey="count" 
              radius={[8, 8, 0, 0]}
              fill="#3b82f6"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
