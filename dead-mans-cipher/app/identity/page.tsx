"use client";

import { useState, useEffect, useRef } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import {
  Key,
  Shield,
  RefreshCcw,
  Copy,
  Check,
  Plus,
  Skull,
  Anchor,
  AlertTriangle,
  Download,
  Upload,
} from "lucide-react";
import {
  generatePirateIdentity,
  loadStoredIdentities,
  saveStoredIdentities,
  renderWaxSealSvg,
  appendAuditEvent,
  PirateIdentity,
  KeyLifecycleState,
} from "@/lib/crypto";
import { nauticalAudio } from "@/lib/audio";

export default function IdentityPage() {
  const [identities, setIdentities] = useState<PirateIdentity[]>([]);
  const [selectedIdentity, setSelectedIdentity] = useState<PirateIdentity | null>(null);
  const [captainName, setCaptainName] = useState("Captain Blackbeard");
  const [shipName, setShipName] = useState("Queen Anne's Revenge");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedFingerprint, setCopiedFingerprint] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = loadStoredIdentities();
    if (loaded.length > 0) {
      setIdentities(loaded);
      setSelectedIdentity(loaded[0]);
    } else {
      handleCreateIdentity("Captain Blackbeard", "Queen Anne's Revenge");
    }
  }, []);

  const handleCreateIdentity = async (cName: string, sName: string) => {
    setIsGenerating(true);
    try {
      const nameToUse = cName.trim() || "Captain Blackbeard";
      const shipToUse = sName.trim() || "Queen Anne's Revenge";
      const newIdentity = await generatePirateIdentity(nameToUse, shipToUse);

      setIdentities((prev) => {
        const updated = [newIdentity, ...prev];
        saveStoredIdentities(updated);
        return updated;
      });
      setSelectedIdentity(newIdentity);

      nauticalAudio.playBell();

      await appendAuditEvent(
        "IDENTITY_CREATED",
        nameToUse,
        `Generated new ${newIdentity.algorithm} keypair with fingerprint ${newIdentity.fingerprint}.`
      );
    } catch (err) {
      console.error("Failed to generate identity", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateKeyState = async (newState: KeyLifecycleState) => {
    if (!selectedIdentity) return;
    setIdentities((prev) => {
      const updated = prev.map((id) =>
        id.id === selectedIdentity.id ? { ...id, state: newState } : id
      );
      saveStoredIdentities(updated);
      return updated;
    });
    setSelectedIdentity((prev) => (prev ? { ...prev, state: newState } : null));

    await appendAuditEvent(
      newState === "BLACKSPOT" ? "KEY_REVOKED" : "KEY_ROTATED",
      selectedIdentity.captainName,
      `Key state updated to ${newState} for fingerprint ${selectedIdentity.fingerprint}.`,
      newState === "BLACKSPOT" ? "CRITICAL" : "WARNING"
    );
  };

  const handleCopyFingerprint = () => {
    if (!selectedIdentity) return;
    navigator.clipboard.writeText(selectedIdentity.fingerprint);
    setCopiedFingerprint(true);
    setTimeout(() => setCopiedFingerprint(false), 2000);
  };

  // Export Keypair to JSON file
  const handleExportKey = () => {
    if (!selectedIdentity) return;
    const blob = new Blob([JSON.stringify(selectedIdentity, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedIdentity.captainName.toLowerCase().replace(/\s+/g, "_")}_seal.dmckey`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import Keypair from JSON file
  const handleImportKey = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const importedId: PirateIdentity = JSON.parse(evt.target?.result as string);
        if (importedId.fingerprint && importedId.captainName) {
          setIdentities((prev) => {
            const updated = [importedId, ...prev.filter((i) => i.id !== importedId.id)];
            saveStoredIdentities(updated);
            return updated;
          });
          setSelectedIdentity(importedId);
          nauticalAudio.playChime();
        }
      } catch (err) {
        alert("Invalid .dmckey file format.");
      }
    };
    reader.readAsText(file);
  };

  // Download SVG Wax Seal graphic
  const handleDownloadWaxSealSvg = () => {
    if (!selectedIdentity) return;
    const svgContent = renderWaxSealSvg({
      captainName: selectedIdentity.captainName,
      fingerprint: selectedIdentity.fingerprint,
      waxColor: selectedIdentity.state === "BLACKSPOT" ? "#450a0a" : "#991b1b",
    });

    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedIdentity.captainName.toLowerCase().replace(/\s+/g, "_")}_wax_seal.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-900/30 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-sm font-mono tracking-wider uppercase mb-1">
            <Key className="w-4 h-4" /> Identity Vault & Wax Seal Vault
          </div>
          <h1 className="text-3xl font-bold font-serif text-amber-100">
            Captain Cryptographic Keys & Passphrases
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage Ed25519 & ECDSA keypairs, print official wax seals, export/import `.dmckey` files, and control key lifecycle states.
          </p>
        </div>
        <div className="w-16 h-16 relative opacity-80">
          <CompassRose ringColor="#d97706" arrowColor="#f59e0b" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Identity List & Keypair Generator */}
        <div className="space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
          <h2 className="text-lg font-serif font-semibold text-amber-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" /> Forge New Keypair Identity
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 border border-amber-900/40 px-2 py-1 rounded"
              title="Import .dmckey JSON File"
            >
              <Upload className="w-3.5 h-3.5" /> Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".dmckey,.json"
              onChange={handleImportKey}
              className="hidden"
            />
          </h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Captain / Officer Name
              </label>
              <input
                type="text"
                value={captainName}
                onChange={(e) => setCaptainName(e.target.value)}
                placeholder="e.g. Captain Blackbeard"
                className="w-full bg-slate-950 border border-amber-900/40 rounded-lg px-4 py-2.5 text-amber-100 font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Vessel / Flagship Name
              </label>
              <input
                type="text"
                value={shipName}
                onChange={(e) => setShipName(e.target.value)}
                placeholder="e.g. Queen Anne's Revenge"
                className="w-full bg-slate-950 border border-amber-900/40 rounded-lg px-4 py-2.5 text-amber-100 font-mono text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="button"
              onClick={() => handleCreateIdentity(captainName, shipName)}
              disabled={isGenerating}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold font-mono uppercase tracking-wider rounded-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <RefreshCcw className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Forge WebCrypto Keypair Identity
            </button>
          </div>

          <div className="border-t border-amber-900/30 pt-4 space-y-3">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Stored Identities Vault ({identities.length})
            </label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {identities.map((id) => (
                <button
                  key={id.id}
                  type="button"
                  onClick={() => setSelectedIdentity(id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all ${
                    selectedIdentity?.id === id.id
                      ? "bg-amber-950/60 border-amber-500/80 text-amber-200"
                      : "bg-slate-950 border-amber-900/30 text-slate-400 hover:border-amber-800"
                  }`}
                >
                  <div className="font-bold font-serif text-sm text-amber-100 flex items-center justify-between">
                    {id.captainName}
                    <span className="text-[10px] text-amber-400 uppercase font-mono">{id.state}</span>
                  </div>
                  <div className="text-slate-400 text-[11px] mt-1">{id.shipName} • {id.algorithm}</div>
                  <div className="text-amber-500/80 text-[10px] mt-0.5">{id.fingerprint}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 & 3: Selected Identity Details & Printable Wax Seal */}
        {selectedIdentity ? (
          <div className="lg:col-span-2 space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-amber-900/30 pb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-amber-100">
                  {selectedIdentity.captainName}
                </h2>
                <p className="text-xs font-mono text-amber-400">
                  Commanding: {selectedIdentity.shipName} | Key Algorithm: {selectedIdentity.algorithm}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportKey}
                  className="text-xs font-mono text-amber-400 border border-amber-900/40 px-3 py-1.5 rounded flex items-center gap-1 hover:border-amber-500"
                  title="Export .dmckey File"
                >
                  <Download className="w-3.5 h-3.5" /> Export Key
                </button>

                <button
                  type="button"
                  onClick={handleCopyFingerprint}
                  className="text-xs font-mono text-amber-400 border border-amber-900/40 px-3 py-1.5 rounded flex items-center gap-1 hover:border-amber-500"
                >
                  {copiedFingerprint ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedFingerprint ? "Copied" : selectedIdentity.fingerprint}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Printable Wax Seal Emblem Graphic */}
              <div className="bg-slate-950 border border-amber-900/40 rounded-xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
                <div
                  className="w-44 h-44 cursor-pointer"
                  onClick={handleDownloadWaxSealSvg}
                  title="Click to Download SVG Wax Seal Graphic"
                  dangerouslySetInnerHTML={{
                    __html: renderWaxSealSvg({
                      captainName: selectedIdentity.captainName,
                      fingerprint: selectedIdentity.fingerprint,
                      waxColor: selectedIdentity.state === "BLACKSPOT" ? "#450a0a" : "#991b1b",
                    }),
                  }}
                />
                <button
                  type="button"
                  onClick={handleDownloadWaxSealSvg}
                  className="text-xs font-mono text-amber-300 hover:text-amber-200 flex items-center gap-1 border border-amber-900/40 px-3 py-1.5 rounded"
                >
                  <Download className="w-3.5 h-3.5" /> Download SVG Wax Seal
                </button>
              </div>

              {/* Key Lifecycle Controls */}
              <div className="space-y-4">
                <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                  Key Lifecycle State Controls
                </label>

                <div className="space-y-2">
                  {[
                    { state: "SAILING", label: "Sailing (Active & Trusted)", color: "text-emerald-400 border-emerald-900/50 bg-emerald-950/20" },
                    { state: "ANCHORED", label: "Anchored (Expired / Revoked)", color: "text-amber-400 border-amber-900/50 bg-amber-950/20" },
                    { state: "CHANGING_COLORS", label: "Changing Colors (Rotated Key)", color: "text-blue-400 border-blue-900/50 bg-blue-950/20" },
                    { state: "BLACKSPOT", label: "Black Spot (Compromised Key)", color: "text-rose-400 border-rose-900/50 bg-rose-950/30 font-bold" },
                  ].map((btn) => (
                    <button
                      key={btn.state}
                      type="button"
                      onClick={() => handleUpdateKeyState(btn.state as KeyLifecycleState)}
                      className={`w-full text-left p-3 rounded-lg border text-xs font-mono transition-all ${btn.color} ${
                        selectedIdentity.state === btn.state ? "ring-2 ring-amber-500" : ""
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-950 border border-amber-900/40 p-3 rounded-lg text-xs font-mono text-slate-400 space-y-1">
                  <div>Created: {new Date(selectedIdentity.createdISO).toLocaleDateString()}</div>
                  <div>Expires: {new Date(selectedIdentity.expiresISO).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 h-80 border-2 border-dashed border-amber-900/30 rounded-xl flex items-center justify-center text-slate-500">
            Select or forge a captain identity to view key parameters.
          </div>
        )}
      </div>
    </div>
  );
}
