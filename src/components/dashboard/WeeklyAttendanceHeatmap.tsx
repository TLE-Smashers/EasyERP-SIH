"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"

interface HeatmapData {
  month: string
  date: number
  value: number
}

interface MonthlyAttendanceHeatmapProps {
  data?: HeatmapData[]
}

const defaultData: HeatmapData[] = [
  // September
  { month: "Sep", date: 1, value: 92 },
  { month: "Sep", date: 2, value: 95 },
  { month: "Sep", date: 3, value: 88 },
  { month: "Sep", date: 4, value: 90 },
  { month: "Sep", date: 5, value: 93 },
  { month: "Sep", date: 8, value: 91 },
  { month: "Sep", date: 9, value: 94 },
  { month: "Sep", date: 10, value: 89 },
  { month: "Sep", date: 11, value: 92 },
  { month: "Sep", date: 12, value: 96 },
  { month: "Sep", date: 15, value: 88 },
  { month: "Sep", date: 16, value: 90 },
  { month: "Sep", date: 17, value: 93 },
  { month: "Sep", date: 18, value: 87 },
  { month: "Sep", date: 19, value: 91 },
  { month: "Sep", date: 22, value: 94 },
  { month: "Sep", date: 23, value: 92 },
  { month: "Sep", date: 24, value: 89 },
  { month: "Sep", date: 25, value: 95 },
  { month: "Sep", date: 26, value: 90 },
  { month: "Sep", date: 29, value: 88 },
  { month: "Sep", date: 30, value: 93 },
  // October
  { month: "Oct", date: 1, value: 91 },
  { month: "Oct", date: 2, value: 94 },
  { month: "Oct", date: 3, value: 89 },
  { month: "Oct", date: 6, value: 92 },
  { month: "Oct", date: 7, value: 96 },
  { month: "Oct", date: 8, value: 88 },
  { month: "Oct", date: 9, value: 90 },
  { month: "Oct", date: 10, value: 93 },
  { month: "Oct", date: 13, value: 87 },
  { month: "Oct", date: 14, value: 91 },
  { month: "Oct", date: 15, value: 94 },
  { month: "Oct", date: 16, value: 92 },
  { month: "Oct", date: 17, value: 89 },
  { month: "Oct", date: 20, value: 95 },
  { month: "Oct", date: 21, value: 90 },
  { month: "Oct", date: 22, value: 88 },
  { month: "Oct", date: 23, value: 93 },
  { month: "Oct", date: 24, value: 91 },
  { month: "Oct", date: 27, value: 94 },
  { month: "Oct", date: 28, value: 92 },
  { month: "Oct", date: 29, value: 89 },
  { month: "Oct", date: 30, value: 95 },
  { month: "Oct", date: 31, value: 90 },
  // November
  { month: "Nov", date: 1, value: 88 },
  { month: "Nov", date: 3, value: 93 },
  { month: "Nov", date: 4, value: 91 },
  { month: "Nov", date: 5, value: 94 },
  { month: "Nov", date: 6, value: 89 },
  { month: "Nov", date: 7, value: 92 },
  { month: "Nov", date: 10, value: 96 },
  { month: "Nov", date: 11, value: 88 },
  { month: "Nov", date: 12, value: 90 },
  { month: "Nov", date: 13, value: 93 },
  { month: "Nov", date: 14, value: 87 },
  { month: "Nov", date: 17, value: 91 },
  { month: "Nov", date: 18, value: 94 },
  { month: "Nov", date: 19, value: 92 },
  { month: "Nov", date: 20, value: 89 },
  { month: "Nov", date: 21, value: 95 },
  { month: "Nov", date: 24, value: 90 },
  { month: "Nov", date: 25, value: 88 },
  { month: "Nov", date: 26, value: 93 },
  { month: "Nov", date: 27, value: 91 },
]

const chartConfig = {
  attendance: {
    label: "Attendance %",
  },
}

const getColorForValue = (value: number): string => {
  if (value >= 95) return "#22c55e" // Bright green
  if (value >= 90) return "#84cc16" // Light green
  if (value >= 85) return "#eab308" // Yellow
  if (value >= 80) return "#fb923c" // Light orange
  if (value >= 75) return "#f97316" // Orange
  if (value >= 70) return "#ef4444" // Red
  return "#dc2626" // Dark red
}

export function WeeklyAttendanceHeatmap({ data = defaultData }: MonthlyAttendanceHeatmapProps) {
  const months = ["Sep", "Oct", "Nov"]
  
  // Group data by month
  const dataByMonth: { [key: string]: HeatmapData[] } = {}
  months.forEach(month => {
    dataByMonth[month] = data.filter(d => d.month === month)
  })

  const getValueForDate = (month: string, date: number): number | null => {
    const cell = data.find((d) => d.month === month && d.date === date)
    return cell ? cell.value : null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Attendance Pattern</CardTitle>
        <CardDescription>
          Calendar heatmap showing attendance trends across months
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <div className="flex flex-col gap-3 p-2">
            {months.map((month) => (
              <div key={month} className="space-y-1.5">
                <div className="text-xs font-semibold text-muted-foreground">{month}</div>
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((date) => {
                    const value = getValueForDate(month, date)
                    if (value === null) {
                      return (
                        <div
                          key={`${month}-${date}`}
                          className="aspect-square rounded bg-muted/30"
                        />
                      )
                    }
                    return (
                      <div
                        key={`${month}-${date}`}
                        className="aspect-square rounded flex items-center justify-center font-semibold text-xs transition-transform hover:scale-110 cursor-pointer relative group"
                        style={{ 
                          backgroundColor: getColorForValue(value),
                          color: 'white'
                        }}
                      >
                        <span className="text-[10px] text-white">{date}</span>
                        <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10 shadow-lg">
                          {month} {date}: {value}%
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-2 mt-2 text-[10px] flex-wrap px-2">
          <span className="font-medium text-xs">Attendance:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#dc2626" }} />
            <span className="text-foreground">&lt;70%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ef4444" }} />
            <span className="text-foreground">70-75%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#f97316" }} />
            <span className="text-foreground">75-80%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#fb923c" }} />
            <span className="text-foreground">80-85%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#eab308" }} />
            <span className="text-foreground">85-90%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#84cc16" }} />
            <span className="text-foreground">90-95%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#22c55e" }} />
            <span className="text-foreground">&ge;95%</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-muted/30 border border-muted" />
            <span className="text-foreground">No data</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
