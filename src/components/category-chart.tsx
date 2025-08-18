
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
      <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
         <BarChart accessibilityLayer data={data} margin={{ top: 20, left: 10, right: 10, bottom: 10 }}>
            <XAxis
              dataKey="name"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <YAxis dataKey="total"/>
            <Tooltip cursor={{ fill: "hsl(var(--accent))" }} content={<ChartTooltipContent />} />
            <Bar dataKey="total" fill="var(--color-total)" radius={4} />
          </BarChart>
      </ChartContainer>
    </div>
  );
}
