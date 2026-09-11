"use client";

import { useState } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import { MapPin, Lock, Upload, AlertTriangle, CheckCircle2, Shield, Feather, Key, Play, Sparkles } from "lucide-react";
import {
  inspectAndDecryptPayload,
  extractPayloadFromShantyText,
  embedPayloadInShantyText,
  encryptCoordinates,
  generatePirateIdentity,
  appendAuditEvent,
  loadStoredIdentities,
  saveStoredIdentities,
  DMCPayloadWire,
  InspectionReport,
} from "@/lib/crypto";
import { nauticalAudio } from "@/lib/audio";

export default function InspectPage() {
  const [rawInput, setRawInput] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [inspectionReport, setInspectionReport] = useState<InspectionReport | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [extractedShantyText, setExtractedShantyText] = useState<string | null>(null);

  // 1. Preset Real Sample: Port Royal Encrypted Payload
  const handleLoadPortRoyalSample = async () => {
    setIsVerifying(true);
    try {
      const defaultId = await generatePirateIdentity("Captain Blackbeard", "Queen Anne's Revenge");
      saveStoredIdentities([defaultId, ...loadStoredIdentities()]);

      const passphraseStr = "crimson-kraken-blackbeard-9418";
      const payload = await encryptCoordinates(
        "17.9241° N, 76.8122° W (Port Royal Treasure Vault)",
        passphraseStr,
        defaultId,
        "AES-256-GCM"
      );
      setRawInput(JSON.stringify(payload, null, 2));
      setPassphrase(passphraseStr);
      setExtractedShantyText(null);
      nauticalAudio.playClick();
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  // 2. Preset Real Sample: Sea Shanty Zero-Width Stego Carrier
  const handleLoadShantyStegoSample = async () => {
    setIsVerifying(true);
    try {
      const defaultId = await generatePirateIdentity("Captain Calico Jack", "The Ranger");
      saveStoredIdentities([defaultId, ...loadStoredIdentities()]);

      const passphraseStr = "scurvy-doubloon-calico-4219";
      const payload = await encryptCoordinates(
        "20.0543° N, 72.8790° W (Tortuga Island Secret Cove)",
        passphraseStr,
        defaultId,
        "AES-256-GCM"
      );
      const shantyLyrics = "What shall we do with a drunken sailor?\nWhat shall we do with a drunken sailor?\nWay ho and up she rises!\nEarly in the morning!";
      const stego = embedPayloadInShantyText(shantyLyrics, JSON.stringify(payload));

      setRawInput(stego.stegoText);
      setPassphrase(passphraseStr);
      setExtractedShantyText(stego.stegoText);
      nauticalAudio.playClick();
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleInspect = async () => {
    if (!rawInput.trim()) return;

    setIsVerifying(true);
    let parsedPayload: DMCPayloadWire | null = null;

    try {
      // Check if input is a sea shanty text containing zero-width stego payload
      const extractedStegoStr = extractPayloadFromShantyText(rawInput);
      if (extractedStegoStr) {
        parsedPayload = JSON.parse(extractedStegoStr);
        setExtractedShantyText(rawInput);
      } else {
        parsedPayload = JSON.parse(rawInput);
        setExtractedShantyText(null);
      }
    } catch {
      // Invalid JSON input fallback structure for gate error demonstration
      parsedPayload = {
        magic: "INVALID" as any,
        version: 0 as any,
        cipher: "AES-256-GCM",
        iv: "",
        salt: "",
        ciphertext: rawInput,
        signature: "",
        pubKey: {} as any,
        timestamp: new Date().toISOString(),
        senderCaptain: "Unknown Pirate",
        senderShip: "Ghost Sloop",
      };
    }

    if (!parsedPayload) return;

    const trustedIdentities = loadStoredIdentities();
    const report = await inspectAndDecryptPayload(parsedPayload, passphrase, trustedIdentities);
    setInspectionReport(report);

    if (report.overallSuccess) {
      nauticalAudio.playBell();
    } else {
      nauticalAudio.playAlarm();
    }

    // Append event to audit log
    await appendAuditEvent(
      report.overallSuccess ? "INSPECTION_PASSED" : "INSPECTION_FAILED",
      parsedPayload.senderCaptain || "Boarding Officer",
      report.overallSuccess
        ? `Coordinates verified and decrypted successfully.`
        : `Gate check failed (${report.gates.find((g) => !g.passed)?.code}).`,
      report.overallSuccess ? "INFO" : "WARNING"
    );

    setIsVerifying(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-sm font-mono tracking-wider uppercase mb-1">
            <Shield className="w-4 h-4" /> Boarding Inspection Deck
          </div>
          <h1 className="text-3xl font-bold font-serif text-amber-100">
            Message Verification & 6-Gate Audit
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Verify digital signatures, check key state, audit timestamp freshness, and decrypt secret coordinates & messages.
          </p>
        </div>
        <div className="w-16 h-16 relative opacity-80">
          <CompassRose ringColor="#d97706" arrowColor="#f59e0b" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input Payload & Preset Sample Loaders */}
        <div className="space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
          <div className="space-y-2">
            <h2 className="text-lg font-serif font-semibold text-amber-200 flex items-center gap-2">
              <Upload className="w-5 h-5 text-amber-500" /> Incoming Payload or Shanty Text
            </h2>
            <p className="text-xs font-mono text-slate-400">
              Click a real sample preset below to test WebCrypto decryption:
            </p>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={handleLoadPortRoyalSample}
                className="py-2 px-3 bg-slate-950 border border-amber-900/40 hover:border-amber-500 text-amber-300 font-mono text-xs rounded flex items-center gap-1.5 transition-all text-left"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" /> Port Royal Preset
              </button>
              <button
                type="button"
                onClick={handleLoadShantyStegoSample}
                className="py-2 px-3 bg-slate-950 border border-amber-900/40 hover:border-amber-500 text-amber-300 font-mono text-xs rounded flex items-center gap-1.5 transition-all text-left"
              >
                <Feather className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Shanty Stego Preset
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Paste Encrypted Payload JSON or Carrier Shanty
            </label>
            <textarea
              rows={7}
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste JSON wire payload or Sea Shanty text containing zero-width hidden bytes..."
              className="w-full bg-slate-950 border border-amber-900/40 rounded-lg p-3 text-amber-100 font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-500" /> Secret Passphrase
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter passphrase to authorize decryption..."
              className="w-full bg-slate-950 border border-amber-900/40 rounded-lg px-4 py-2.5 text-amber-300 font-mono text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={handleInspect}
            disabled={isVerifying || !rawInput.trim()}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold font-mono uppercase tracking-wider rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" /> Run 6-Gate Boarding Inspection
          </button>
        </div>

        {/* Right Column: 6-Gate Audit Inspection Report */}
        <div className="space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
          <h2 className="text-lg font-serif font-semibold text-amber-200 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500" /> 6-Gate Inspection Report
          </h2>

          {inspectionReport ? (
            <div className="space-y-6">
              {/* Overall Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center gap-4 ${
                  inspectionReport.overallSuccess
                    ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                    : "bg-rose-950/40 border-rose-500/50 text-rose-300"
                }`}
              >
                {inspectionReport.overallSuccess ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-8 h-8 text-rose-400 shrink-0" />
                )}
                <div>
                  <h3 className="font-serif font-bold text-lg">
                    {inspectionReport.overallSuccess
                      ? "MESSAGE VERIFIED — AUTHENTIC PIRATE ORDER"
                      : "BOARDING ALERT — INTEGRITY GATE FAILURE DETECTED"}
                  </h3>
                  <p className="text-xs font-mono text-slate-300 mt-0.5">
                    {inspectionReport.overallSuccess
                      ? "All 6 verification gates passed cleanly."
                      : "Interception, forgery, or tampering detected during verification."}
                  </p>
                </div>
              </div>

              {/* Revealed Decrypted Message Box */}
              {inspectionReport.overallSuccess && inspectionReport.decryptedCoordinates && (
                <div className="bg-slate-950 border border-amber-500/50 rounded-xl p-5 space-y-3 shadow-lg">
                  <div className="text-xs font-mono text-amber-400 uppercase tracking-wider flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-amber-500" /> Decrypted Secret Message / Coordinates
                    </span>
                    <span className="text-[10px] text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded">
                      {inspectionReport.cipherAlgorithm}
                    </span>
                  </div>

                  <div className="font-mono text-base font-bold text-amber-200 bg-amber-950/40 p-4 rounded-lg border border-amber-900/60 leading-relaxed">
                    {inspectionReport.decryptedCoordinates}
                  </div>

                  {extractedShantyText && (
                    <div className="pt-2 space-y-1">
                      <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1">
                        <Feather className="w-3 h-3 text-emerald-400" /> Extracted Carrier Shanty Text
                      </div>
                      <div className="text-xs font-serif text-slate-300 italic bg-slate-900/80 p-2.5 rounded border border-amber-900/30 whitespace-pre-line">
                        {extractedShantyText}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6 Verification Gates Checklist */}
              <div className="space-y-3">
                {inspectionReport.gates.map((g, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border flex items-start gap-3 transition-all ${
                      g.passed
                        ? "bg-slate-950/80 border-emerald-900/40 text-slate-200"
                        : "bg-rose-950/30 border-rose-900/50 text-rose-200"
                    }`}
                  >
                    {g.passed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-serif text-sm font-semibold flex items-center gap-2">
                        {g.gate}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                            g.passed
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                              : "bg-rose-950 text-rose-400 border border-rose-800/40"
                          }`}
                        >
                          {g.code}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-slate-400 mt-1">{g.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-80 border-2 border-dashed border-amber-900/30 rounded-lg flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              <Lock className="w-10 h-10 mb-3 text-amber-900/60" />
              <p className="font-serif text-sm text-slate-400 font-semibold">
                Awaiting Inspection Task
              </p>
              <p className="text-xs font-mono text-slate-500 mt-1 max-w-xs">
                Click "Port Royal Preset" or "Shanty Stego Preset" above to load real encrypted WebCrypto sample payloads and run decryption!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
