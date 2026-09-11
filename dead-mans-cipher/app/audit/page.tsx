"use client";

import { CompassRose } from "@/components/ui/compass-rose";
import { Shield, AlertTriangle, Info, Hash } from "lucide-react";

interface AuditEvent {
  id: string;
  type: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | "SUCCESS";
  actor: string;
  messageId?: string;
  description: string;
  timestamp: string;
  reasonCode?: string;
  eventHash: string;
  previousHash: string;
}

const DEMO_EVENTS: AuditEvent[] = [
  {
    id: "evt-001",
    type: "MESSAGE_SEALED",
    severity: "SUCCESS",
    actor: "Captain Vane — seal-mark-4f8a2c91",
    messageId: "f3a9c821-4d2e-47b8-9c01-e5f72a3b8d94",
    description: "Navigation Chart sealed with AES-256-GCM + Ed25519. Replay protection enabled.",
    timestamp: "2026-09-11T06:10:00Z",
    eventHash: "a3f2c9d1e8b7f6a5c4d3e2f1a0b9c8d7",
    previousHash: "genesis-0000000000000000000000000000",
  },
  {
    id: "evt-002",
    type: "STEGO_EMBED",
    severity: "INFO",
    actor: "Captain Vane — seal-mark-4f8a2c91",
    messageId: "f3a9c821-4d2e-47b8-9c01-e5f72a3b8d94",
    description: "Sealed missive embedded into nautical-chart.png (1920×1080) via LSB steganography. Capacity used: 2,847/1,555,200 bytes.",
    timestamp: "2026-09-11T06:11:23Z",
    eventHash: "b4e3f0c2d9a8e7f6b5c4d3e2f1b0c9d8",
    previousHash: "a3f2c9d1e8b7f6a5c4d3e2f1a0b9c8d7",
  },
  {
    id: "evt-003",
    type: "BOARDING_INSPECTION_PASS",
    severity: "SUCCESS",
    actor: "Quartermaster Flint",
    messageId: "f3a9c821-4d2e-47b8-9c01-e5f72a3b8d94",
    description: "All 6 gates passed. Schema ✓ Replay ✓ Freshness ✓ Key Status ✓ Signature ✓ Integrity ✓. Coordinates revealed.",
    timestamp: "2026-09-11T07:45:10Z",
    eventHash: "c5f4a1d0e9b8f7a6c5d4e3f2c1d0e9b8",
    previousHash: "b4e3f0c2d9a8e7f6b5c4d3e2f1b0c9d8",
  },
  {
    id: "evt-004",
    type: "REPLAY_DETECTED",
    severity: "CRITICAL",
    actor: "Unknown — seal-mark-???",
    messageId: "f3a9c821-4d2e-47b8-9c01-e5f72a3b8d94",
    description: "Ghost Ship detected! messageId f3a9c821 was already consumed at 07:45:10Z. Message rejected at replay gate.",
    timestamp: "2026-09-11T09:02:44Z",
    reasonCode: "MESSAGE_ID_CONSUMED",
    eventHash: "d6a5b2e1f0c9a8b7d6e5f4a3b2c1d0e9",
    previousHash: "c5f4a1d0e9b8f7a6c5d4e3f2c1d0e9b8",
  },
  {
    id: "evt-005",
    type: "TAMPER_DETECTED",
    severity: "CRITICAL",
    actor: "Unknown",
    messageId: "c9e1f2a3-8b4d-42c1-9e7f-d3b5a8f0c2e4",
    description: "AES-GCM authentication tag mismatch. Ciphertext was modified. Message rejected at integrity gate.",
    timestamp: "2026-09-11T10:17:33Z",
    reasonCode: "CIPHERTEXT_TAMPERED",
    eventHash: "e7b6c3f2a1d0e9c8b7a6f5e4d3c2b1a0",
    previousHash: "d6a5b2e1f0c9a8b7d6e5f4a3b2c1d0e9",
  },
  {
    id: "evt-006",
    type: "KEY_REVOKED",
    severity: "WARNING",
    actor: "Captain Vane — seal-mark-4f8a2c91",
    description: "Seal-mark a1c93e7f (Quartermaster Flint) marked as ANCHORED (RETIRED). Historical verification permitted; no new signatures.",
    timestamp: "2026-09-11T11:30:00Z",
    reasonCode: "KEY_RETIRED",
    eventHash: "f8c7d4a3b2e1f0d9c8b7a6f5e4d3c2b1",
    previousHash: "e7b6c3f2a1d0e9c8b7a6f5e4d3c2b1a0",
  },
];

const severityConfig = {
  SUCCESS:  { color: "var(--signal-green-bright)", bg: "var(--signal-green-glow)", icon: "✓", cls: "event-success" },
  INFO:     { color: "var(--signal-blue-bright)",  bg: "rgba(29,78,216,0.1)",     icon: "ℹ", cls: "" },
  WARNING:  { color: "var(--signal-amber-bright)", bg: "var(--signal-amber-glow)", icon: "⚠", cls: "event-warning" },
  CRITICAL: { color: "var(--signal-red-bright)",   bg: "var(--signal-red-glow)",   icon: "✗", cls: "event-critical" },
};

export default function AuditPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Ship's Log</h2>
          <p className="page-subtitle">
            Hash-linked audit trail — each event commits SHA-256(canonicalEvent + prevHash)
          </p>
        </div>
        <CompassRose size={52} state="idle" />
      </div>

      {/* Chain integrity banner */}
      <div
        className="card"
        style={{
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          borderColor: "var(--signal-green)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Shield size={18} style={{ color: "var(--signal-green-bright)" }} />
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "0.82rem", color: "var(--signal-green-bright)", fontWeight: 600 }}>
              Chain Integrity: VALID — 6 events linked
            </div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--parchment-3)", opacity: 0.6, marginTop: "3px" }}>
              Tamper-evident (not tamper-proof) — an attacker with full DB control could rewrite the chain
            </p>
          </div>
        </div>
        <div className="badge badge-warn" style={{ fontSize: "0.6rem" }}>
          <Info size={10} />
          External anchoring not implemented — residual risk
        </div>
      </div>

      {/* Chain formula */}
      <div
        style={{
          background: "var(--ink-4)",
          border: "1px solid var(--border)",
          borderRadius: "6px",
          padding: "12px 16px",
          marginBottom: "24px",
        }}
      >
        <div className="section-label" style={{ marginBottom: "8px" }}>
          <Hash size={10} style={{ display: "inline", marginRight: "6px" }} />
          Hash Chain Formula
        </div>
        <code style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", letterSpacing: "0.04em" }}>
          eventHash = SHA-256(JCS(canonicalEvent) ‖ previousEventHash)
        </code>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--parchment-3)", opacity: 0.6, marginTop: "6px" }}>
          Each event commits to the previous, forming a detectable tamper chain. The audit log is append-only from the client (RLS: INSERT only, no UPDATE/DELETE).
        </p>
      </div>

      {/* Timeline */}
      <div className="timeline">
        {DEMO_EVENTS.map((event, i) => {
          const config = severityConfig[event.severity];
          return (
            <div
              key={event.id}
              className={`timeline-event ${config.cls} animate-fade-up`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div
                className="event-card"
                style={{ borderColor: `${config.color}25` }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "10px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: config.color,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                        }}
                      >
                        {config.icon} {event.type}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.55rem",
                          color: config.color,
                          background: config.bg,
                          border: `1px solid ${config.color}40`,
                          borderRadius: "3px",
                          padding: "1px 6px",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {event.severity}
                      </span>
                      {event.reasonCode && (
                        <span
                          style={{
                            fontFamily: "var(--font-mono)",
                            fontSize: "0.55rem",
                            color: "var(--signal-amber-bright)",
                            background: "var(--signal-amber-glow)",
                            border: "1px solid var(--signal-amber)",
                            borderRadius: "3px",
                            padding: "1px 6px",
                            letterSpacing: "0.06em",
                          }}
                        >
                          {event.reasonCode}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.78rem",
                        color: "var(--parchment)",
                        letterSpacing: "0.02em",
                        lineHeight: 1.4,
                      }}
                    >
                      {event.description}
                    </p>
                  </div>
                  <div
                    style={{
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--parchment-3)",
                        opacity: 0.6,
                      }}
                    >
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.58rem",
                        color: "var(--parchment-3)",
                        opacity: 0.4,
                        marginTop: "2px",
                      }}
                    >
                      {new Date(event.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Actor + messageId */}
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    flexWrap: "wrap",
                    paddingTop: "8px",
                    borderTop: "1px solid var(--border)",
                    marginBottom: "8px",
                  }}
                >
                  <div>
                    <span className="section-label" style={{ fontSize: "0.55rem" }}>Actor</span>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--parchment-3)", opacity: 0.8 }}>
                      {event.actor}
                    </div>
                  </div>
                  {event.messageId && (
                    <div>
                      <span className="section-label" style={{ fontSize: "0.55rem" }}>Message ID</span>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--gold-dim)" }}>
                        {event.messageId.slice(0, 8)}…
                      </div>
                    </div>
                  )}
                </div>

                {/* Hash chain */}
                <div className="event-hash">
                  <span style={{ color: "var(--gold-dim)", opacity: 0.4, marginRight: "6px" }}>prev:</span>
                  {event.previousHash.slice(0, 32)}…
                  <br />
                  <span style={{ color: "var(--gold-dim)", opacity: 0.4, marginRight: "6px" }}>hash:</span>
                  {event.eventHash.slice(0, 32)}…
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
