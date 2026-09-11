"use client";

import { useState, useMemo, useEffect } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import { Shield, AlertTriangle, CheckCircle2, RefreshCw, CloudRain, Sun, Wind } from "lucide-react";
import { evaluateThreatLevel, getGlobalThreatAssessment, CipherAlgorithm, KeyLifecycleState } from "@/lib/crypto";

export default function ThreatPage() {
  const [cipherAlgo, setCipherAlgo] = useState<CipherAlgorithm>("AES-256-GCM");
  const [keyState, setKeyState] = useState<KeyLifecycleState>("SAILING");
  const [hasSignature, setHasSignature] = useState(true);
  const [ageHours, setAgeHours] = useState(0.5);

  useEffect(() => {
    // Load global system threat defaults on mount
    const globalEval = getGlobalThreatAssessment();
    if (globalEval.riskTier === "CRITICAL") {
      setKeyState("BLACKSPOT");
    } else if (globalEval.riskTier === "ELEVATED") {
      setKeyState("ANCHORED");
    }
  }, []);

  const evaluation = useMemo(
    () =>
      evaluateThreatLevel({
        cipherAlgo,
        keyState: keyState === "SAILING" ? "SAILING" : keyState === "ANCHORED" ? "ANCHORED" : "BLACKSPOT",
        hasSignature,
        timestampAgeHours: ageHours,
      }),
    [cipherAlgo, keyState, hasSignature, ageHours]
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-sm font-mono tracking-wider uppercase mb-1">
            <AlertTriangle className="w-4 h-4" /> Risk Assessment Engine
          </div>
          <h1 className="text-3xl font-bold font-serif text-amber-100">
            Storm Warning — Threat Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Evaluate composite risk scores, cipher strength metrics, and active residual risk mitigations.
          </p>
        </div>
        <div className="w-16 h-16 relative opacity-80">
          <CompassRose ringColor="#d97706" arrowColor="#f59e0b" />
        </div>
      </div>

      {/* Global Storm Condition Banner */}
      <div
        className={`p-6 rounded-xl border flex items-center justify-between transition-all ${
          evaluation.riskTier === "SAFE"
            ? "bg-emerald-950/40 border-emerald-500/60 text-emerald-200"
            : evaluation.riskTier === "ELEVATED"
            ? "bg-amber-950/40 border-amber-500/60 text-amber-200"
            : "bg-rose-950/50 border-rose-500/80 text-rose-200 animate-pulse"
        }`}
      >
        <div className="flex items-center gap-4">
          {evaluation.riskTier === "SAFE" ? (
            <Sun className="w-10 h-10 text-emerald-400 shrink-0" />
          ) : evaluation.riskTier === "ELEVATED" ? (
            <Wind className="w-10 h-10 text-amber-400 shrink-0" />
          ) : (
            <CloudRain className="w-10 h-10 text-rose-400 shrink-0" />
          )}
          <div>
            <div className="text-xs font-mono uppercase tracking-widest opacity-80">
              Current Maritime Weather & Threat Condition
            </div>
            <h2 className="font-serif font-bold text-2xl tracking-wide mt-0.5">
              CONDITION: {evaluation.stormLabel}
            </h2>
            <p className="text-xs font-mono text-slate-300 mt-1">
              {evaluation.riskTier === "SAFE"
                ? "Smooth sailing. All cryptographic keys active (SAILING) with AES-256-GCM and valid Ed25519 signatures."
                : evaluation.riskTier === "ELEVATED"
                ? "Rough seas ahead. Some keys are expired/rotated or timestamps are aging."
                : "SEVERE HURRICANE WARNING! Black Spot key compromise or missing digital signatures detected!"}
            </p>
          </div>
        </div>

        <div className="text-right font-mono hidden md:block">
          <div className="text-3xl font-bold">{evaluation.overallRiskScore} / 100</div>
          <div className="text-xs uppercase opacity-75">{evaluation.riskTier} TIER</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Configuration Parameters */}
        <div className="space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
          <h2 className="text-lg font-serif font-semibold text-amber-200">
            Evaluate Risk Parameters
          </h2>

          <div className="space-y-4 font-mono text-xs">
            <div className="space-y-2">
              <label className="text-slate-400 uppercase">Cipher Algorithm</label>
              <select
                value={cipherAlgo}
                onChange={(e) => setCipherAlgo(e.target.value as CipherAlgorithm)}
                className="w-full bg-slate-950 border border-amber-900/40 rounded p-2 text-amber-200"
              >
                <option value="AES-256-GCM">AES-256-GCM (Recommended)</option>
                <option value="ChaCha20-Poly1305">ChaCha20-Poly1305 (Fallback)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 uppercase">Sender Key State</label>
              <select
                value={keyState}
                onChange={(e) => setKeyState(e.target.value as KeyLifecycleState)}
                className="w-full bg-slate-950 border border-amber-900/40 rounded p-2 text-amber-200"
              >
                <option value="SAILING">Sailing (Calm — Active & Trusted)</option>
                <option value="ANCHORED">Anchored (Rough — Expired)</option>
                <option value="BLACKSPOT">Black Spot (Severe — Compromised!)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 uppercase">Digital Signature Status</label>
              <button
                type="button"
                onClick={() => setHasSignature(!hasSignature)}
                className={`w-full p-2.5 rounded border text-left flex justify-between items-center ${
                  hasSignature ? "bg-emerald-950/40 border-emerald-500 text-emerald-300" : "bg-rose-950/40 border-rose-500 text-rose-300 font-bold"
                }`}
              >
                <span>{hasSignature ? "Ed25519 Signature Present" : "NO SIGNATURE (Unauthenticated!)"}</span>
                {hasSignature ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-slate-400 uppercase">Timestamp Age ({ageHours}h)</label>
              <input
                type="range"
                min="0.1"
                max="48"
                step="0.5"
                value={ageHours}
                onChange={(e) => setAgeHours(parseFloat(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Column 2 & 3: Risk Score Gauge & Factors */}
        <div className="lg:col-span-2 space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-serif font-semibold text-amber-200">
              Composite Threat Score & Tier
            </h2>
            <span
              className={`font-mono font-bold text-xs px-3 py-1 rounded border uppercase ${
                evaluation.riskTier === "SAFE"
                  ? "bg-emerald-950 border-emerald-500 text-emerald-300"
                  : evaluation.riskTier === "ELEVATED"
                  ? "bg-amber-950 border-amber-500 text-amber-300"
                  : "bg-rose-950 border-rose-500 text-rose-300 animate-pulse"
              }`}
            >
              {evaluation.riskTier} TIER
            </span>
          </div>

          {/* Risk Gauge Bar */}
          <div className="bg-slate-950 border border-amber-900/40 p-4 rounded-xl space-y-2">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-slate-400 text-xs uppercase">Overall Threat Index</span>
              <span className="text-2xl font-bold text-amber-300">{evaluation.overallRiskScore} / 100</span>
            </div>
            <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  evaluation.riskTier === "SAFE"
                    ? "bg-emerald-500"
                    : evaluation.riskTier === "ELEVATED"
                    ? "bg-amber-500"
                    : "bg-rose-600"
                }`}
                style={{ width: `${evaluation.overallRiskScore}%` }}
              />
            </div>
          </div>

          {/* Risk Factors Breakdown */}
          <div className="space-y-3 border-t border-amber-900/30 pt-4">
            <h3 className="text-sm font-serif font-bold text-amber-200">
              Risk Factor Breakdown & Recommended Mitigations
            </h3>

            <div className="space-y-3">
              {evaluation.factors.map((f) => (
                <div key={f.id} className="p-3 bg-slate-950 border border-amber-900/30 rounded-lg space-y-1 font-mono text-xs">
                  <div className="flex justify-between font-bold text-slate-200">
                    <span>{f.name}</span>
                    <span className={f.score > 50 ? "text-rose-400" : "text-emerald-400"}>
                      Score: {f.score}/100
                    </span>
                  </div>
                  <p className="text-slate-400">{f.description}</p>
                  <p className="text-amber-400/90 text-[11px] pt-1">👉 Mitigation: {f.mitigation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
