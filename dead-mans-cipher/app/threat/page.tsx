"use client";

import { CompassRose } from "@/components/ui/compass-rose";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { AlertTriangle, Shield, CheckCircle2, Info } from "lucide-react";

const threatMetrics = [
  { metric: "Cipher Strength", score: 98 },
  { metric: "Key Freshness", score: 95 },
  { metric: "Sig Assurance", score: 99 },
  { metric: "Anti-Replay", score: 92 },
  { metric: "Stego Stealth", score: 94 },
];

const riskRules = [
  {
    id: "RULE-01",
    rule: "Passphrase PBKDF2 Iterations",
    status: "PASS",
    details: "100,000 PBKDF2-SHA256 key derivation rounds enforced.",
    mitigation: "Sufficient GPU brute-force resistance.",
  },
  {
    id: "RULE-02",
    rule: "Timestamp Replay Window",
    status: "PASS",
    details: "24.0 hour maximum validity window enforced on all incoming dispatches.",
    mitigation: "Minimizes intercepted payload reuse.",
  },
  {
    id: "RULE-03",
    rule: "WebCrypto Ed25519 Signatures",
    status: "PASS",
    details: "Asymmetric digital signatures verified against sender public key.",
    mitigation: "Prevents naval officer forgery.",
  },
  {
    id: "RULE-04",
    rule: "LSB Image Distortion Density",
    status: "PASS",
    details: "Modifies 1 LSB per RGB channel (0.39% max pixel variance).",
    mitigation: "Imperceptible to human visual inspection.",
  },
];

export default function ThreatPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-sm font-mono tracking-wider uppercase mb-1">
            <AlertTriangle className="w-4 h-4" /> Threat & Risk Intelligence
          </div>
          <h1 className="text-3xl font-bold font-serif text-amber-100">
            Storm Warning — Threat Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time security score breakdown, threat radar, and disclosed residual risks.
          </p>
        </div>
        <div className="w-16 h-16 relative opacity-80">
          <CompassRose ringColor="#d97706" arrowColor="#f59e0b" />
        </div>
      </div>

      {/* Top Threat Gauge & Radar Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Threat Composite Score Card */}
        <div className="bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-serif font-semibold text-amber-200 flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-emerald-500" /> Overall System Security Score
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Evaluated against WebCrypto standards, PBKDF2 depth, and anti-replay freshness.
            </p>
          </div>

          <div className="text-center py-4 space-y-2">
            <div className="text-6xl font-bold font-mono text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
              96 <span className="text-xl text-slate-500 font-normal">/ 100</span>
            </div>
            <div className="inline-block px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 rounded font-mono text-xs text-emerald-300 uppercase tracking-widest font-bold">
              LOW RISK • SEAWORTHY
            </div>
          </div>

          <div className="space-y-2 font-mono text-xs border-t border-amber-900/30 pt-4">
            <div className="flex justify-between text-slate-300">
              <span>Symmetric Cipher:</span>
              <span className="text-amber-400 font-bold">AES-256-GCM</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Signature Scheme:</span>
              <span className="text-amber-400 font-bold">Ed25519 (SubtleCrypto)</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Key Derivation:</span>
              <span className="text-amber-400 font-bold">PBKDF2-SHA256 (100k)</span>
            </div>
          </div>
        </div>

        {/* Radar Chart Card */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md space-y-4">
          <h2 className="text-lg font-serif font-semibold text-amber-200">
            Cryptographic Assurance Radar
          </h2>

          <div className="h-64 w-full bg-slate-950 p-2 rounded-lg border border-amber-900/40">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={threatMetrics}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="metric" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                <Radar name="Assurance" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Rule-based Security Checklist */}
      <div className="bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md space-y-6">
        <h2 className="text-lg font-serif font-semibold text-amber-200 flex items-center justify-between">
          <span>Automated Threat Rule Engine Results</span>
          <span className="text-xs font-mono text-emerald-400">4 / 4 Rules Passing</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskRules.map((r) => (
            <div key={r.id} className="p-4 bg-slate-950 border border-amber-900/40 rounded-xl space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between font-serif font-bold text-sm text-amber-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{r.rule}</span>
                </div>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                  {r.status}
                </span>
              </div>
              <p className="text-slate-300 font-sans text-xs">{r.details}</p>
              <p className="text-amber-400/90 text-[11px] pt-1">👉 Mitigation: {r.mitigation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
