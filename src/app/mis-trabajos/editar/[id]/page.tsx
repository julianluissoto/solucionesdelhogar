
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface CategoryChartProps {
  data: { name: string; total: number }[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  const chartConfig = {
    total: {
      label: "Trabajos",
      color: "hsl(var(--primary))",
    },
  }

  return (
    <div className="h-auto-full">
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
         <BarChart accessibilityLayer data={data} layout="vertical" margin={{ top: 20, left: 10, right: 10, bottom: 10 }}>
            <XAxis type="number" dataKey="total" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 12 }}
              width={100}
            />
            <Tooltip cursor={{ fill: "hsl(var(--accent))" }} content={<ChartTooltipContent />} />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
          </BarChart>
      </ChartContainer>
    </div>
  );
}
