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
import { TrackedPrediction } from '../types';

interface WinRatioChartProps {
  data: TrackedPrediction[];
}

export function WinRatioChart({ data }: WinRatioChartProps) {
  const chartData = useMemo(() => {
    let wins = 0;
    let resolved = 0;
    
    // Data in predictionHistory is newest first. We need chronological order.
    const sorted = [...data].reverse().filter(d => d.status !== 'PENDING');
    
    return sorted.map((pred) => {
      resolved++;
      if (pred.status === 'WIN') wins++;
      return {
        issueNumber: pred.issueNumber.slice(-4), // Last 4 digits
        winRate: Number(((wins / resolved) * 100).toFixed(1)),
        wins,
        losses: resolved - wins
      };
    });
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-gray-600 font-mono text-[10px] uppercase text-center tracking-widest border border-dashed border-[#2d2d33] rounded-lg">
        Awaiting resolved<br/>predictions
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
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
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1c1c24', border: '1px solid #2d2d33', borderRadius: '0.5rem', color: '#e2e2e7', fontSize: '12px', fontFamily: 'monospace' }}
            itemStyle={{ color: '#10b981' }}
            cursor={{ stroke: '#2d2d33', strokeWidth: 1, strokeDasharray: '4 4' }}
            formatter={(value: number) => [`${value}%`, 'Win Rate']}
            labelFormatter={(label) => `Issue ...${label}`}
          />
          <Line 
            type="stepAfter" 
            dataKey="winRate" 
            stroke="#10b981" 
            strokeWidth={2}
            activeDot={{ r: 6, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
            dot={{ r: 3, fill: '#111116', stroke: '#10b981', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
