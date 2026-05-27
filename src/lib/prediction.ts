import { LotteryResult, PredictionAlgorithm } from '../types';

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

export function generatePrediction(data: LotteryResult[], algorithm: PredictionAlgorithm = 'Frequency') {
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

  let predictedNumber = 0;

  if (algorithm === 'Moving Average') {
    const last3 = data.slice(0, 3).map(item => parseInt(item.number, 10) || 0);
    const avg = last3.reduce((a, b) => a + b, 0) / last3.length;
    predictedNumber = Math.round(avg);
  } else if (algorithm === 'Pattern Recognition') {
    // A simple pattern check (alternating parity)
    const lastNum = parseInt(data[0].number, 10) || 0;
    const isEven = lastNum % 2 === 0;
    // Predict opposite parity
    const candidates = isEven ? [1, 3, 5, 7, 9] : [0, 2, 4, 6, 8];
    predictedNumber = candidates[Math.floor(Math.random() * candidates.length)];
  } else if (algorithm === 'Logic Pattern') {
    // Basic Markov chain: find what usually follows the last observed number
    const lastNum = parseInt(data[0].number, 10) || 0;
    const follows: number[] = [];
    for (let i = data.length - 1; i > 0; i--) {
      if ((parseInt(data[i].number, 10) || 0) === lastNum) {
        follows.push(parseInt(data[i - 1].number, 10) || 0);
      }
    }
    
    if (follows.length > 0) {
      // Find the most frequent follower
      const followerFreq = follows.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {} as Record<number, number>);
      
      const sortedFollowers = Object.entries(followerFreq).sort((a, b) => b[1] - a[1]);
      predictedNumber = parseInt(sortedFollowers[0][0], 10);
    } else {
      predictedNumber = Math.floor(Math.random() * 10);
    }
  } else {
    // Frequency (Default)
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
    
    predictedNumber = candidates[Math.floor(Math.random() * candidates.length)];
  }

  if (isNaN(predictedNumber) || predictedNumber < 0 || predictedNumber > 9) {
    predictedNumber = Math.floor(Math.random() * 10);
  }

  const pColours = predictedNumber % 2 === 0 ? ['red'] : ['green'];
  if (predictedNumber === 0 || predictedNumber === 5) pColours.push('violet');

  const baseConfidence = algorithm === 'Logic Pattern' ? 90 : algorithm === 'Moving Average' ? 75 : algorithm === 'Pattern Recognition' ? 80 : 85;
  const confidenceModifier = Math.floor(Math.random() * 140) / 10;
  
  return {
    number: predictedNumber,
    confidence: Math.min(99.9, baseConfidence + confidenceModifier),
    colours: pColours,
    isSmall: predictedNumber < 5
  };
}
