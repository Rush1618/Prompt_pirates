"use client";

import { useState } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import { Swords, AlertTriangle, CheckCircle2, XCircle, Play } from "lucide-react";

interface Attack {
  id: string;
  name: string;
  pirateDesc: string;
  technicalDesc: string;
  reasonCode: string;
  disposition: string;
  severity: "MEDIUM" | "HIGH" | "CRITICAL";
}

const ATTACKS: Attack[] = [
  {
    id: "bit-flip",
    name: "Modify the Ciphertext",
    pirateDesc: "Tamper with the sealed missive — flip a bit in the encrypted cargo",
    technicalDesc: "Modify one byte of the AES-GCM ciphertext. The authentication tag will fail to validate, proving the message was altered.",
    reasonCode: "CIPHERTEXT_TAMPERED",
    disposition: "MESSAGE_REJECTED",
    severity: "HIGH",
  },
  {
    id: "invalid-sig",
    name: "Forge the Captain's Mark",
    pirateDesc: "Replace the signature with a forged mark — attempt to impersonate the sender",
    technicalDesc: "Substitute an Ed25519 signature signed by a different key. Verification against the registered public key fingerprint will fail.",
    reasonCode: "SIGNATURE_INVALID",
    disposition: "MESSAGE_REJECTED",
    severity: "CRITICAL",
  },
  {
    id: "replay",
    name: "Ghost Ship — Replay Attack",
    pirateDesc: "Re-send a previously accepted missive, hoping the receiver is fooled twice",
    technicalDesc: "Submit a messageId that has already been consumed. The replay tracker rejects any ID seen before, regardless of validity.",
    reasonCode: "MESSAGE_ID_CONSUMED",
    disposition: "MESSAGE_REJECTED",
    severity: "HIGH",
  },
  {
    id: "expired",
    name: "Deliver a Stale Dispatch",
    pirateDesc: "Send a message past its expiry — an old order from a dead captain",
    technicalDesc: "Set expiresAt to a past timestamp. The freshness check compares against the current UTC clock and rejects expired messages.",
    reasonCode: "MESSAGE_EXPIRED",
    disposition: "MESSAGE_REJECTED",
    severity: "MEDIUM",
  },
  {
    id: "corrupt-carrier",
    name: "Corrupt the Chart Carrier",
    pirateDesc: "Damage the nautical chart mid-voyage — the hidden payload becomes unreadable",
    technicalDesc: "Flip random bytes in the carrier image. The LSB extractor's magic-byte and checksum validation detect the corruption before attempting JSON parse.",
    reasonCode: "CARRIER_CORRUPTED",
    disposition: "EXTRACTION_FAILED",
    severity: "MEDIUM",
  },
  {
    id: "wrong-key",
    name: "Board with Wrong Colors",
    pirateDesc: "Present the wrong Captain's Seal during inspection — claim to be who you are not",
    technicalDesc: "Attempt verification using a public key that doesn't match the envelope's keyId. The key status and signature checks both fail.",
    reasonCode: "KEY_MISMATCH",
    disposition: "MESSAGE_REJECTED",
    severity: "CRITICAL",
  },
];

const severityColors = {
  MEDIUM:   { color: "var(--signal-amber-bright)",  bg: "var(--signal-amber-glow)" },
  HIGH:     { color: "var(--signal-red-bright)",    bg: "var(--signal-red-glow)" },
  CRITICAL: { color: "var(--signal-red-bright)",    bg: "var(--signal-red-glow)" },
};

type AttackState = "idle" | "executing" | "completed";

export default function AttackLabPage() {
  const [states, setStates] = useState<Record<string, AttackState>>({});
  const [results, setResults] = useState<Record<string, { log: string[]; reasonCode: string; disposition: string }>>({});

  const runAttack = async (attack: Attack) => {
    setStates((s) => ({ ...s, [attack.id]: "executing" }));
    const logLines: string[] = [];

    // Simulate step-by-step log output
    const logs: Record<string, string[]> = {
      "bit-flip":      ["→ Envelope received", "→ Schema validated ✓", "→ Replay check passed ✓", "→ Freshness check passed ✓", "→ Key status ACTIVE ✓", "→ Signature verified ✓", "→ Decrypting AES-256-GCM…", "✗ Auth tag mismatch — ciphertext tampered"],
      "invalid-sig":   ["→ Envelope received", "→ Schema validated ✓", "→ Replay check passed ✓", "→ Freshness check passed ✓", "→ Key status ACTIVE ✓", "→ Verifying Ed25519 signature…", "✗ Signature invalid — does not match public key 4f:8a:2c:91"],
      "replay":        ["→ Envelope received", "→ Schema validated ✓", "→ Checking messageId f3a9c821…", "✗ messageId already consumed — Ghost Ship detected!"],
      "expired":       ["→ Envelope received", "→ Schema validated ✓", "→ Replay check passed ✓", "→ Freshness check: expiresAt 2024-01-01T00:00:00Z vs now 2026-09-11T…", "✗ Message expired — dispatch is stale"],
      "corrupt-carrier":["→ Chart upload received", "→ Reading LSBs from pixel channels…", "→ Magic bytes: 0xDE 0xAD — match ✓", "→ Payload length: 2847 bytes", "→ Reading payload…", "→ SHA-256 checksum: expected a3f2c9… got deadbeef…", "✗ Checksum mismatch — carrier corrupted"],
      "wrong-key":     ["→ Envelope received", "→ Schema validated ✓", "→ Replay check passed ✓", "→ Freshness check passed ✓", "→ Key lookup: seal-mark-4f8a2c91 → ACTIVE", "→ Verifying signature with presented key…", "✗ Key mismatch — presented key does not match keyId in envelope"],
    };

    const attackLogs = logs[attack.id] || ["→ Attack simulation running…", "✗ Attack detected and rejected"];
    for (const line of attackLogs) {
      await new Promise((r) => setTimeout(r, 280 + Math.random() * 120));
      logLines.push(line);
      setResults((r) => ({
        ...r,
        [attack.id]: { log: [...logLines], reasonCode: attack.reasonCode, disposition: attack.disposition },
      }));
    }

    setStates((s) => ({ ...s, [attack.id]: "completed" }));
  };

  const allCompleted = ATTACKS.every((a) => states[a.id] === "completed");

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">The Kraken's Trial</h2>
          <p className="page-subtitle">
            Safe, deterministic attack simulations — each produces a reason code and is logged to the Ship's Log
          </p>
        </div>
        <Swords size={40} style={{ color: "var(--signal-red)", opacity: 0.7 }} />
      </div>

      {/* Run all */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.7rem",
            color: "var(--parchment-3)",
            opacity: 0.7,
          }}
        >
          {allCompleted
            ? "All attacks simulated — every attempt was detected and rejected."
            : "Select an attack to simulate, or run all in sequence."}
        </p>
        <button
          className="btn btn-danger"
          onClick={async () => {
            for (const attack of ATTACKS) {
              await runAttack(attack);
              await new Promise((r) => setTimeout(r, 300));
            }
          }}
          disabled={Object.values(states).some((s) => s === "executing")}
          aria-label="Run all attacks in sequence"
        >
          <Swords size={14} /> Unleash the Kraken
        </button>
      </div>

      {/* Attack cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {ATTACKS.map((attack, i) => {
          const state = states[attack.id] || "idle";
          const result = results[attack.id];
          const sc = severityColors[attack.severity];

          return (
            <div
              key={attack.id}
              className={`attack-card ${state === "executing" ? "executing" : state === "completed" ? "completed" : ""} animate-fade-up stagger-${i + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: sc.color,
                        background: sc.bg,
                        border: `1px solid ${sc.color}`,
                        borderRadius: "3px",
                        padding: "1px 6px",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {attack.severity}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "0.88rem",
                      color: "var(--parchment)",
                      letterSpacing: "0.03em",
                      marginBottom: "4px",
                    }}
                  >
                    {attack.name}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.63rem",
                      color: "var(--parchment-3)",
                      opacity: 0.7,
                      lineHeight: 1.5,
                      fontStyle: "italic",
                    }}
                  >
                    "{attack.pirateDesc}"
                  </p>
                </div>
                {state === "executing" ? (
                  <CompassRose size={28} state="verifying" />
                ) : state === "completed" ? (
                  <XCircle size={22} style={{ color: "var(--signal-red-bright)", flexShrink: 0 }} />
                ) : (
                  <button
                    className="btn btn-danger"
                    style={{ padding: "6px 12px", fontSize: "0.65rem", flexShrink: 0 }}
                    onClick={() => runAttack(attack)}
                    aria-label={`Run ${attack.name} attack simulation`}
                  >
                    <Play size={10} /> Run
                  </button>
                )}
              </div>

              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.63rem",
                  color: "var(--parchment-3)",
                  opacity: 0.6,
                  lineHeight: 1.6,
                  marginBottom: "12px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                {attack.technicalDesc}
              </p>

              {/* Log output */}
              {result && (
                <div className="attack-result">
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.62rem",
                      lineHeight: 2,
                      color: "var(--parchment-3)",
                    }}
                  >
                    {result.log.map((line, idx) => (
                      <div
                        key={idx}
                        style={{
                          color: line.startsWith("✗")
                            ? "var(--signal-red-bright)"
                            : line.includes("✓")
                            ? "var(--signal-green-bright)"
                            : "var(--parchment-3)",
                          opacity: line.startsWith("✗") || line.includes("✓") ? 1 : 0.7,
                        }}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                  {state === "completed" && (
                    <div style={{ marginTop: "10px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.6rem",
                          color: "var(--signal-amber-bright)",
                          background: "var(--signal-amber-glow)",
                          border: "1px solid var(--signal-amber)",
                          borderRadius: "3px",
                          padding: "2px 8px",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {result.reasonCode}
                      </span>
                      <span className="disposition-badge">{result.disposition}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
