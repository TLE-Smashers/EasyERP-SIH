"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import { Treemap, ResponsiveContainer } from "recharts"

interface RoomData {
  name: string
  size: number
  fill: string
  [key: string]: string | number
}

interface TreeMapChartProps {
  data?: RoomData[]
}

const defaultData: RoomData[] = [
  { name: "Floor 1 - Occupied", size: 24, fill: "#10b981" },
  { name: "Floor 1 - Available", size: 8, fill: "#d1fae5" },
  { name: "Floor 2 - Occupied", size: 28, fill: "#3b82f6" },
  { name: "Floor 2 - Available", size: 4, fill: "#dbeafe" },
  { name: "Floor 3 - Occupied", size: 22, fill: "#8b5cf6" },
  { name: "Floor 3 - Available", size: 10, fill: "#ede9fe" },
  { name: "Floor 4 - Occupied", size: 26, fill: "#f59e0b" },
  { name: "Floor 4 - Available", size: 6, fill: "#fef3c7" },
  { name: "Ground Floor - Occupied", size: 18, fill: "#ef4444" },
  { name: "Ground Floor - Available", size: 14, fill: "#fee2e2" },
]

const chartConfig = defaultData.reduce((acc, item) => {
  const key = item.name.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
  acc[key] = {
    label: item.name,
    color: item.fill,
  }
  return acc
}, {} as any)

const CustomizedContent = (props: any) => {
  const { x, y, width, height, name, size } = props

  // Only show content if the rectangle is large enough
  if (width < 40 || height < 30) {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: props.fill,
            stroke: '#fff',
            strokeWidth: 2,
          }}
        />
      </g>
    )
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: props.fill,
          stroke: '#fff',
          strokeWidth: 2,
        }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 - 8}
        textAnchor="middle"
        fill="#000"
        fontSize={12}
        fontWeight="600"
      >
        {name.split(' - ')[0]}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 8}
        textAnchor="middle"
        fill="#000"
        fontSize={11}
      >
        {name.split(' - ')[1]}
      </text>
      <text
        x={x + width / 2}
        y={y + height / 2 + 24}
        textAnchor="middle"
        fill="#000"
        fontSize={14}
        fontWeight="bold"
      >
        {size}
      </text>
    </g>
  )
}

export function RoomAllocationTreeMap({ data = defaultData }: TreeMapChartProps) {
  const totalRooms = data.reduce((sum, item) => sum + item.size, 0)
  const occupiedRooms = data
    .filter(item => item.name.includes('Occupied'))
    .reduce((sum, item) => sum + item.size, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Allocation Distribution</CardTitle>
        <CardDescription>
          {occupiedRooms} of {totalRooms} rooms occupied across all floors
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data}
              dataKey="size"
              aspectRatio={4 / 3}
              stroke="#fff"
              content={<CustomizedContent />}
            />
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }} />
              <span>Ground Floor Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#3b82f6' }} />
              <span>Floor 2 Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#8b5cf6' }} />
              <span>Floor 3 Occupied</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }} />
              <span>Floor 4 Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }} />
              <span>Floor 1 Occupied</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded opacity-30" style={{ backgroundColor: '#000' }} />
              <span>Available Rooms</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
