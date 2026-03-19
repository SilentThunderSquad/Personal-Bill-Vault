import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Calendar } from 'lucide-react';
import { getMonthlyUploadsData, chartColors } from '@/utils/chartHelpers';
import type { Bill } from '@/types';

interface MonthlyUploadsChartProps {
  bills: Bill[];
}

export function MonthlyUploadsChart({ bills }: MonthlyUploadsChartProps) {
  const chartData = useMemo(() => getMonthlyUploadsData(bills), [bills]);

  const totalThisMonth = chartData[chartData.length - 1]?.count || 0;
  const totalLastMonth = chartData[chartData.length - 2]?.count || 0;
  const trend = totalThisMonth - totalLastMonth;

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{`${label} 2024`}</p>
          <p className="text-sm text-accent">
            {`Bills added: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Monthly Uploads</CardTitle>
              <CardDescription className="text-xs">Bills added over time</CardDescription>
            </div>
          </div>

          {trend !== 0 && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              trend > 0
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-red-600 bg-red-50'
            }`}>
              <TrendingUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
              {trend > 0 ? '+' : ''}{trend} vs last month
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 5,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                stroke="#e2e8f0"
                opacity={0.5}
              />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                className="text-xs"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                stroke={chartColors[0]}
                strokeWidth={2.5}
                dot={{
                  fill: chartColors[0],
                  strokeWidth: 0,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  stroke: chartColors[0],
                  strokeWidth: 2,
                  fill: 'white'
                }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last 6 months</span>
            <span>{chartData.reduce((sum, item) => sum + item.count, 0)} total bills</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}