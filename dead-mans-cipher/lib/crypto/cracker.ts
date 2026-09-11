/**
 * Dead Man's Cipher — Interactive Cipher Cracker
 * Frequency Analysis, Caesar Brute-Force, Vigenère IoC Estimator
 */

// Standard English letter frequencies (%)
export const ENGLISH_FREQ: Record<string, number> = {
  A: 8.17, B: 1.49, C: 2.78, D: 4.25, E: 12.70, F: 2.23, G: 2.01,
  H: 6.09, I: 6.97, J: 0.15, K: 0.77, L: 4.03, M: 2.41, N: 6.75,
  O: 7.51, P: 1.93, Q: 0.10, R: 5.98, S: 6.33, T: 9.06, U: 2.76,
  V: 0.98, W: 2.36, X: 0.15, Y: 1.97, Z: 0.07,
};

export interface LetterCount {
  letter: string;
  count: number;
  frequencyPct: number;
  englishPct: number;
}

export interface CaesarShiftResult {
  shift: number;
  decryptedText: string;
  chiSquaredScore: number;
  isLikely: boolean;
}

/**
 * Calculate letter frequency distribution for a given ciphertext
 */
export function analyzeLetterFrequency(text: string): LetterCount[] {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
  const total = clean.length || 1;
  const counts: Record<string, number> = {};

  for (let i = 65; i <= 90; i++) {
    counts[String.fromCharCode(i)] = 0;
  }

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    counts[char] = (counts[char] || 0) + 1;
  }

  return Object.keys(counts).map((letter) => {
    const count = counts[letter];
    const frequencyPct = parseFloat(((count / total) * 100).toFixed(2));
    const englishPct = ENGLISH_FREQ[letter] || 0;
    return {
      letter,
      count,
      frequencyPct,
      englishPct,
    };
  });
}

/**
 * Calculate Chi-Squared statistic between text letter frequencies and English frequencies
 */
export function calculateChiSquared(text: string): number {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
  const len = clean.length;
  if (len === 0) return 9999;

  const freqs = analyzeLetterFrequency(clean);
  let chiSquared = 0;

  for (const item of freqs) {
    const observed = item.count;
    const expected = (item.englishPct / 100) * len;
    if (expected > 0) {
      chiSquared += Math.pow(observed - expected, 2) / expected;
    }
  }

  return chiSquared;
}

/**
 * Perform Caesar Cipher Shift (1 to 25)
 */
export function caesarShift(text: string, shift: number): string {
  const letterShift = ((shift % 26) + 26) % 26;
  const digitShift = ((shift % 10) + 10) % 10;

  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + letterShift) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + letterShift) % 26) + 97);
      }
      // Digit Encryption (0-9 modulo 10)
      if (code >= 48 && code <= 57) {
        return String.fromCharCode(((code - 48 + digitShift) % 10) + 48);
      }
      return char;
    })
    .join("");
}

/**
 * Run Caesar Cipher Brute-Force Cracker across all 25 shifts
 */
export function bruteForceCaesar(ciphertext: string): CaesarShiftResult[] {
  const results: CaesarShiftResult[] = [];

  for (let shift = 1; shift <= 25; shift++) {
    // Decrypting shift K means shifting back by 26 - shift
    const decryptedText = caesarShift(ciphertext, 26 - shift);
    const score = calculateChiSquared(decryptedText);

    results.push({
      shift,
      decryptedText,
      chiSquaredScore: score,
      isLikely: false,
    });
  }

  // Sort by lowest Chi-Squared score (closest match to English)
  results.sort((a, b) => a.chiSquaredScore - b.chiSquaredScore);
  if (results.length > 0) {
    results[0].isLikely = true;
  }

  return results;
}

/**
 * Calculate Index of Coincidence (IoC) to detect Vigenère key length / polyalphabeticity
 * English IoC ~ 0.0667, Random text ~ 0.0385
 */
export function calculateIndexOfCoincidence(text: string): {
  ioc: number;
  classification: "MONOALPHABETIC" | "POLYALPHABETIC" | "RANDOM_OR_HIGH_ENTROPY";
} {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
  const N = clean.length;
  if (N <= 1) {
    return { ioc: 0, classification: "RANDOM_OR_HIGH_ENTROPY" };
  }

  const freqs = analyzeLetterFrequency(clean);
  let sum = 0;
  for (const item of freqs) {
    const f = item.count;
    sum += f * (f - 1);
  }

  const ioc = sum / (N * (N - 1));

  let classification: "MONOALPHABETIC" | "POLYALPHABETIC" | "RANDOM_OR_HIGH_ENTROPY";
  if (ioc >= 0.060) {
    classification = "MONOALPHABETIC";
  } else if (ioc >= 0.045) {
    classification = "POLYALPHABETIC";
  } else {
    classification = "RANDOM_OR_HIGH_ENTROPY";
  }

  return { ioc: parseFloat(ioc.toFixed(4)), classification };
}
