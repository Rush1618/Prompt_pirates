"use client";

import { useState } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import {
  VerificationGate,
  VerificationStatus,
} from "@/components/ui/verification-badges";
import { MapPin, Lock, Upload, AlertTriangle } from "lucide-react";

type GateStatuses = {
  schema: VerificationStatus;
  replay: VerificationStatus;
  freshness: VerificationStatus;
  keyStatus: VerificationStatus;
  signature: VerificationStatus;
  integrity: VerificationStatus;
};

type InspectionState = "idle" | "running" | "pass" | "fail";

const PENDING_GATES: GateStatuses = {
  schema: "pending",
  replay: "pending",
  freshness: "pending",
  keyStatus: "pending",
  signature: "pending",
  integrity: "pending",
};

const PASS_GATES: GateStatuses = {
  schema: "pass",
  replay: "pass",
  freshness: "pass",
  keyStatus: "pass",
  signature: "pass",
  integrity: "pass",
};

const FAIL_GATES: GateStatuses = {
  schema: "pass",
  replay: "fail",
  freshness: "pass",
  keyStatus: "pass",
  signature: "pass",
  integrity: "pass",
};

const demoEnvelope = {
  version: 1,
  messageId: "f3a9c821-4d2e-47b8-9c01-e5f72a3b8d94",
  senderId: "identity-captain-vane-01",
  recipientId: "identity-quartermaster-02",
  messageType: "navigation",
  createdAt: "2026-09-11T06:10:00.000Z",
  expiresAt: "2026-09-11T10:10:00.000Z",
  algorithm: "AES-256-GCM",
  signatureAlgorithm: "Ed25519",
  nonce: "dGhpcyBpcyBhIG5vbmNl",
  ciphertext: "6Zp3mQ8xK2wL…[256 bytes]",
  signature: "MEQCIBx7p3…[64 bytes]",
  keyId: "seal-mark-4f8a2c91",
  carrier: "image",
  payloadVersion: 1,
};

export default function InspectPage() {
  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [state, setState] = useState<InspectionState>("idle");
  const [gates, setGates] = useState<GateStatuses>(PENDING_GATES);
  const [forceReplay, setForceReplay] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const runInspection = async (failReplay = false) => {
    setState("running");
    setGates(PENDING_GATES);
    setShowMap(false);

    const steps: Array<keyof GateStatuses> = [
      "schema",
      "replay",
      "freshness",
      "keyStatus",
      "signature",
      "integrity",
    ];

    const partialGates = { ...PENDING_GATES };

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 300));
      const key = steps[i];

      if (key === "replay" && failReplay) {
        partialGates[key] = "fail";
        setGates({ ...partialGates });
        setState("fail");
        return;
      }

      partialGates[key] = "pass";
      setGates({ ...partialGates });
    }

    setState("pass");
    setTimeout(() => setShowMap(true), 400);
  };

  const compassState =
    state === "running"
      ? "verifying"
      : state === "pass"
      ? "verified"
      : state === "fail"
      ? "failed"
      : "idle";

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Boarding Inspection</h2>
          <p className="page-subtitle">
            Six-gate verification — Schema → Replay → Freshness → Key Status → Signature → Integrity
          </p>
        </div>
        <CompassRose size={52} state={compassState} />
      </div>

      <div className="grid-2">
        {/* Input panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="card">
            <div className="section-label" style={{ marginBottom: "16px" }}>
              Incoming Dispatch
            </div>

            {/* Mode toggle */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              {(["paste", "upload"] as const).map((mode) => (
                <button
                  key={mode}
                  className={`btn ${inputMode === mode ? "btn-primary" : "btn-ghost"}`}
                  style={{ flex: 1, fontSize: "0.7rem", padding: "8px" }}
                  onClick={() => setInputMode(mode)}
                >
                  {mode === "paste" ? (
                    <><Lock size={12} /> Paste Envelope</>
                  ) : (
                    <><Upload size={12} /> Upload Chart</>
                  )}
                </button>
              ))}
            </div>

            {inputMode === "paste" ? (
              <div>
                <label className="input-label">Secure Envelope JSON</label>
                <textarea
                  className="input"
                  rows={8}
                  defaultValue={JSON.stringify(demoEnvelope, null, 2)}
                  style={{ fontSize: "0.65rem" }}
                  aria-label="Paste envelope JSON"
                />
              </div>
            ) : (
              <div className="chart-canvas-area" style={{ minHeight: "160px" }}>
                <Upload size={32} style={{ color: "var(--gold-dim)", opacity: 0.5, marginBottom: "12px" }} />
                <p style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: "var(--parchment-3)", opacity: 0.7 }}>
                  Upload nautical PNG chart
                </p>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--parchment-3)", opacity: 0.4, marginTop: "4px" }}>
                  LSB steganographic extraction will run first
                </p>
              </div>
            )}

            {/* Demo controls */}
            <div
              style={{
                marginTop: "16px",
                padding: "12px",
                background: "var(--ink-2)",
                borderRadius: "6px",
                border: "1px solid var(--border)",
              }}
            >
              <div className="section-label" style={{ marginBottom: "8px" }}>
                Demo Controls
              </div>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  color: "var(--parchment-3)",
                  marginBottom: "8px",
                }}
              >
                <input
                  type="checkbox"
                  checked={forceReplay}
                  onChange={(e) => setForceReplay(e.target.checked)}
                  style={{ accentColor: "var(--signal-red)" }}
                  aria-label="Simulate replay attack"
                />
                Simulate replay (Ghost Ship) — force replay gate fail
              </label>
            </div>

            <button
              className={`btn ${state === "fail" ? "btn-danger" : "btn-primary"}`}
              style={{ width: "100%", marginTop: "16px", padding: "12px", fontSize: "0.8rem" }}
              onClick={() => runInspection(forceReplay)}
              disabled={state === "running"}
              aria-label="Run boarding inspection"
            >
              {state === "running" ? (
                <><CompassRose size={18} state="verifying" /> Running Inspection…</>
              ) : (
                "⚓ Run Boarding Inspection"
              )}
            </button>
          </div>
        </div>

        {/* Results panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Verification Gate */}
          <div className="card">
            <VerificationGate
              statuses={gates}
              details={{
                schema: "v1 — all required fields present",
                replay: forceReplay && state === "fail" ? "messageId previously consumed — Ghost Ship!" : "messageId not seen before",
                freshness: "expires at 2026-09-11T10:10:00Z — valid",
                keyStatus: "ACTIVE — seal-mark-4f8a2c91",
                signature: "Ed25519 — verified against trusted public key",
                integrity: "AES-GCM authentication tag valid",
              }}
            />
          </div>

          {/* Envelope summary */}
          <div className="card">
            <div className="section-label" style={{ marginBottom: "12px" }}>
              Envelope Summary
            </div>
            <div className="envelope">
              {[
                ["Type", "Navigation Chart"],
                ["Sender", "Captain Vane — seal-mark-4f8a2c91"],
                ["Created", "2026-09-11 06:10 UTC"],
                ["Expires", "2026-09-11 10:10 UTC"],
                ["Algorithm", "AES-256-GCM + Ed25519"],
                ["Carrier", "PNG steganographic chart"],
              ].map(([k, v]) => (
                <div key={k} className="envelope-field">
                  <span className="envelope-key">{k}</span>
                  <span className="envelope-value">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map reveal — gated */}
          <div className="card map-locked">
            <div className="section-label" style={{ marginBottom: "12px" }}>
              <MapPin size={12} style={{ display: "inline", marginRight: "6px" }} />
              X Marks the Spot — Coordinate Reveal
            </div>

            {/* Map placeholder */}
            <div
              style={{
                height: "200px",
                background: "var(--ink-4)",
                borderRadius: "6px",
                position: "relative",
                overflow: "hidden",
                border: "1px solid var(--border)",
              }}
            >
              {/* Nautical chart grid lines background */}
              <svg
                width="100%"
                height="100%"
                style={{ position: "absolute", inset: 0, opacity: 0.15 }}
              >
                {Array.from({ length: 10 }).map((_, i) => (
                  <g key={i}>
                    <line
                      x1={`${i * 10}%`} y1="0" x2={`${i * 10}%`} y2="100%"
                      stroke="var(--gold-dim)" strokeWidth="0.5"
                    />
                    <line
                      x1="0" y1={`${i * 10}%`} x2="100%" y2={`${i * 10}%`}
                      stroke="var(--gold-dim)" strokeWidth="0.5"
                    />
                  </g>
                ))}
              </svg>

              {showMap && state === "pass" ? (
                <div
                  className="animate-fade-in"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  <div style={{ fontSize: "2rem" }}>✕</div>
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.9rem",
                      color: "var(--gold)",
                      textAlign: "center",
                    }}
                  >
                    23.4162° N, 75.7720° E
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "var(--signal-green-bright)",
                    }}
                  >
                    Rendezvous at Gwadar Deep — dawn tide
                  </div>
                </div>
              ) : (
                <div
                  className="map-locked-overlay"
                  style={{ position: "absolute", inset: 0 }}
                >
                  <Lock
                    size={28}
                    className="lock-icon"
                    style={{ color: "var(--gold-dim)", opacity: 0.5 }}
                  />
                  <p
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.8rem",
                      color: "var(--parchment-3)",
                      opacity: 0.6,
                      textAlign: "center",
                    }}
                  >
                    Coordinates locked
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6rem",
                      color: "var(--parchment-3)",
                      opacity: 0.4,
                      textAlign: "center",
                    }}
                  >
                    All six gates must pass before reveal
                  </p>
                  {state === "fail" && (
                    <div
                      className="badge badge-fail"
                      style={{ marginTop: "8px" }}
                    >
                      <AlertTriangle size={10} />
                      Inspection Failed — Access Denied
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
