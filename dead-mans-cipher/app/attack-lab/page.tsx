"use client";

import { useState } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import { Swords, AlertTriangle, CheckCircle2, XCircle, Play, Shield } from "lucide-react";
import {
  inspectAndDecryptPayload,
  appendAuditEvent,
  DMCPayloadWire,
  InspectionReport,
} from "@/lib/crypto";
import { nauticalAudio } from "@/lib/audio";

interface AttackScenario {
  id: string;
  name: string;
  category: "FORGERY" | "REPLAY" | "TAMPERING" | "KEY_COMPROMISE";
  description: string;
  getPayload: () => { payload: DMCPayloadWire; passphrase: string };
}

export default function AttackLabPage() {
  const [selectedAttackId, setSelectedAttackId] = useState<string>("attack_1");
  const [lastReport, setLastReport] = useState<InspectionReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const attacks: AttackScenario[] = [
    {
      id: "attack_1",
      name: "1. Forged Signature Attack (Admiralty Impersonation)",
      category: "FORGERY",
      description: "Royal Navy codebreakers intercept a message and forge an invalid Ed25519 signature.",
      getPayload: () => ({
        payload: {
          magic: "DMC1",
          version: 1,
          cipher: "AES-256-GCM",
          iv: "YmFzZTY0aXY=",
          salt: "YmFzZTY0c2FsdA==",
          ciphertext: "Y29vcmRpbmF0ZXNfaGVyZQ==",
          signature: "RkFLRV9TSUdOQVRVUkVfRk9SR0VSWQ==", // Bad Signature
          pubKey: { kty: "OKP", crv: "Ed25519", x: "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo" },
          timestamp: new Date().toISOString(),
          senderCaptain: "Admiral Nelson (Navy)",
          senderShip: "HMS Victory",
        },
        passphrase: "crimson-kraken-blackbeard-9418",
      }),
    },
    {
      id: "attack_2",
      name: "2. Replay Attack (Stale Maritime Orders)",
      category: "REPLAY",
      description: "Interception sloops re-transmit valid coordinates captured 48 hours ago.",
      getPayload: () => {
        const oldDate = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
        return {
          payload: {
            magic: "DMC1",
            version: 1,
            cipher: "AES-256-GCM",
            iv: "YmFzZTY0aXY=",
            salt: "YmFzZTY0c2FsdA==",
            ciphertext: "Y29vcmRpbmF0ZXNfaGVyZQ==",
            signature: "RWQyNTUxOVNpZ25hdHVyZUJ5dGVz",
            pubKey: { kty: "OKP", crv: "Ed25519", x: "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo" },
            timestamp: oldDate, // 48h stale
            senderCaptain: "Captain Blackbeard",
            senderShip: "Queen Anne's Revenge",
          },
          passphrase: "crimson-kraken-blackbeard-9418",
        };
      },
    },
    {
      id: "attack_3",
      name: "3. Ciphertext Bit-Flip Attack (Transit Corruption)",
      category: "TAMPERING",
      description: "Corrupt 1 byte in the ciphertext payload to trigger GCM AuthTag integrity failure.",
      getPayload: () => ({
        payload: {
          magic: "DMC1",
          version: 1,
          cipher: "AES-256-GCM",
          iv: "YmFzZTY0aXY=",
          salt: "YmFzZTY0c2FsdA==",
          ciphertext: "Q29ycnVwdGVkQ2lwaGVydGV4dEJpdEZsaXA=", // Corrupted
          signature: "RWQyNTUxOVNpZ25hdHVyZUJ5dGVz",
          pubKey: { kty: "OKP", crv: "Ed25519", x: "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo" },
          timestamp: new Date().toISOString(),
          senderCaptain: "Captain Blackbeard",
          senderShip: "Queen Anne's Revenge",
        },
        passphrase: "crimson-kraken-blackbeard-9418",
      }),
    },
    {
      id: "attack_4",
      name: "4. Wrong Passphrase Attack (Brute-Force Authorization)",
      category: "KEY_COMPROMISE",
      description: "Attempt decryption using an invalid wax seal secret passphrase.",
      getPayload: () => ({
        payload: {
          magic: "DMC1",
          version: 1,
          cipher: "AES-256-GCM",
          iv: "YmFzZTY0aXY=",
          salt: "YmFzZTY0c2FsdA==",
          ciphertext: "Y29vcmRpbmF0ZXNfaGVyZQ==",
          signature: "RWQyNTUxOVNpZ25hdHVyZUJ5dGVz",
          pubKey: { kty: "OKP", crv: "Ed25519", x: "11qYAYKxCrfVS_7TyWQHOg7hcvPapiMlrwIaaPcHURo" },
          timestamp: new Date().toISOString(),
          senderCaptain: "Captain Blackbeard",
          senderShip: "Queen Anne's Revenge",
        },
        passphrase: "WRONG_PASSPHRASE_GUESS",
      }),
    },
  ];

  const handleRunAttack = async (attack: AttackScenario) => {
    setIsRunning(true);
    const { payload, passphrase } = attack.getPayload();

    const report = await inspectAndDecryptPayload(payload, passphrase, []);
    setLastReport(report);

    // Audio cue: play bell when attack is successfully blocked, alarm if bypassed
    if (!report.overallSuccess) {
      nauticalAudio.playBell();
    } else {
      nauticalAudio.playAlarm();
    }

    await appendAuditEvent(
      "ATTACK_SIMULATED",
      "Kraken Attack Lab",
      `Ran ${attack.name}. Defense Gate Result: ${report.overallSuccess ? "BYPASSED" : "BLOCKED"} (${report.gates.find(g => !g.passed)?.code}).`,
      report.overallSuccess ? "CRITICAL" : "INFO"
    );

    setIsRunning(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-500 text-sm font-mono tracking-wider uppercase mb-1">
            <Swords className="w-4 h-4" /> Adversarial Attack Simulator
          </div>
          <h1 className="text-3xl font-bold font-serif text-amber-100">
            Kraken's Trial — Attack Simulator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Simulate naval codebreaker attacks (signature forgery, replay attacks, bit-flips) against the 6-gate defense engine.
          </p>
        </div>
        <div className="w-16 h-16 relative opacity-80">
          <CompassRose ringColor="#e11d48" arrowColor="#f43f5e" />
        </div>
      </div>

      {/* Explanatory Defense Benchmark Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-emerald-500/40 font-mono text-xs text-amber-100 space-y-1">
        <div className="font-bold text-emerald-400 flex items-center gap-2">
          <Shield className="w-4 h-4" /> Defense Benchmark Mode
        </div>
        <p className="text-slate-300">
          In this trial, you launch hostile naval attacks (forged signatures, replay attacks, bit-flips).
          <strong className="text-emerald-300"> Your defense engine SHOULD block every single attack!</strong> When a gate rejects a malicious payload, your cryptosystem is functioning 100% correctly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column 1: Attack Scenarios */}
        <div className="space-y-4 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
          <h2 className="text-lg font-serif font-semibold text-amber-200 flex items-center gap-2">
            <Swords className="w-5 h-5 text-rose-500" /> Select Adversarial Attack Vector
          </h2>

          <div className="space-y-3">
            {attacks.map((atk) => (
              <div
                key={atk.id}
                className={`p-4 rounded-xl border transition-all ${
                  selectedAttackId === atk.id
                    ? "bg-rose-950/40 border-rose-500/80 text-amber-100"
                    : "bg-slate-950 border-amber-900/30 text-slate-300 hover:border-amber-700"
                }`}
              >
                <div className="flex items-center justify-between font-serif font-bold text-sm">
                  {atk.name}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                    {atk.category}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400 mt-1.5">{atk.description}</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAttackId(atk.id);
                    handleRunAttack(atk);
                  }}
                  disabled={isRunning}
                  className="mt-3 py-2 px-4 bg-rose-900/80 hover:bg-rose-800 text-rose-100 font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-all"
                >
                  <Play className="w-3.5 h-3.5" /> Launch Hostile Attack Payload
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Live Defense Engine Response */}
        <div className="space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
          <h2 className="text-lg font-serif font-semibold text-amber-200 flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-500" /> Live Gate Defense Response
          </h2>

          {lastReport ? (
            <div className="space-y-6">
              <div
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  !lastReport.overallSuccess
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/50 text-rose-300"
                }`}
              >
                {!lastReport.overallSuccess ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
                )}
                <div>
                  <h3 className="font-serif font-bold text-lg">
                    {!lastReport.overallSuccess
                      ? "DEFENSE SUCCESS — ATTACK BLOCKED & REJECTED"
                      : "ATTACK BYPASSED DEFENSES (WARNING)"}
                  </h3>
                  <p className="text-xs font-mono text-slate-300 mt-0.5">
                    {!lastReport.overallSuccess
                      ? `Threat caught by gate check: ${lastReport.gates.find(g => !g.passed)?.code}`
                      : "Payload was unexpectedly authorized."}
                  </p>
                </div>
              </div>

              {/* 6 Verification Gates Breakdown */}
              <div className="space-y-2">
                {lastReport.gates.map((g, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-start gap-3 text-xs font-mono ${
                      g.passed
                        ? "bg-slate-950 border-emerald-900/40 text-slate-300"
                        : "bg-amber-950/60 border-amber-500/80 text-amber-200 font-bold"
                    }`}
                  >
                    {g.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        {g.gate}
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          g.passed ? "bg-emerald-950 text-emerald-400" : "bg-amber-950 text-amber-300 border border-amber-800"
                        }`}>
                          {g.passed ? "PASSED" : `BLOCKED AT GATE: ${g.code}`}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-normal mt-0.5">{g.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-80 border-2 border-dashed border-amber-900/30 rounded-lg flex items-center justify-center text-slate-500">
              Select an attack scenario on the left to test the defense engine.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
