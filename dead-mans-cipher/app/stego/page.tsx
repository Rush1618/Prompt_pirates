"use client";

import { useState } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import { Upload, Download, AlertTriangle, CheckCircle2, Info } from "lucide-react";

type StegoState = "idle" | "embedding" | "done" | "error";
type ExtractState = "idle" | "extracting" | "done" | "error";

export default function StegoPage() {
  const [embedState, setEmbedState] = useState<StegoState>("idle");
  const [extractState, setExtractState] = useState<ExtractState>("idle");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [capacity] = useState({ used: 0, total: 48231, percent: 0 });
  const [activeTab, setActiveTab] = useState<"embed" | "extract">("embed");

  const handleEmbed = async () => {
    setEmbedState("embedding");
    await new Promise((r) => setTimeout(r, 2000));
    setEmbedState("done");
  };

  const handleExtract = async () => {
    setExtractState("extracting");
    await new Promise((r) => setTimeout(r, 1500));
    setExtractState("done");
  };

  const mockCapacity = {
    imageSize: "1920 × 1080 px",
    channels: 3,
    bitsPerChannel: 2,
    totalBits: 1920 * 1080 * 3 * 2,
    headerOverhead: 32,
    usableBytes: Math.floor((1920 * 1080 * 3 * 2) / 8) - 32,
    payloadSize: 2847,
  };

  const usedPercent = Math.round((mockCapacity.payloadSize / mockCapacity.usableBytes) * 100);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Steganography Lab</h2>
          <p className="page-subtitle">
            Seal into the Chart — LSB pixel embedding for encrypted payload concealment
          </p>
        </div>
        <CompassRose
          size={52}
          state={embedState === "embedding" || extractState === "extracting" ? "verifying" : "idle"}
        />
      </div>

      {/* Educational disclaimer */}
      <div
        style={{
          background: "rgba(201, 168, 76, 0.06)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          padding: "12px 16px",
          marginBottom: "24px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-start",
        }}
      >
        <Info size={14} style={{ color: "var(--gold-dim)", flexShrink: 0, marginTop: "2px" }} />
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--parchment-3)", opacity: 0.8, lineHeight: 1.7 }}>
          <strong style={{ color: "var(--gold)" }}>Steganography ≠ Encryption.</strong> Concealment hides the existence of a payload — cryptography protects its content. This lab embeds an <em>already-encrypted</em> envelope into LSBs of image pixels. Basic LSB steganography is statistically detectable and destroyed by lossy formats (JPEG). Always encrypt first; steganography is a carrier, not a security boundary.
        </p>
      </div>

      {/* Tab toggle */}
      <div
        style={{
          display: "flex",
          gap: "4px",
          marginBottom: "24px",
          background: "var(--ink-2)",
          padding: "4px",
          borderRadius: "8px",
          border: "1px solid var(--border)",
          width: "fit-content",
        }}
      >
        {(["embed", "extract"] as const).map((tab) => (
          <button
            key={tab}
            className={`btn ${activeTab === tab ? "btn-primary" : "btn-ghost"}`}
            style={{ fontSize: "0.75rem", padding: "8px 20px", border: "none" }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "embed" ? "Seal into Chart" : "Unseal the Chart"}
          </button>
        ))}
      </div>

      {activeTab === "embed" ? (
        <div className="grid-2">
          {/* Left: Controls */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Chart upload */}
            <div className="card">
              <div className="section-label" style={{ marginBottom: "12px" }}>
                Carrier Chart (PNG Only)
              </div>
              <div
                className={`chart-canvas-area ${imagePreview ? "has-image" : ""}`}
                style={{ minHeight: "160px" }}
                onClick={() => {}}
                role="button"
                tabIndex={0}
                aria-label="Upload carrier PNG image"
              >
                {imagePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imagePreview} alt="Carrier chart" style={{ width: "100%", height: "160px", objectFit: "cover" }} />
                ) : (
                  <>
                    <Upload size={28} style={{ color: "var(--gold-dim)", opacity: 0.5, marginBottom: "10px" }} />
                    <p style={{ fontFamily: "var(--font-display)", fontSize: "0.78rem", color: "var(--parchment-3)", opacity: 0.7 }}>
                      Drop nautical PNG chart here
                    </p>
                    <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--parchment-3)", opacity: 0.4, marginTop: "4px" }}>
                      Lossless PNG only — max 10 MB
                    </p>
                  </>
                )}
              </div>

              {/* Demo: show capacity for a demo 1920×1080 image */}
              <div style={{ marginTop: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span className="section-label" style={{ marginBottom: 0 }}>
                    Carrier Capacity
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      color: usedPercent > 80 ? "var(--signal-amber-bright)" : "var(--signal-green-bright)",
                    }}
                  >
                    {mockCapacity.payloadSize.toLocaleString()} / {mockCapacity.usableBytes.toLocaleString()} bytes ({usedPercent}%)
                  </span>
                </div>
                <div className="capacity-bar">
                  <div
                    className={`capacity-fill ${usedPercent > 80 ? "over" : ""}`}
                    style={{ width: `${Math.min(usedPercent, 100)}%` }}
                    role="progressbar"
                    aria-valuenow={usedPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Capacity used: ${usedPercent}%`}
                  />
                </div>

                {/* Capacity formula */}
                <div
                  style={{
                    marginTop: "12px",
                    padding: "10px 12px",
                    background: "var(--ink-4)",
                    borderRadius: "4px",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="section-label" style={{ marginBottom: "6px", fontSize: "0.55rem" }}>
                    Capacity Formula
                  </div>
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "var(--gold)",
                      lineHeight: 1.8,
                      display: "block",
                    }}
                  >
                    usable_bits = W × H × channels × bits_per_channel<br />
                    = {mockCapacity.imageSize} × 3 × 2<br />
                    = {mockCapacity.totalBits.toLocaleString()} bits<br />
                    capacity = {mockCapacity.usableBytes.toLocaleString()} bytes − 32 header
                  </code>
                </div>
              </div>
            </div>

            {/* Payload */}
            <div className="card">
              <div className="section-label" style={{ marginBottom: "12px" }}>
                Payload (Sealed Envelope)
              </div>
              <div
                style={{
                  padding: "10px 12px",
                  background: "var(--ink-4)",
                  borderRadius: "4px",
                  border: "1px solid var(--signal-green)",
                  marginBottom: "12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <CheckCircle2 size={12} style={{ color: "var(--signal-green-bright)", flexShrink: 0 }} />
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--signal-green-bright)" }}>
                    Sealed missive attached — f3a9c821
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--parchment-3)", opacity: 0.6, marginTop: "2px" }}>
                    Navigation Chart · AES-256-GCM + Ed25519 · 2,847 bytes
                  </div>
                </div>
              </div>

              <div className="section-label" style={{ marginBottom: "8px" }}>
                Embedding Configuration
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label className="input-label">Bits per channel</label>
                  <select className="input" defaultValue="2" aria-label="Bits per channel">
                    <option value="1">1 bit (minimal)</option>
                    <option value="2">2 bits (balanced)</option>
                    <option value="4">4 bits (dense)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Channels</label>
                  <select className="input" defaultValue="RGB" aria-label="Pixel channels">
                    <option>RGB (3 channels)</option>
                    <option>R only (1 channel)</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: "0.8rem" }}
              onClick={handleEmbed}
              disabled={embedState === "embedding"}
              aria-label="Embed payload into chart"
            >
              {embedState === "embedding" ? (
                <><CompassRose size={18} state="verifying" /> Sealing into Chart…</>
              ) : embedState === "done" ? (
                <><CheckCircle2 size={16} /> Sealed — Download Chart</>
              ) : (
                "🗺 Seal Missive into Chart"
              )}
            </button>

            {embedState === "done" && (
              <button className="btn btn-ghost" style={{ width: "100%", fontSize: "0.75rem" }}>
                <Download size={14} /> Download Steganographic Chart
              </button>
            )}
          </div>

          {/* Right: Protocol info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card">
              <div className="section-label" style={{ marginBottom: "16px" }}>
                LSB Protocol Header
              </div>
              <div className="envelope">
                {[
                  ["Magic bytes", "0xDEAD 0xC1PH — identifies carrier"],
                  ["Protocol version", "0x01 — 1 byte"],
                  ["Payload length", "4 bytes, big-endian uint32"],
                  ["Checksum", "SHA-256 of payload, 32 bytes"],
                  ["Payload start", "Byte 39 onward"],
                  ["Channels", "R, G, B (alpha untouched)"],
                  ["Bit order", "MSB first within each pixel byte"],
                ].map(([k, v]) => (
                  <div key={k} className="envelope-field">
                    <span className="envelope-key">{k}</span>
                    <span className="envelope-value">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="section-label" style={{ marginBottom: "12px" }}>
                Security Properties
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "Encrypts before hiding", ok: true },
                  { label: "Alpha channel unmodified", ok: true },
                  { label: "Header validates before parse", ok: true },
                  { label: "Length check before decode", ok: true },
                  { label: "Statistically undetectable", ok: false, note: "Basic LSB is detectable — residual risk" },
                  { label: "Survives JPEG conversion", ok: false, note: "Lossy compression destroys LSB data" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}
                  >
                    {item.ok ? (
                      <CheckCircle2 size={12} style={{ color: "var(--signal-green-bright)", flexShrink: 0, marginTop: "2px" }} />
                    ) : (
                      <AlertTriangle size={12} style={{ color: "var(--signal-amber-bright)", flexShrink: 0, marginTop: "2px" }} />
                    )}
                    <div>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", color: "var(--parchment)" }}>
                        {item.label}
                      </span>
                      {item.note && (
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--signal-amber-bright)", opacity: 0.8, marginTop: "2px" }}>
                          {item.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Extract tab */
        <div className="grid-2">
          <div className="card">
            <div className="section-label" style={{ marginBottom: "12px" }}>
              Suspected Carrier Chart
            </div>
            <div className="chart-canvas-area" style={{ minHeight: "200px" }}>
              <Upload size={28} style={{ color: "var(--gold-dim)", opacity: 0.5, marginBottom: "10px" }} />
              <p style={{ fontFamily: "var(--font-display)", fontSize: "0.78rem", color: "var(--parchment-3)", opacity: 0.7 }}>
                Upload chart to inspect for hidden payload
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "16px", padding: "12px", fontSize: "0.8rem" }}
              onClick={handleExtract}
              disabled={extractState === "extracting"}
              aria-label="Extract payload from chart"
            >
              {extractState === "extracting" ? (
                <><CompassRose size={18} state="verifying" /> Unsealing Chart…</>
              ) : extractState === "done" ? (
                "Payload Extracted — Forward to Boarding Inspection →"
              ) : (
                "🔍 Unseal the Chart"
              )}
            </button>
          </div>
          <div className="card">
            <div className="section-label" style={{ marginBottom: "16px" }}>Extraction Log</div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--parchment-3)",
                lineHeight: 2,
                opacity: 0.7,
              }}
            >
              {extractState === "idle" && "Awaiting carrier chart…"}
              {extractState === "extracting" && (
                <>
                  <span style={{ color: "var(--gold)" }}>→</span> Reading LSBs from pixel channels…<br />
                  <span style={{ color: "var(--gold)" }}>→</span> Validating magic bytes 0xDEAD 0xC1PH…<br />
                  <span style={{ color: "var(--gold)" }}>→</span> Reading payload length header…<br />
                  <span style={{ color: "var(--gold)" }}>→</span> Verifying SHA-256 checksum…
                </>
              )}
              {extractState === "done" && (
                <>
                  <span style={{ color: "var(--signal-green-bright)" }}>✓</span> Magic bytes validated<br />
                  <span style={{ color: "var(--signal-green-bright)" }}>✓</span> Payload length: 2,847 bytes<br />
                  <span style={{ color: "var(--signal-green-bright)" }}>✓</span> Checksum match confirmed<br />
                  <span style={{ color: "var(--signal-green-bright)" }}>✓</span> Envelope JSON deserialized<br />
                  <span style={{ color: "var(--gold)" }}>→</span> Forward to Boarding Inspection to verify & decrypt
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
