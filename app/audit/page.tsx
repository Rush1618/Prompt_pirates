"use client";

import { useState, useEffect } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import { Shield, CheckCircle2, AlertTriangle, RefreshCw, Hash, Lock, RotateCcw } from "lucide-react";
import { getAuditChain, verifyAuditChainIntegrity, resetAuditChain, AuditLogEntry } from "@/lib/crypto";
import { nauticalAudio } from "@/lib/audio";

export default function AuditPage() {
  const [chain, setChain] = useState<AuditLogEntry[]>([]);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const loadChain = async () => {
    const data = await getAuditChain();
    setChain(data);
    const res = await verifyAuditChainIntegrity(data);
    setVerificationResult(res);
  };

  useEffect(() => {
    loadChain();
  }, []);

  const handleVerifyNow = async () => {
    setIsVerifying(true);
    const res = await verifyAuditChainIntegrity(chain);
    setVerificationResult(res);
    if (res.isValid) {
      nauticalAudio.playBell();
    } else {
      nauticalAudio.playAlarm();
    }
    setIsVerifying(false);
  };

  const handleResetChain = async () => {
    setIsVerifying(true);
    const data = await resetAuditChain();
    setChain(data);
    const res = await verifyAuditChainIntegrity(data);
    setVerificationResult(res);
    nauticalAudio.playBell();
    setIsVerifying(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-sm font-mono tracking-wider uppercase mb-1">
            <Hash className="w-4 h-4" /> Audit & Compliance Ledger
          </div>
          <h1 className="text-3xl font-bold font-serif text-amber-100">
            Ship's Log — Tamper-Evident Hash Chain
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Cryptographically linked event chain (H_n = SHA-256(H_n-1 || EventData)) for non-repudiation auditability.
          </p>
        </div>
        <div className="w-16 h-16 relative opacity-80">
          <CompassRose ringColor="#d97706" arrowColor="#f59e0b" />
        </div>
      </div>

      {/* Audit Chain Verification Status Banner */}
      {verificationResult && (
        <div
          className={`p-5 rounded-xl border flex items-center justify-between ${
            verificationResult.isValid
              ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
              : "bg-rose-950/40 border-rose-500/50 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-3">
            {verificationResult.isValid ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <div>
              <h3 className="font-serif font-bold text-base">
                {verificationResult.isValid
                  ? "HASH CHAIN INTEGRITY VERIFIED (0 TAMPERING)"
                  : "HASH CHAIN INTEGRITY FAILURE DETECTED"}
              </h3>
              <p className="text-xs font-mono text-slate-300 mt-0.5">{verificationResult.message}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetChain}
              disabled={isVerifying}
              className="text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-amber-900/50 px-3 py-1.5 rounded flex items-center gap-1.5 text-amber-400"
              title="Reset Chain to Genesis"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Log
            </button>

            <button
              type="button"
              onClick={handleVerifyNow}
              disabled={isVerifying}
              className="text-xs font-mono bg-slate-900 hover:bg-slate-800 border border-amber-900/50 px-3 py-1.5 rounded flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} /> Re-verify Chain
            </button>
          </div>
        </div>
      )}

      {/* Audit Log Timeline */}
      <div className="space-y-4 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
        <h2 className="text-lg font-serif font-semibold text-amber-200 flex items-center justify-between">
          <span>Cryptographic Event Sequence ({chain.length} Events)</span>
          <span className="text-xs font-mono text-slate-400">Genesis: 00000000...0000</span>
        </h2>

        <div className="space-y-3">
          {chain.map((entry) => (
            <div
              key={entry.id}
              className="p-4 bg-slate-950 border border-amber-900/40 rounded-xl space-y-2 font-mono text-xs"
            >
              <div className="flex items-center justify-between font-serif font-bold text-sm text-amber-100">
                <div className="flex items-center gap-2">
                  <span className="text-amber-500 font-mono text-xs">#{entry.sequence}</span>
                  <span>{entry.eventType}</span>
                </div>
                <span className="text-xs font-mono text-slate-400 font-normal">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <p className="text-slate-300 font-serif text-xs">{entry.details}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[10px] text-slate-400 border-t border-amber-900/20 pt-2">
                <div>
                  <span className="text-slate-500">Prev Hash:</span> {entry.previousHash.substring(0, 24)}...
                </div>
                <div>
                  <span className="text-amber-500">Hash (H_{entry.sequence}):</span> {entry.currentHash.substring(0, 24)}...
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
