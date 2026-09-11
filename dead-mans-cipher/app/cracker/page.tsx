"use client";

import { useState, useMemo } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import { BackButton } from "@/components/ui/back-button";
import { Search, Zap, RotateCcw, AlertTriangle, CheckCircle2, Sliders, Lock, Sparkles, Key } from "lucide-react";
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

  // Quick Encrypter State
  const [plaintextToEncrypt, setPlaintextToEncrypt] = useState(
    "TREASURE BURIED AT PORT ROYAL VAULT"
  );
  const [encryptShift, setEncryptShift] = useState(5);

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

  const handleEncryptAndLoad = () => {
    if (!plaintextToEncrypt.trim()) return;
    const encrypted = caesarShift(plaintextToEncrypt.toUpperCase(), encryptShift);
    setCiphertextInput(encrypted);
    setActiveShift(encryptShift);
    nauticalAudio.playChime();
  };

  const handleLoadPreset = (text: string, shift: number) => {
    setPlaintextToEncrypt(text);
    setEncryptShift(shift);
    const encrypted = caesarShift(text.toUpperCase(), shift);
    setCiphertextInput(encrypted);
    setActiveShift(shift);
    nauticalAudio.playChime();
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <BackButton />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-sm font-mono tracking-wider uppercase mb-1">
            <Zap className="w-4 h-4" /> Cryptanalysis & Cipher Workshop
          </div>
          <h1 className="text-3xl font-bold font-serif text-amber-100">
            Admiralty Codebreaker & Cipher Encrypter
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Encrypt plaintext dispatches, perform letter frequency analysis, run Caesar brute-force solvers, and evaluate Index of Coincidence.
          </p>
        </div>
        <div className="w-16 h-16 relative opacity-80">
          <CompassRose ringColor="#d97706" arrowColor="#f59e0b" />
        </div>
      </div>

      {/* Quick Encrypter Banner Panel */}
      <div className="bg-slate-900/80 border border-amber-900/40 rounded-xl p-6 md:p-8 backdrop-blur-md space-y-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-amber-900/30 pb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-amber-200 flex items-center gap-2">
              <Lock className="w-5 h-5 text-amber-500" /> Interactive Cipher Encrypter — Compose & Encrypt Plaintext
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Type any plain text message or order below, choose a Caesar key shift (+1 to +25), and click Encrypt to load it directly into the Codebreaker engine.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 border border-amber-900/50 bg-amber-950/40 px-3 py-1 rounded">
            Caesar Shift Engine
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Plaintext Textarea Input */}
          <div className="space-y-3 lg:col-span-2">
            <label className="text-xs font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center justify-between">
              <span>Plaintext Message to Encrypt</span>
              <span className="text-[11px] text-slate-400 font-normal">Supports full text, numbers & punctuation</span>
            </label>
            <textarea
              rows={4}
              value={plaintextToEncrypt}
              onChange={(e) => setPlaintextToEncrypt(e.target.value)}
              placeholder="Type your secret message here (e.g. TREASURE BURIED AT PORT ROYAL VAULT)..."
              className="w-full bg-slate-950 border border-amber-900/40 rounded-lg p-4 text-amber-100 font-mono text-sm focus:outline-none focus:border-amber-500 leading-relaxed shadow-inner"
            />
          </div>

          {/* Shift Key Selector & Action */}
          <div className="space-y-5 bg-slate-950/80 border border-amber-900/40 p-5 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-300 uppercase font-bold flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-500" /> Select Key Shift:
                </span>
                <span className="text-amber-400 font-serif text-lg font-bold">+{encryptShift}</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={encryptShift}
                onChange={(e) => setEncryptShift(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
              />
            </div>

            <button
              type="button"
              onClick={handleEncryptAndLoad}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-slate-950" /> Encrypt & Load into Codebreaker
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-amber-900/20">
          <span className="text-xs font-mono text-slate-400 font-bold uppercase">Quick Preset Dispatches:</span>
          <button
            type="button"
            onClick={() => handleLoadPreset("ATTACK PORT ROYAL AT DAWN WITH QUEEN ANNES REVENGE", 3)}
            className="px-3 py-1.5 bg-slate-950 hover:bg-amber-950/40 border border-amber-900/40 hover:border-amber-500 text-amber-300 font-mono text-xs rounded-lg transition-all cursor-pointer shadow-sm"
          >
            🏴‍☠️ Port Royal Secret (+3)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset("SAIL FOR TORTUGA COVE BEFORE THE SPANISH FLEET ARRIVES", 7)}
            className="px-3 py-1.5 bg-slate-950 hover:bg-amber-950/40 border border-amber-900/40 hover:border-amber-500 text-amber-300 font-mono text-xs rounded-lg transition-all cursor-pointer shadow-sm"
          >
            🦜 Blackbeard Orders (+7)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset("FIFTEEN MEN ON THE DEAD MANS CHEST YO HO HO AND A BOTTLE OF RUM", 13)}
            className="px-3 py-1.5 bg-slate-950 hover:bg-amber-950/40 border border-amber-900/40 hover:border-amber-500 text-amber-300 font-mono text-xs rounded-lg transition-all cursor-pointer shadow-sm"
          >
            ⚓ Corsair Shanty (+13 ROT13)
          </button>
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
