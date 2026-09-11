"use client";

import { useState, useMemo } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import { Search, Zap, RotateCcw, AlertTriangle, CheckCircle2, Sliders } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  analyzeLetterFrequency,
  bruteForceCaesar,
  calculateIndexOfCoincidence,
  caesarShift,
} from "@/lib/crypto";
import { nauticalAudio } from "@/lib/audio";

export default function CrackerPage() {
  const [ciphertextInput, setCiphertextInput] = useState(
    "KRFV HBR SKDS ZLWK D GUUNHQ VDLORU (SHIFT 3 CAESAR CIPHER DEMO)"
  );
  const [activeShift, setActiveShift] = useState(3);

  // Live Crypto Analysis Computations
  const freqData = useMemo(() => analyzeLetterFrequency(ciphertextInput), [ciphertextInput]);
  const caesarResults = useMemo(() => bruteForceCaesar(ciphertextInput), [ciphertextInput]);
  const iocResult = useMemo(() => calculateIndexOfCoincidence(ciphertextInput), [ciphertextInput]);

  // Live manual shift preview
  const manualDecrypted = useMemo(
    () => caesarShift(ciphertextInput, 26 - activeShift),
    [ciphertextInput, activeShift]
  );

  const handleSliderChange = (newShift: number) => {
    setActiveShift(newShift);
    nauticalAudio.playClick();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-sm font-mono tracking-wider uppercase mb-1">
            <Zap className="w-4 h-4" /> Cryptanalysis Workbench
          </div>
          <h1 className="text-3xl font-bold font-serif text-amber-100">
            Admiralty Codebreaker — Cipher Cracker
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Letter frequency analysis, Caesar brute-force solver, and Vigenère Index of Coincidence evaluator.
          </p>
        </div>
        <div className="w-16 h-16 relative opacity-80">
          <CompassRose ringColor="#d97706" arrowColor="#f59e0b" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Input Ciphertext */}
        <div className="space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
          <h2 className="text-lg font-serif font-semibold text-amber-200 flex items-center gap-2">
            <Search className="w-5 h-5 text-amber-500" /> Intercepted Ciphertext Input
          </h2>

          <textarea
            rows={5}
            value={ciphertextInput}
            onChange={(e) => setCiphertextInput(e.target.value)}
            placeholder="Paste intercepted naval order or shanty ciphertext..."
            className="w-full bg-slate-950 border border-amber-900/40 rounded-lg p-3 text-amber-100 font-mono text-xs focus:outline-none focus:border-amber-500"
          />

          {/* Manual Caesar Shift Slider */}
          <div className="bg-slate-950 border border-amber-900/40 p-4 rounded-lg space-y-3">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-slate-400 uppercase flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-amber-500" /> Shift Key Dial
              </span>
              <span className="font-bold text-amber-400 font-serif text-sm">+{activeShift}</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={activeShift}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="p-2.5 bg-slate-900 rounded border border-amber-900/30 font-mono text-xs text-amber-200 break-words">
              {manualDecrypted}
            </div>
          </div>

          {/* IoC Metrics Box */}
          <div className="bg-slate-950 border border-amber-900/40 p-4 rounded-lg space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Index of Coincidence (IoC)
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-2xl font-bold text-amber-400">
                {iocResult.ioc}
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                {iocResult.classification}
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              * English text IoC ~ 0.0667. Caesar / Substitution ~ 0.06+. Random text / Polyalphabetic ~ 0.038.
            </p>
          </div>
        </div>

        {/* Column 2 & 3: Frequency Chart & Caesar Solver */}
        <div className="lg:col-span-2 space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
          <h2 className="text-lg font-serif font-semibold text-amber-200">
            Letter Frequency Analysis vs Standard English
          </h2>

          {/* Frequency Recharts Bar Chart */}
          <div className="h-60 w-full bg-slate-950 p-2 rounded-lg border border-amber-900/40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={freqData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="letter" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#d97706", fontSize: 12 }}
                />
                <Bar dataKey="frequencyPct" name="Ciphertext %" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                <Bar dataKey="englishPct" name="Standard English %" fill="#38bdf8" radius={[2, 2, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Caesar Brute-Force Results Table */}
          <div className="space-y-3 border-t border-amber-900/30 pt-4">
            <h3 className="text-sm font-serif font-bold text-amber-200 flex items-center justify-between">
              <span>Caesar Shift Brute-Force Results (Top 5 Ranked by Chi-Squared)</span>
              <span className="text-xs font-mono text-emerald-400">Lowest Score = Best Match</span>
            </h3>

            <div className="space-y-2 max-h-56 overflow-y-auto">
              {caesarResults.slice(0, 5).map((r) => (
                <div
                  key={r.shift}
                  onClick={() => handleSliderChange(r.shift)}
                  className={`p-3 rounded-lg border flex items-center justify-between font-mono text-xs cursor-pointer transition-all ${
                    r.isLikely || activeShift === r.shift
                      ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200"
                      : "bg-slate-950 border-amber-900/30 text-slate-300 hover:border-amber-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-amber-400">Shift +{r.shift}</span>
                    <span className="text-slate-200">{r.decryptedText.substring(0, 50)}...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-[11px]">Score: {r.chiSquaredScore.toFixed(1)}</span>
                    {r.isLikely && (
                      <span className="text-[10px] bg-emerald-900 text-emerald-300 font-bold px-2 py-0.5 rounded">
                        MOST LIKELY
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
