"use client";

import { useState } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import { VerificationGate, VerificationStatus } from "@/components/ui/verification-badges";
import { Lock, Upload, FileText, MapPin, ChevronDown } from "lucide-react";

const MESSAGE_TYPES = [
  { value: "navigation", pirate: "Navigation Chart", desc: "Coordinate reveal — gated by verification" },
  { value: "rendezvous", pirate: "Rendezvous Point", desc: "Meeting location and time" },
  { value: "distress", pirate: "Distress Flare", desc: "Emergency signal" },
  { value: "supply", pirate: "Supply Manifest", desc: "Resource and cargo orders" },
  { value: "tactical", pirate: "Tactical Orders", desc: "Strategic command directives" },
  { value: "free_text", pirate: "Open Missive", desc: "Free-form message" },
];

const EXPIRY_OPTIONS = [
  { value: "15", label: "15 minutes" },
  { value: "60", label: "1 hour" },
  { value: "240", label: "4 hours" },
  { value: "1440", label: "24 hours" },
  { value: "10080", label: "7 days" },
];

type Stage = "compose" | "encrypting" | "signing" | "sealed";

export default function ComposePage() {
  const [stage, setStage] = useState<Stage>("compose");
  const [msgType, setMsgType] = useState("navigation");
  const [messageBody, setMessageBody] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [expiry, setExpiry] = useState("60");
  const [replayProtection, setReplayProtection] = useState(true);
  const [carrierType, setCarrierType] = useState<"none" | "image">("none");

  const selectedType = MESSAGE_TYPES.find((t) => t.value === msgType)!;

  const handleSeal = async () => {
    setStage("encrypting");
    await new Promise((r) => setTimeout(r, 1200));
    setStage("signing");
    await new Promise((r) => setTimeout(r, 800));
    setStage("sealed");
  };

  const mockEnvelope = {
    version: 1,
    messageId: "f3a9c821-4d2e-47b8-9c01-e5f72a3b8d94",
    senderId: "identity-captain-vane-01",
    recipientId: "identity-quartermaster-02",
    messageType: msgType,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + parseInt(expiry) * 60000).toISOString(),
    algorithm: "AES-256-GCM",
    signatureAlgorithm: "Ed25519",
    nonce: "dGhpcyBpcyBhIG5vbmNl",
    ciphertext: "6Zp3mQ8xK2wL…[256 bytes]",
    signature: "MEQCIBx7p3…[Ed25519 64 bytes]",
    keyId: "seal-mark-4f8a2c91",
    carrier: carrierType,
    payloadVersion: 1,
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Sealed Missive Forge</h2>
          <p className="page-subtitle">
            Compose → Encrypt (AES-256-GCM) → Sign (Ed25519) → Package secure envelope
          </p>
        </div>
        <CompassRose
          size={52}
          state={stage === "encrypting" || stage === "signing" ? "verifying" : stage === "sealed" ? "verified" : "idle"}
        />
      </div>

      {stage === "sealed" ? (
        <SealedView envelope={mockEnvelope} onReset={() => setStage("compose")} />
      ) : (
        <div className="grid-2">
          {/* Left — Compose form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Message type */}
            <div className="card">
              <div className="section-label" style={{ marginBottom: "16px" }}>Message Classification</div>
              <div style={{ display: "grid", gap: "8px" }}>
                {MESSAGE_TYPES.map((type) => (
                  <label
                    key={type.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderRadius: "6px",
                      border: `1px solid ${msgType === type.value ? "var(--gold)" : "var(--border)"}`,
                      background: msgType === type.value ? "var(--gold-glow)" : "var(--ink-2)",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="radio"
                      name="msgType"
                      value={type.value}
                      checked={msgType === type.value}
                      onChange={() => setMsgType(type.value)}
                      style={{ accentColor: "var(--gold)" }}
                    />
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: "var(--parchment)", letterSpacing: "0.03em" }}>
                        {type.pirate}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--parchment-3)", opacity: 0.6, marginTop: "2px" }}>
                        {type.desc}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Coordinates (navigation type) */}
            {msgType === "navigation" && (
              <div className="card">
                <div className="section-label" style={{ marginBottom: "12px" }}>
                  <MapPin size={10} style={{ display: "inline", marginRight: "6px" }} />
                  Coordinates (X Marks the Spot)
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label className="input-label">Latitude</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 23.4162° N"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      aria-label="Latitude coordinate"
                    />
                  </div>
                  <div>
                    <label className="input-label">Longitude</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 75.7720° E"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      aria-label="Longitude coordinate"
                    />
                  </div>
                </div>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--gold-dim)", opacity: 0.7, marginTop: "8px" }}>
                  ⚓ Coordinates will only reveal after all verification gates pass
                </p>
              </div>
            )}
          </div>

          {/* Right — Options + body */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card">
              <div className="section-label" style={{ marginBottom: "12px" }}>Message Body</div>
              <div style={{ marginBottom: "12px" }}>
                <label className="input-label">Recipient Identity</label>
                <select className="input" aria-label="Select recipient">
                  <option>Quartermaster — seal-mark-q02</option>
                  <option>First Mate — seal-mark-fm03</option>
                  <option>Navigator — seal-mark-n04</option>
                </select>
              </div>
              <div>
                <label className="input-label">Dispatch Contents</label>
                <textarea
                  className="input"
                  placeholder={
                    msgType === "navigation"
                      ? "Add context for the chart coordinates..."
                      : "Write your sealed missive..."
                  }
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  rows={4}
                  aria-label="Message body"
                />
              </div>
            </div>

            {/* Security config */}
            <div className="card">
              <div className="section-label" style={{ marginBottom: "16px" }}>Cipher Configuration</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.78rem", color: "var(--parchment)" }}>Algorithm</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold-dim)", opacity: 0.8 }}>AES-256-GCM + Ed25519</div>
                  </div>
                  <span className="badge badge-pass">Locked In</span>
                </div>

                <hr className="gold-divider" />

                <div>
                  <label className="input-label">Expiry (Freshness Policy)</label>
                  <select className="input" value={expiry} onChange={(e) => setExpiry(e.target.value)} aria-label="Message expiry">
                    {EXPIRY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--ink-2)", borderRadius: "6px", border: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.78rem", color: "var(--parchment)" }}>Replay Protection</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--parchment-3)", opacity: 0.6, marginTop: "2px" }}>Unique messageId + consumed-state tracking</div>
                  </div>
                  <input type="checkbox" checked={replayProtection} onChange={(e) => setReplayProtection(e.target.checked)} style={{ accentColor: "var(--gold)", width: "16px", height: "16px", cursor: "pointer" }} aria-label="Enable replay protection" />
                </div>

                <div>
                  <label className="input-label">Carrier</label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {(["none", "image"] as const).map((c) => (
                      <label key={c} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "8px", border: `1px solid ${carrierType === c ? "var(--gold)" : "var(--border)"}`, borderRadius: "4px", background: carrierType === c ? "var(--gold-glow)" : "var(--ink-2)", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--parchment)" }}>
                        <input type="radio" name="carrier" value={c} checked={carrierType === c} onChange={() => setCarrierType(c)} style={{ accentColor: "var(--gold)" }} />
                        {c === "none" ? "None" : "PNG Chart"}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Seal button */}
            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: "14px", fontSize: "0.85rem" }}
              onClick={handleSeal}
              disabled={stage !== "compose"}
              aria-label="Encrypt, sign and seal message"
            >
              {stage === "compose" && <><Lock size={16} /> Encrypt, Sign & Seal Missive</>}
              {stage === "encrypting" && <><CompassRose size={18} state="verifying" /> Encrypting with AES-256-GCM…</>}
              {stage === "signing" && <><CompassRose size={18} state="verifying" /> Signing with Ed25519…</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SealedView({ envelope, onReset }: { envelope: Record<string, unknown>; onReset: () => void }) {
  return (
    <div className="animate-fade-up">
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <div className="animate-wax-seal" style={{ fontSize: "4rem", marginBottom: "8px" }}>🦑</div>
        <h3 style={{ fontFamily: "var(--font-decorative)", fontSize: "1.4rem", color: "var(--gold)", marginBottom: "8px" }}>
          Missive Sealed & Ready
        </h3>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--parchment-3)", opacity: 0.7 }}>
          Encrypted · Signed · Tamper-Evident
        </p>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="section-label" style={{ marginBottom: "16px" }}>Secure Envelope (Bottled Dispatch)</div>
          <div className="envelope">
            {Object.entries(envelope).map(([k, v]) => (
              <div key={k} className="envelope-field">
                <span className="envelope-key">{k}</span>
                <span className="envelope-value">{String(v)}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card">
            <div className="section-label" style={{ marginBottom: "12px" }}>Seal Verification</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {["Encrypted", "Signed", "Replay ID", "Freshness Set"].map((l) => (
                <div key={l} className="badge badge-pass">{l}</div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="section-label" style={{ marginBottom: "12px" }}>Next Steps</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button className="btn btn-ghost" style={{ width: "100%", fontSize: "0.7rem" }}>
                <Upload size={13} /> Hide in Chart (Stego Lab)
              </button>
              <button className="btn btn-ghost" style={{ width: "100%", fontSize: "0.7rem" }}>
                <FileText size={13} /> Export Envelope JSON
              </button>
              <button className="btn btn-ghost" style={{ width: "100%", fontSize: "0.7rem" }} onClick={onReset}>
                Forge Another Missive
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
