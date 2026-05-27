import { LotteryResult } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface HistoryTableProps {
  data: LotteryResult[];
}

export function HistoryTable({ data }: HistoryTableProps) {
  return (
    <div className="w-full h-full">
      <table className="w-full text-left">
        <thead className="text-[10px] text-gray-500 uppercase border-b border-[#2d2d33] bg-[#111116] sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 font-bold">Issue Number</th>
            <th className="px-6 py-3 font-bold text-center">Result</th>
            <th className="px-6 py-3 font-bold text-center">Color</th>
            <th className="px-6 py-3 font-bold text-right">Premium</th>
            <th className="px-6 py-3 font-bold text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#23232a] text-xs font-mono">
          {data.map((result, idx) => {
            const colours = result.colour.split(',');
            return (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                key={result.issueNumber} 
                className="hover:bg-white/5 transition-colors group"
              >
                <td className="px-6 py-3 text-gray-300">
                  {result.issueNumber}
                </td>
                <td className={cn(
                  "px-6 py-3 font-bold text-center text-lg",
                  colours.includes('red') ? "text-red-500" : 
                  colours.includes('green') ? "text-green-500" : "text-violet-500"
                )}>
                  {result.number}
                </td>
                <td className="px-6 py-3">
                  <div className="flex justify-center gap-1">
                    {colours.map(c => (
                      <div key={c} className={cn(
                        "w-3 h-3 rounded-full",
                        c === 'red' && "bg-red-500",
                        c === 'green' && "bg-green-500",
                        c === 'violet' && "bg-violet-500"
                      )}></div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-3 text-right text-gray-400">
                  {parseFloat(result.premium).toFixed(2)}
                </td>
                <td className="px-6 py-3 text-center text-green-500 font-sans text-[10px] tracking-wider">
                  ● CONFIRMED
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
