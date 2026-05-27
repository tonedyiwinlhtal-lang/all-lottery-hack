import { motion } from 'motion/react';
import { TrackedPrediction, Provider } from '../types';
import { cn } from '../lib/utils';
import { ThemeColors } from '../lib/theme';

interface PredictionHistoryTableProps {
  data: TrackedPrediction[];
  provider: Provider;
  theme: ThemeColors;
}

export function PredictionHistoryTable({ data, provider, theme }: PredictionHistoryTableProps) {
  const filteredData = data.filter(p => p.provider === provider);

  return (
    <div className="w-full h-full">
      <table className="w-full text-left">
        <thead className="text-[10px] text-gray-500 uppercase border-b border-[#2d2d33] bg-[#111116] sticky top-0 z-10">
          <tr>
            <th className="px-6 py-3 font-bold">Issue Number</th>
            <th className="px-6 py-3 font-bold text-center">Prediction</th>
            <th className="px-6 py-3 font-bold text-center">Result</th>
            <th className="px-6 py-3 font-bold text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#23232a] text-xs font-mono">
          {filteredData.map((pred, idx) => (
            <motion.tr 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              key={pred.issueNumber} 
              className="hover:bg-white/5 transition-colors group"
            >
              <td className="px-6 py-3 text-gray-300">
                {pred.issueNumber}
              </td>
              <td className={cn(
                "px-6 py-3 font-bold text-center",
                pred.isSmall ? "text-gray-300" : theme.textAccentLight
              )}>
                {pred.isSmall ? 'SMALL' : 'BIG'} <span className="text-gray-500 text-[10px] ml-1">({pred.confidence.toFixed(1)}%)</span>
              </td>
              <td className="px-6 py-3 text-center text-gray-400 text-lg font-bold">
                {pred.actualNumber !== undefined ? pred.actualNumber.toString() : '-'}
              </td>
              <td className="px-6 py-3 text-center font-sans tracking-wider flex justify-center items-center h-full">
                {pred.status === 'WIN' ? (
                  <span className="text-green-500 bg-green-500/10 px-2 py-1 rounded border border-green-500/20 text-[10px] font-bold block w-16">WIN</span>
                ) : pred.status === 'LOSE' ? (
                  <span className="text-red-500 bg-red-500/10 px-2 py-1 rounded border border-red-500/20 text-[10px] font-bold block w-16">LOSE</span>
                ) : (
                  <span className="text-amber-500 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 text-[10px] font-bold block w-16 animate-pulse">PENDING</span>
                )}
              </td>
            </motion.tr>
          ))}
          {filteredData.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-gray-500 font-sans">
                Awaiting sequence initialization...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
