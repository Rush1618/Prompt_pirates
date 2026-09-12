"use client";

import { useState, useMemo, useEffect } from "react";
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

  const encryptedPreview = useMemo(
    () => caesarShift(plaintextToEncrypt.toUpperCase(), encryptShift),
    [plaintextToEncrypt, encryptShift]
  );

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
    setCiphertextInput(encryptedPreview);
    setActiveShift(encryptShift);
    nauticalAudio.playChime();
    
    // Scroll to the analyzer section smoothly
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleLoadPreset = (text: string, shift: number) => {
    setPlaintextToEncrypt(text);
    setEncryptShift(shift);
    const encrypted = caesarShift(text.toUpperCase(), shift);
    setCiphertextInput(encrypted);
    setActiveShift(shift);
    nauticalAudio.playChime();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="p-10 md:p-14 max-w-[90rem] mx-auto space-y-12 md:space-y-16">
      <BackButton />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-8">
        <div>
          <div className="flex items-center gap-3 text-amber-500 text-sm font-mono tracking-wider uppercase mb-2">
            <Zap className="w-5 h-5" /> Cryptanalysis & Cipher Workshop
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-amber-100 tracking-wide">
            Admiralty Codebreaker & Cipher Encrypter
          </h1>
          <p className="text-slate-400 text-base mt-3 max-w-3xl leading-relaxed">
            Encrypt plaintext dispatches, perform letter frequency analysis, run Caesar brute-force solvers, and evaluate Index of Coincidence.
          </p>
        </div>
        <div className="hidden md:block w-24 h-24 relative opacity-80">
          <CompassRose ringColor="#d97706" arrowColor="#f59e0b" />
        </div>
      </div>

      {/* Quick Encrypter Banner Panel */}
      <div className="bg-slate-900/80 border border-amber-900/40 rounded-2xl p-8 md:p-12 backdrop-blur-md space-y-10 shadow-2xl">
        <div className="flex items-center justify-between border-b border-amber-900/30 pb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-amber-200 flex items-center gap-3">
              <Lock className="w-6 h-6 text-amber-500" /> Interactive Cipher Encrypter
            </h2>
            <p className="text-slate-400 text-sm mt-2 max-w-2xl leading-relaxed">
              Type any plain text message or order below, choose a Caesar key shift (+1 to +25), and click Encrypt to load it directly into the Codebreaker engine.
            </p>
          </div>
          <span className="text-xs font-mono text-amber-400 border border-amber-900/50 bg-amber-950/40 px-3 py-1 rounded">
            Caesar Shift Engine
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch">
          {/* Plaintext Textarea Input */}
          <div className="space-y-4 lg:col-span-5 flex flex-col">
            <label className="text-sm font-mono text-amber-300 uppercase tracking-wider font-bold flex items-center justify-between">
              <span>Plaintext Message</span>
            </label>
            <textarea
              rows={6}
              value={plaintextToEncrypt}
              onChange={(e) => setPlaintextToEncrypt(e.target.value)}
              placeholder="Type your secret message here (e.g. TREASURE BURIED AT PORT ROYAL VAULT)..."
              className="w-full flex-1 bg-slate-950 border border-amber-900/40 rounded-xl p-5 text-amber-100 font-mono text-base focus:outline-none focus:border-amber-500 leading-relaxed shadow-inner resize-none"
            />
          </div>

          {/* Shift Key Selector & Live Preview */}
          <div className="space-y-6 lg:col-span-7 bg-slate-950/80 border border-amber-900/40 p-6 md:p-8 rounded-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm font-mono">
                <span className="text-slate-300 uppercase font-bold flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-500" /> Select Key Shift:
                </span>
                <span className="text-amber-400 font-serif text-2xl font-bold">+{encryptShift}</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                value={encryptShift}
                onChange={(e) => setEncryptShift(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-3 bg-slate-900 rounded-lg"
              />
            </div>

            <div className="space-y-3 mt-6">
              <label className="text-sm font-mono text-amber-300 uppercase tracking-wider font-bold">
                Live Ciphertext Preview
              </label>
              <div className="w-full bg-slate-900 border border-amber-900/30 rounded-xl p-5 text-amber-400 font-mono text-base leading-relaxed shadow-inner break-words min-h-[5rem]">
                {encryptedPreview || "Waiting for input..."}
              </div>
            </div>

            <button
              type="button"
              onClick={handleEncryptAndLoad}
              className="mt-6 w-full py-4 md:py-5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold font-mono text-sm uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(217,119,6,0.3)] hover:shadow-[0_0_30px_rgba(217,119,6,0.5)] flex items-center justify-center gap-3 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="w-5 h-5 text-slate-950" /> Encrypt & Send to Codebreaker
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex flex-wrap items-center gap-4 pt-6 border-t border-amber-900/20 mt-4">
          <span className="text-sm font-mono text-slate-400 font-bold uppercase tracking-wide">Quick Preset Dispatches:</span>
          <button
            type="button"
            onClick={() => handleLoadPreset("ATTACK PORT ROYAL AT 0500 DAWN WITH 4 CANNON SQUADRONS", 3)}
            className="px-4 py-2 bg-slate-950 hover:bg-amber-950/40 border border-amber-900/40 hover:border-amber-500 text-amber-300 font-mono text-sm rounded-xl transition-all cursor-pointer shadow-sm"
          >
            🏴‍☠️ Port Royal Raid 0500 (+3)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset("SAIL FOR TORTUGA COVE AT LATITUDE 21N LONGITUDE 72W", 7)}
            className="px-4 py-2 bg-slate-950 hover:bg-amber-950/40 border border-amber-900/40 hover:border-amber-500 text-amber-300 font-mono text-sm rounded-xl transition-all cursor-pointer shadow-sm"
          >
            🦜 Tortuga 21N 72W (+7)
          </button>
          <button
            type="button"
            onClick={() => handleLoadPreset("FIFTEEN MEN ON DEAD MANS CHEST 15 BOTTLES OF RUM IN 1703", 13)}
            className="px-4 py-2 bg-slate-950 hover:bg-amber-950/40 border border-amber-900/40 hover:border-amber-500 text-amber-300 font-mono text-sm rounded-xl transition-all cursor-pointer shadow-sm"
          >
            ⚓ Corsair Shanty 1703 (+13 ROT13)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 mt-12">
        {/* Column 1: Input Ciphertext */}
        <div className="lg:col-span-5 space-y-8 bg-slate-900/60 border border-amber-900/30 rounded-2xl p-8 md:p-10 backdrop-blur-md shadow-xl">
          <h2 className="text-2xl font-serif font-semibold text-amber-200 flex items-center gap-3">
            <Search className="w-6 h-6 text-amber-500" /> Intercepted Ciphertext
          </h2>

          <textarea
            rows={5}
            value={ciphertextInput}
            onChange={(e) => setCiphertextInput(e.target.value)}
            placeholder="Paste intercepted naval order or shanty ciphertext..."
            className="w-full bg-slate-950 border border-amber-900/40 rounded-xl p-5 text-amber-100 font-mono text-base focus:outline-none focus:border-amber-500 leading-relaxed shadow-inner resize-none"
          />

          {/* Manual Caesar Shift Slider */}
          <div className="bg-slate-950 border border-amber-900/40 p-6 rounded-xl space-y-5 shadow-sm">
            <div className="flex justify-between items-center text-sm font-mono">
              <span className="text-slate-400 uppercase font-bold flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" /> Shift Key Dial
              </span>
              <span className="font-bold text-amber-400 font-serif text-xl">+{activeShift}</span>
            </div>
            <input
              type="range"
              min="1"
              max="25"
              value={activeShift}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-3 bg-slate-900 rounded-lg"
            />
            <div className="p-4 bg-slate-900 rounded-lg border border-amber-900/30 font-mono text-base text-amber-200 break-words shadow-inner min-h-[4rem]">
              {manualDecrypted || "Awaiting signal..."}
            </div>
          </div>

          {/* IoC Metrics Box */}
          <div className="bg-slate-950 border border-amber-900/40 p-6 rounded-xl space-y-3 shadow-sm">
            <div className="text-sm font-mono text-slate-400 uppercase tracking-wider font-bold">
              Index of Coincidence (IoC)
            </div>
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-4xl font-bold text-amber-400">
                {iocResult.ioc}
              </span>
              <span className="text-sm font-mono px-3 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                {iocResult.classification}
              </span>
            </div>
            <p className="text-xs font-mono text-slate-400 leading-relaxed pt-2">
              * English text IoC ~ 0.0667. Caesar / Substitution ~ 0.06+. Random text / Polyalphabetic ~ 0.038.
            </p>
          </div>
        </div>

        {/* Column 2 & 3: Frequency Chart & Caesar Solver */}
        <div className="lg:col-span-7 space-y-8 bg-slate-900/60 border border-amber-900/30 rounded-2xl p-8 md:p-10 backdrop-blur-md shadow-xl">
          <h2 className="text-2xl font-serif font-semibold text-amber-200">
            Letter Frequency Analysis vs Standard English
          </h2>

          {/* Frequency Recharts Bar Chart */}
          <div className="h-72 w-full bg-slate-950 p-4 rounded-xl border border-amber-900/40 shadow-inner">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={freqData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis dataKey="letter" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#d97706", fontSize: 14, borderRadius: '8px' }}
                />
                <Bar dataKey="frequencyPct" name="Ciphertext %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="englishPct" name="Standard English %" fill="#38bdf8" radius={[4, 4, 0, 0]} opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Caesar Brute-Force Results Table */}
          <div className="space-y-4 border-t border-amber-900/30 pt-8">
            <h3 className="text-lg font-serif font-bold text-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <span>Caesar Shift Brute-Force Results (Top 5 Ranked)</span>
              <span className="text-sm font-mono text-emerald-400">Lowest Score = Best Match</span>
            </h3>

            <div className="space-y-3 max-h-[22rem] overflow-y-auto pr-2 custom-scrollbar">
              {caesarResults.slice(0, 5).map((r) => (
                <div
                  key={r.shift}
                  onClick={() => handleSliderChange(r.shift)}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-sm cursor-pointer transition-all shadow-sm ${
                    r.isLikely || activeShift === r.shift
                      ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200 transform scale-[1.01]"
                      : "bg-slate-950 border-amber-900/30 text-slate-300 hover:border-amber-700 hover:bg-amber-950/20"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-amber-400 text-lg whitespace-nowrap">Shift +{r.shift}</span>
                    <span className="text-slate-200 line-clamp-1 break-all">{r.decryptedText}</span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 min-w-[120px]">
                    <span className="text-slate-400 text-xs">Score: <span className="text-slate-300 font-bold">{r.chiSquaredScore.toFixed(1)}</span></span>
                    {r.isLikely && (
                      <span className="text-[10px] bg-emerald-900 text-emerald-300 font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                        Best Match
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
