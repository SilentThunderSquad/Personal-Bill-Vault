import { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart as PieChartIcon, Tag } from 'lucide-react';
import { getCategoryDistributionData, chartColors } from '@/utils/chartHelpers';
import type { Bill } from '@/types';

interface CategoryDistributionChartProps {
  bills: Bill[];
}

export function CategoryDistributionChart({ bills }: CategoryDistributionChartProps) {
  const chartData = useMemo(() => getCategoryDistributionData(bills), [bills]);

  const topCategory = chartData[0];

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium">{data.category}</p>
          <p className="text-sm text-accent">
            {`${data.count} bills (${data.percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: { payload?: Array<{ value: string; color: string }> }) => {
    return (
      <div className="grid grid-cols-1 gap-2 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-foreground">{entry.value}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">
                {chartData.find(item => item.category === entry.value)?.count || 0}
              </span>
              <span className="text-muted-foreground font-medium">
                {chartData.find(item => item.category === entry.value)?.percentage || 0}%
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <PieChartIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Category Distribution</CardTitle>
              <CardDescription className="text-xs">Bills by category</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            <div className="text-center">
              <Tag className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No bills to analyze</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <PieChartIcon className="h-4 w-4 text-emerald-500" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold">Category Distribution</CardTitle>
              <CardDescription className="text-xs">Bills by category</CardDescription>
            </div>
          </div>

          {topCategory && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Top category</p>
              <p className="text-sm font-medium text-foreground">{topCategory.category}</p>
              <p className="text-xs text-muted-foreground">{topCategory.percentage}%</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={70}
                paddingAngle={2}
                dataKey="count"
                stroke="none"
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <CustomLegend payload={chartData.map((item, index) => ({
          value: item.category,
          color: chartColors[index % chartColors.length]
        }))} />

        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{chartData.length} categories</span>
            <span>{bills.length} total bills</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}