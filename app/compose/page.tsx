"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { CompassRose } from "@/components/ui/compass-rose";
import { NauticalMap } from "@/components/ui/nautical-map";
import { Nautical3DCompass } from "@/components/ui/nautical-3d-compass";
import { BackButton } from "@/components/ui/back-button";
import { nauticalAudio } from "@/lib/audio";
import {
  Lock,
  Key,
  Shield,
  Upload,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff,
  Feather,
  ImageIcon,
} from "lucide-react";
import {
  generatePirateIdentity,
  encryptCoordinates,
  generatePiratePassphrase,
  embedPayloadInShantyText,
  appendAuditEvent,
  PirateIdentity,
  DMCPayloadWire,
  CipherAlgorithm,
  loadStoredIdentities,
} from "@/lib/crypto";

export default function ComposePage() {
  const [coordinates, setCoordinates] = useState("0x9f4a8b2c × 0x1d3e5f7a (Port Royal Treasure Vault Key)");
  const [passphrase, setPassphrase] = useState("");
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [cipherAlgo, setCipherAlgo] = useState<CipherAlgorithm>("AES-256-GCM");
  const [shantyLyrics, setShantyLyrics] = useState(
    "What shall we do with a drunken sailor?\nWhat shall we do with a drunken sailor?\nWay ho and up she rises!\nEarly in the morning!"
  );

  const [identities, setIdentities] = useState<PirateIdentity[]>([]);
  const [selectedIdentity, setSelectedIdentity] = useState<PirateIdentity | null>(null);

  const [encryptedPayload, setEncryptedPayload] = useState<DMCPayloadWire | null>(null);
  const [stegoShantyResult, setStegoShantyResult] = useState<string | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Generate passphrase & load/create default identity
    const init = async () => {
      setPassphrase(generatePiratePassphrase());
      const stored = loadStoredIdentities();
      if (stored.length > 0) {
        setIdentities(stored);
        setSelectedIdentity(stored[0]);
      } else {
        const defaultId = await generatePirateIdentity("Captain Blackbeard", "Queen Anne's Revenge");
        setIdentities([defaultId]);
        setSelectedIdentity(defaultId);
      }
    };
    init();
  }, []);

  const PIRATE_LOCATIONS = [
    "0x9f4a8b2c × 0x1d3e5f7a (Port Royal Treasure Vault Key)",
    "0xa4e12c8b × 0x3d7f9e12 (Tortuga Buccaneer Cipher)",
    "0xc8b14a9f × 0x5e2d1f4a (Nassau Pirate Cryptogram)",
    "0x1f4a9b2c × 0x8e3d5f7a (San Juan Corsair Key)",
    "0x7a8b9c0d × 0x2e1f4a9b (Key West Smuggler's Token)",
    "0x3d5f7a9b × 0x9c0d1e2f (Curaçao Gold Key)",
  ];

  const PIRATE_SHANTIES = [
    "What shall we do with a drunken sailor?\nWhat shall we do with a drunken sailor?\nWay ho and up she rises!\nEarly in the morning!",
    "Leave her, Johnny, leave her!\nFor the voyage is done and the winds do blow\nAnd it's time for us to go!",
    "Fifteen men on the dead man's chest—\nYo-ho-ho, and a bottle of rum!\nDrink and the devil had done for the rest—\nYo-ho-ho, and a bottle of rum!",
    "Oh, the smartest clipper you can find\nIs the Hooghly packet for the Black Ball Line\nBlow boys, blow, for Califor-ni-o!",
  ];

  const handleGeneratePassphrase = () => {
    setPassphrase(generatePiratePassphrase());
  };

  const handleRandomize = () => {
    nauticalAudio.playClick();
    const randomLoc = PIRATE_LOCATIONS[Math.floor(Math.random() * PIRATE_LOCATIONS.length)];
    const randomShanty = PIRATE_SHANTIES[Math.floor(Math.random() * PIRATE_SHANTIES.length)];
    const randomPass = generatePiratePassphrase();
    const randomAlgo: CipherAlgorithm = Math.random() > 0.5 ? "AES-256-GCM" : "ChaCha20-Poly1305";

    setCoordinates(randomLoc);
    setShantyLyrics(randomShanty);
    setPassphrase(randomPass);
    setCipherAlgo(randomAlgo);

    if (identities.length > 0) {
      const randomId = identities[Math.floor(Math.random() * identities.length)];
      setSelectedIdentity(randomId);
    }
  };

  const handleEncrypt = async () => {
    if (!coordinates.trim() || !passphrase.trim() || !selectedIdentity) return;

    setIsEncrypting(true);
    try {
      // 1. WebCrypto AES-GCM or ChaCha20 encryption + Ed25519 digital signature
      const payload = await encryptCoordinates(
        coordinates,
        passphrase,
        selectedIdentity,
        cipherAlgo
      );
      setEncryptedPayload(payload);

      // 2. Embed payload wire JSON into Sea Shanty via Zero-Width Unicode characters
      const stegoRes = embedPayloadInShantyText(shantyLyrics, JSON.stringify(payload));
      setStegoShantyResult(stegoRes.stegoText);

      // 3. Play Web Audio chime
      nauticalAudio.playChime();

      // 4. Append to tamper-evident audit log
      await appendAuditEvent(
        "ENCRYPTION_EXECUTED",
        selectedIdentity.captainName,
        `Encrypted maritime coordinates using ${cipherAlgo} + Ed25519 signature.`
      );
    } catch (err) {
      console.error("Encryption failed", err);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleCopyPayload = () => {
    if (!encryptedPayload) return;
    navigator.clipboard.writeText(JSON.stringify(encryptedPayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <BackButton />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-amber-900/30 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-xs sm:text-sm font-mono tracking-wider uppercase mb-1">
            <Lock className="w-4 h-4" /> Covert Encryption Deck
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-amber-100">
            Cipher Workshop — Compose & Encrypt
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Encrypt maritime coordinates with WebCrypto AES-256-GCM, sign with Ed25519, and embed into carrier shanties.
          </p>
        </div>
        <div className="w-12 h-12 sm:w-16 sm:h-16 relative opacity-80 shrink-0 hidden sm:block">
          <CompassRose ringColor="#d97706" arrowColor="#f59e0b" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Left Column: Form Inputs */}
        <div className="space-y-4 sm:space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-4 sm:p-6 backdrop-blur-md">
          <div className="flex items-center justify-between gap-2 border-b border-amber-900/20 pb-3">
            <h2 className="text-lg font-serif font-semibold text-amber-200 flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-500" /> Message Payload & Key Parameters
            </h2>
            <button
              type="button"
              onClick={handleRandomize}
              className="px-3 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/90 border border-amber-500/60 text-amber-200 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer active:scale-95 hover:border-amber-400"
              title="Generate random pirate coordinates, passphrase, identity & shanty"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> 🎲 Roll Random Missive
            </button>
          </div>

          {/* 3D WebGL Entropy Seed Generator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 3D Entropy Generator & Key Dial
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Click 3D core to generate WebCrypto seed
              </span>
            </div>
            <Nautical3DCompass
              height="320px"
              onAngleChange={(_outerVal, _innerVal, seed, _salt, outerHexKey, innerHexKey) => {
                const combinedHexKey =
                  outerHexKey && innerHexKey ? `${outerHexKey} × ${innerHexKey}` : `0x9f4a8b2c × 0x1d3e5f7a`;
                setCoordinates(`${combinedHexKey} (Dual Concentric Cipher Key)`);
                setPassphrase(`pirate-key-${seed}`);
                nauticalAudio.playChime();
              }}
            />
          </div>

          {/* Identity Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Signing Captain Identity
            </label>
            <select
              value={selectedIdentity?.id || ""}
              onChange={(e) => {
                const found = identities.find((i) => i.id === e.target.value);
                if (found) setSelectedIdentity(found);
              }}
              className="w-full bg-slate-950 border border-amber-900/40 rounded-lg px-4 py-2.5 text-amber-100 font-mono text-sm focus:outline-none focus:border-amber-500"
            >
              {identities.map((id) => (
                <option key={id.id} value={id.id}>
                  {id.captainName} ({id.shipName}) — {id.fingerprint} [{id.algorithm}]
                </option>
              ))}
            </select>
          </div>

          {/* Interactive Nautical Map Selector */}
          <NauticalMap
            selectedCoordinates={coordinates}
            onSelectCoordinates={(coords, name) => {
              setCoordinates(`${coords} (${name})`);
              nauticalAudio.playClick();
            }}
          />

          {/* Coordinates Input */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Secret Maritime Coordinates / Orders
            </label>
            <textarea
              rows={2}
              value={coordinates}
              onChange={(e) => setCoordinates(e.target.value)}
              placeholder="e.g. 17.9241° N, 76.8122° W (Port Royal Treasure Vault)"
              className="w-full bg-slate-950 border border-amber-900/40 rounded-lg p-3 text-amber-100 font-mono text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Cipher Algorithm Selection */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Symmetric Cipher Algorithm
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setCipherAlgo("AES-256-GCM")}
                className={`py-2.5 px-4 rounded-lg font-mono text-xs border transition-all ${
                  cipherAlgo === "AES-256-GCM"
                    ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold"
                    : "bg-slate-950 border-amber-900/30 text-slate-400 hover:border-amber-700"
                }`}
              >
                AES-256-GCM (Hardware GCM)
              </button>
              <button
                type="button"
                onClick={() => setCipherAlgo("ChaCha20-Poly1305")}
                className={`py-2.5 px-4 rounded-lg font-mono text-xs border transition-all ${
                  cipherAlgo === "ChaCha20-Poly1305"
                    ? "bg-amber-500/20 border-amber-500 text-amber-200 font-bold"
                    : "bg-slate-950 border-amber-900/30 text-slate-400 hover:border-amber-700"
                }`}
              >
                ChaCha20-Poly1305 (Stream)
              </button>
            </div>
          </div>

          {/* Passphrase Generator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                Wax Seal Key Passphrase
              </label>
              <button
                type="button"
                onClick={handleGeneratePassphrase}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Roll Phrase
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassphrase ? "text" : "password"}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full bg-slate-950 border border-amber-900/40 rounded-lg px-4 py-2.5 pr-10 text-amber-300 font-mono text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPassphrase(!showPassphrase)}
                className="absolute right-3 top-3 text-slate-400 hover:text-amber-300"
              >
                {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Carrier Sea Shanty Lyrics */}
          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Feather className="w-3.5 h-3.5 text-amber-500" /> Carrier Sea Shanty Lyrics
            </label>
            <textarea
              rows={3}
              value={shantyLyrics}
              onChange={(e) => setShantyLyrics(e.target.value)}
              className="w-full bg-slate-950 border border-amber-900/40 rounded-lg p-3 text-slate-300 font-mono text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleEncrypt}
            disabled={isEncrypting}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-bold font-mono uppercase tracking-wider rounded-lg shadow-lg shadow-amber-950/40 transition-all flex items-center justify-center gap-2"
          >
            {isEncrypting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Encrypt Coordinates & Generate Cipher Payload
          </button>
        </div>

        {/* Right Column: Cryptographic Output */}
        <div className="space-y-6 bg-slate-900/60 border border-amber-900/30 rounded-xl p-6 backdrop-blur-md">
          <h2 className="text-lg font-serif font-semibold text-amber-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-500" /> DMC Cryptographic Wire Payload
            </span>
            {encryptedPayload && (
              <button
                type="button"
                onClick={handleCopyPayload}
                className="text-xs font-mono text-amber-400 hover:text-amber-300 flex items-center gap-1 border border-amber-900/40 px-2.5 py-1 rounded"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy JSON"}
              </button>
            )}
          </h2>

          {encryptedPayload ? (
            <div className="space-y-4">
              <div className="bg-slate-950 border border-amber-900/50 rounded-lg p-4 font-mono text-xs text-amber-200 space-y-2 max-h-72 overflow-y-auto">
                <div className="text-emerald-400 font-bold">// Protocol Header: DMC1 v1 ({encryptedPayload.cipher})</div>
                <pre className="text-slate-300 whitespace-pre-wrap">
                  {JSON.stringify(encryptedPayload, null, 2)}
                </pre>
              </div>

              {/* Zero-Width Unicode Stego Output Preview */}
              {stegoShantyResult && (
                <div className="space-y-2 border-t border-amber-900/30 pt-4">
                  <label className="text-xs font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
                    <Feather className="w-4 h-4" /> Steganographic Shanty Carrier (Payload Embedded)
                  </label>
                  <div className="bg-slate-950 border border-emerald-900/40 rounded-lg p-3 font-serif text-sm text-amber-100/90 whitespace-pre-line leading-relaxed">
                    {stegoShantyResult}
                  </div>
                  <p className="text-[11px] font-mono text-slate-500">
                    * The ciphertext JSON is invisibly encoded into zero-width Unicode characters inside line 1 of the shanty.
                  </p>
                </div>
              )}

              {/* Image Steganography Action CTA */}
              <div className="pt-4 border-t border-amber-900/30">
                <Link
                  href="/stego"
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-amber-950/40 border border-amber-900/50 hover:border-amber-500 text-amber-300 font-mono text-xs rounded-lg flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer group"
                >
                  <ImageIcon className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                  Hide Payload in Sail Emblem / Chart Image (Image LSB Steganography) →
                </Link>
              </div>
            </div>
          ) : (
            <div className="h-80 border-2 border-dashed border-amber-900/30 rounded-lg flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              <Upload className="w-10 h-10 mb-3 text-amber-900/60" />
              <p className="font-serif text-sm text-slate-400 font-semibold">
                No Cipher Payload Generated Yet
              </p>
              <p className="text-xs font-mono text-slate-500 mt-1 max-w-xs">
                Fill in your treasure coordinates, choose your identity, and click encrypt to forge a tamper-evident payload.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
