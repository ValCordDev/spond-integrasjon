"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { WeeklyTrendPoint } from "@/lib/spond/types";

const chartConfig = {
  accepted: {
    label: "Påmeldt",
    color: "#0ca30c",
  },
  declined: {
    label: "Avslått",
    color: "var(--destructive)",
  },
  unanswered: {
    label: "Ikke svart",
    color: "var(--muted-foreground)",
  },
} satisfies ChartConfig;

export function AttendanceTrendChart({ data }: { data: WeeklyTrendPoint[] }) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Oppmøte over tid</CardTitle>
        <CardDescription>Svar per uke, gruppert på ukestart</CardDescription>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ikke nok data for en trend ennå.
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={data}>
              <defs>
                <linearGradient id="fillAccepted" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-accepted)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-accepted)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillDeclined" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-declined)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-declined)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillUnanswered" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-unanswered)"
                    stopOpacity={0.6}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-unanswered)"
                    stopOpacity={0.05}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="weekStart"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("nb-NO", {
                    day: "numeric",
                    month: "short",
                  })
                }
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("nb-NO", {
                        day: "numeric",
                        month: "short",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="unanswered"
                type="natural"
                fill="url(#fillUnanswered)"
                stroke="var(--color-unanswered)"
                stackId="a"
              />
              <Area
                dataKey="declined"
                type="natural"
                fill="url(#fillDeclined)"
                stroke="var(--color-declined)"
                stackId="a"
              />
              <Area
                dataKey="accepted"
                type="natural"
                fill="url(#fillAccepted)"
                stroke="var(--color-accepted)"
                stackId="a"
              />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
