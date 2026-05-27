import { useState, useEffect } from 'react';
import { LotteryResult, PredictionAlgorithm } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Target, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { getNextIssue } from '../lib/prediction';
import { ThemeColors } from '../lib/theme';

const ALGORITHMS: PredictionAlgorithm[] = ['Frequency', 'Moving Average', 'Pattern Recognition', 'Logic Pattern'];

interface PredictionEngineProps {
  data: LotteryResult[];
  prediction: { number: number; confidence: number; colours: string[], isSmall: boolean } | null;
  isPredicting: boolean;
  timeLeft: number;
  algorithm: PredictionAlgorithm;
  onAlgorithmChange: (alg: PredictionAlgorithm) => void;
  theme: ThemeColors;
}

export function PredictionEngine({ data, prediction, isPredicting, timeLeft, algorithm, onAlgorithmChange, theme }: PredictionEngineProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const latestIssue = data.length > 0 ? getNextIssue(data[0].issueNumber) : "WAITING...";

  return (
    <div className={cn("bg-gradient-to-br from-[#1c1c24] to-[#111116] rounded-2xl border border-white/5 p-8 relative overflow-hidden shadow-2xl h-full flex flex-col justify-center min-h-[300px]", theme.shadowSoft)}>
      <div className="absolute top-0 right-0 p-4 flex gap-2 z-10">
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="px-3 py-1 bg-gray-500/10 hover:bg-gray-500/20 transition-colors border border-gray-500/30 text-gray-400 text-xs rounded-full font-mono flex items-center gap-1"
          >
            {algorithm}
            <ChevronDown className="w-3 h-3" />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1c1c24] border border-[#2d2d33] rounded-lg shadow-xl overflow-hidden py-1 z-50">
              {ALGORITHMS.map(alg => (
                <button
                  key={alg}
                  onClick={() => {
                    onAlgorithmChange(alg);
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-xs font-mono transition-colors",
                    alg === algorithm ? cn(theme.textAccentLight, theme.bgLight) : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {alg}
                </button>
              ))}
            </div>
          )}
        </div>
        <span className={cn("px-3 py-1 border text-xs rounded-full font-mono", theme.bgLight, theme.borderSoft, theme.textAccentLight)}>
          ISSUE: {latestIssue}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {isPredicting ? (
          <motion.div 
            key="predicting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-4 text-center py-12"
          >
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className={cn("absolute h-full w-full animate-spin rounded-full border-b-2 border-l-2", theme.borderActive)}></div>
              <div className={cn("absolute h-12 w-12 animate-spin rounded-full border-r-2 border-t-2 opacity-70", theme.spinnerSecondary)} style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              <Target className={cn("h-6 w-6 animate-pulse", theme.textAccentLight)} />
            </div>
            <div>
              <p className={cn("text-lg font-medium tracking-wide", theme.textAccentLight)}>CALCULATING PROBABILITIES</p>
              <p className="text-sm font-mono text-gray-500 mt-2">Processing real-time sequence data...</p>
            </div>
          </motion.div>
        ) : prediction ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col"
          >
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Algorithm Confidence</span>
            
            <div className="flex items-baseline gap-4 mb-8">
              <h3 className="text-4xl sm:text-6xl font-light tracking-tighter text-white">
                PREDICTION: <span className={cn(
                  "font-bold",
                  prediction.isSmall ? "text-[#e2e2e7]" : theme.textAccentLight 
                )}>{prediction.isSmall ? 'SMALL' : 'BIG'}</span>
              </h3>
              <span className="text-xl sm:text-2xl font-mono text-gray-600">/ {prediction.confidence.toFixed(1)}%</span>
            </div>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 border-t border-[#2d2d33] pt-8">
              <div>
                <span className="block text-[10px] text-gray-500 uppercase mb-2">Primary Digit</span>
                <span className="text-2xl sm:text-3xl font-bold font-mono text-[#e2e2e7]">{prediction.number}</span>
              </div>
              
              <div>
                <span className="block text-[10px] text-gray-500 uppercase mb-2">Target Color</span>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded-full",
                    prediction.colours[0] === 'red' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : 
                    prediction.colours[0] === 'green' ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" : 
                    "bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]"
                  )}></div>
                  <span className="text-lg font-semibold uppercase text-white">
                    {prediction.colours.join(' & ')}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <span className="block text-[10px] text-gray-500 uppercase mb-2">Next Time</span>
                <span className={cn(
                  "text-3xl font-bold font-mono",
                  timeLeft <= 5 ? "text-red-500 animate-pulse" : theme.textAccentLight
                )}>
                  00:{timeLeft.toString().padStart(2, '0')}
                </span>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-gray-500 py-12">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>Insufficient data for prediction.</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
