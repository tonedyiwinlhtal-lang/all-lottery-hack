import { useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { LotteryResult } from '../types';

interface ChartProps {
  data: LotteryResult[];
  themeHex?: string;
}

export function AnalyticsChart({ data, themeHex = '#3b82f6' }: ChartProps) {
  const chartData = useMemo(() => {
    // Reverse data to show oldest to newest left to right
    return [...data].reverse().map((item) => ({
      issueNumber: item.issueNumber.slice(-4), // Just show last 4 digits for clarity
      number: parseInt(item.number, 10),
      colour: item.colour
    }));
  }, [data]);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2d33" vertical={false} />
          <XAxis 
            dataKey="issueNumber" 
            stroke="#6b7280" 
            fontSize={10}
            fontFamily='monospace'
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="#6b7280" 
            fontSize={10} 
            fontFamily='monospace'
            tickLine={false} 
            axisLine={false}
            domain={[0, 9]}
            ticks={[0,1,2,3,4,5,6,7,8,9]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1c1c24', border: '1px solid #2d2d33', borderRadius: '0.5rem', color: '#e2e2e7', fontSize: '12px', fontFamily: 'monospace' }}
            itemStyle={{ color: themeHex }}
            cursor={{ stroke: '#2d2d33', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Line 
            type="monotone" 
            dataKey="number" 
            stroke={themeHex} 
            strokeWidth={3}
            activeDot={{ r: 6, fill: themeHex, stroke: '#111116', strokeWidth: 2 }}
            dot={{ r: 4, fill: '#111116', stroke: themeHex, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
