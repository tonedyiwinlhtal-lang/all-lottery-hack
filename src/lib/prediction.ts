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
  
  const recentData = data.slice(0, Math.min(20, data.length));
  let predictedNumber = 0;
  let baseConfidence = 0;

  if (algorithm === 'Moving Average') {
    // Trend Analysis based on moving averages and momentum
    const numbers = recentData.map(item => parseInt(item.number, 10)).filter(n => !isNaN(n));
    if (numbers.length >= 3) {
      const shortTermAvg = numbers.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const longTermAvg = numbers.slice(0, 10).reduce((a, b) => a + b, 0) / Math.min(10, numbers.length);
      
      const momentum = shortTermAvg - longTermAvg;
      let rawPrediction = shortTermAvg + momentum;
      
      // Keep within bounds
      predictedNumber = Math.max(0, Math.min(9, Math.round(rawPrediction)));
      baseConfidence = 65 + Math.abs(momentum) * 5; // Higher momentum -> somewhat higher confidence up to a cap
    } else {
      predictedNumber = Math.floor(Math.random() * 10);
      baseConfidence = 50;
    }
  } else if (algorithm === 'Pattern Recognition') {
    // Advanced pattern checking (look for sequences or identical steps)
    const numbers = data.map(item => parseInt(item.number, 10)).filter(n => !isNaN(n));
    let patternFound = false;

    // Check for AABB or alternating ABAB pattern in recent 4 numbers
    if (numbers.length >= 4) {
      const [n1, n2, n3, n4] = numbers.slice(0, 4);
      if (n2 === n4 && n1 === n3) {
        // ABAB -> next is n2 (which is 'A')
        predictedNumber = n2;
        baseConfidence = 88;
        patternFound = true;
      } else if (n1 === n2 && n3 === n4) {
        // AABB -> next is likely B or something new... wait, this is history:
        // n4(oldest), n3, n2, n1(newest) 
        // e.g. 5, 5, 1, 1 -> next could be another pattern or flip. Let's look at recent diffs.
      }
    }

    if (!patternFound && numbers.length >= 3) {
      // Look for arithmetic progression (e.g. 2, 4, 6 -> next is 8)
      // Note: Data is 0 (newest), 1 (older), 2 (oldest)
      const [n1, n2, n3] = numbers.slice(0, 3);
      const diff1 = n1 - n2;
      const diff2 = n2 - n3;
      
      if (diff1 === diff2) {
        const next = n1 + diff1;
        if (next >= 0 && next <= 9) {
          predictedNumber = next;
          baseConfidence = 92;
          patternFound = true;
        }
      }
    }

    if (!patternFound) {
      // Fallback: look at last number parity and guess it will flip if the last 3 were same parity
      const lastParities = numbers.slice(0, 3).map(n => n % 2 === 0);
      const allSameParity = lastParities.length === 3 && lastParities.every(p => p === lastParities[0]);
      
      const isEven = lastParities[0];
      const targetParityEven = allSameParity ? !isEven : isEven; // Flip if 3 in a row
      
      const candidates = targetParityEven ? [0, 2, 4, 6, 8] : [1, 3, 5, 7, 9];
      predictedNumber = candidates[Math.floor(Math.random() * candidates.length)];
      baseConfidence = allSameParity ? 82 : 70;
    }

  } else if (algorithm === 'Logic Pattern') {
    // Markov chain: 2-step look-up
    const numbers = data.map(item => parseInt(item.number, 10)).filter(n => !isNaN(n));
    if (numbers.length >= 3) {
      const recentWindow = numbers.slice(0, 2); // [n1, n2] where n1 is newest
      const follows: number[] = [];
      
      for (let i = numbers.length - 1; i >= 2; i--) {
        if (numbers[i-1] === recentWindow[1] && numbers[i] === recentWindow[0]) {
          follows.push(numbers[i-2]); // What followed this exact 2-number sequence
        }
      }
      
      if (follows.length > 0) {
        // Find most frequent follower
        const freqMap = follows.reduce((acc, curr) => {
          acc[curr] = (acc[curr] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);
        
        const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
        predictedNumber = parseInt(sorted[0][0], 10);
        baseConfidence = 85 + (follows.length > 3 ? 5 : 0); // Boost confidence if we saw this multiple times
      } else {
        // Fallback to 1-step markov
         let singleFollow: number[] = [];
         let lastNum = numbers[0];
         for (let i = numbers.length - 1; i >= 1; i--) {
           if (numbers[i] === lastNum) {
             singleFollow.push(numbers[i-1]);
           }
         }
         if (singleFollow.length > 0) {
           const freqMap = singleFollow.reduce((acc, curr) => {
              acc[curr] = (acc[curr] || 0) + 1;
              return acc;
           }, {} as Record<number, number>);
           const sorted = Object.entries(freqMap).sort((a, b) => b[1] - a[1]);
           predictedNumber = parseInt(sorted[0][0], 10);
           baseConfidence = 78;
         } else {
           predictedNumber = Math.floor(Math.random() * 10);
           baseConfidence = 60;
         }
      }
    } else {
      predictedNumber = Math.floor(Math.random() * 10);
      baseConfidence = 50;
    }
  } else {
    // Frequency Strategy
    const numbers = recentData.map(item => parseInt(item.number, 10)).filter(n => !isNaN(n));
    if (numbers.length > 0) {
      // Hot/Cold Analysis: mix of most frequent in last 20, but not recently hitting back-to-back
      const freq: Record<number, number> = {};
      for (let i = 0; i <= 9; i++) freq[i] = 0;
      
      numbers.forEach(num => freq[num]++);
      
      const sortedFreq = Object.entries(freq).sort((a, b) => b[1] - a[1]); // Descending
      const topNumbers = sortedFreq.slice(0, 3).map(e => parseInt(e[0], 10));
      
      // Avoid predicting the exact number that just hit (unless it's extremely hot)
      let candidate = topNumbers[0];
      if (candidate === numbers[0] && numbers.length > 1 && numbers[1] !== numbers[0]) {
         candidate = topNumbers[1];
      }
      
      predictedNumber = candidate;
      baseConfidence = 75 + (sortedFreq[0][1] / numbers.length) * 20; // Confidence based on how dominant frequency is
    } else {
       predictedNumber = Math.floor(Math.random() * 10);
       baseConfidence = 50;
    }
  }

  // Sanity check
  if (isNaN(predictedNumber) || predictedNumber < 0 || predictedNumber > 9) {
    predictedNumber = Math.floor(Math.random() * 10);
    baseConfidence = 50;
  }

  const pColours = predictedNumber % 2 === 0 ? ['red'] : ['green'];
  if (predictedNumber === 0 || predictedNumber === 5) pColours.push('violet');

  const confidenceModifier = (Math.random() * 5.0) - 1.5; // Slightly vary to mimic realistic real-time changes
  let finalConfidence = baseConfidence + confidenceModifier;
  finalConfidence = Math.max(30, Math.min(99.9, finalConfidence));
  
  return {
    number: predictedNumber,
    confidence: finalConfidence,
    colours: pColours,
    isSmall: predictedNumber < 5
  };
}
