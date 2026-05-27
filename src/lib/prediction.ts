import { LotteryResult } from '../types';

export function getNextIssue(current: string): string {
  if (!current) return "WAITING...";
  try {
    if (/^\d+$/.test(current)) {
      return String(BigInt(current) + 1n).padStart(current.length, '0');
    }
    const match = current.match(/^(.*?)(\d+)$/);
    if (match) {
      const nextNum = String(BigInt(match[2]) + 1n).padStart(match[2].length, '0');
      return match[1] + nextNum;
    }
    return "WAITING...";
  } catch {
    return "WAITING...";
  }
}

export function generatePrediction(data: LotteryResult[]) {
  if (data.length === 0) return null;
  const freq: Record<string, number> = {};
  for (let i = 0; i <= 9; i++) {
    freq[i.toString()] = 0;
  }
  
  data.forEach(item => {
    const num = String(item.number).trim();
    if (freq[num] !== undefined) {
      freq[num]++;
    }
  });

  const sum = data.reduce((acc, curr) => acc + (parseInt(curr.number, 10) || 0), 0);
  const theory = sum % 2 === 0 ? 'trend' : 'due';

  const entries = Object.entries(freq);
  if (theory === 'trend') {
    entries.sort((a, b) => b[1] - a[1]);
  } else {
    entries.sort((a, b) => a[1] - b[1]);
  }

  const targetFreq = entries[0][1];
  const candidates = entries.filter(e => e[1] === targetFreq).map(e => parseInt(e[0], 10));
  
  let predictedNumber = candidates[Math.floor(Math.random() * candidates.length)];
  if (isNaN(predictedNumber)) {
    predictedNumber = Math.floor(Math.random() * 10);
  }

  const pColours = predictedNumber % 2 === 0 ? ['red'] : ['green'];
  if (predictedNumber === 0 || predictedNumber === 5) pColours.push('violet');

  const baseConfidence = 85;
  const confidenceModifier = Math.floor(Math.random() * 140) / 10;
  
  return {
    number: predictedNumber,
    confidence: Math.min(99.9, baseConfidence + confidenceModifier),
    colours: pColours,
    isSmall: predictedNumber < 5
  };
}
