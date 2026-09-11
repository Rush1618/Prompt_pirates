"use client";

import { useState } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import { Key, Shield, RefreshCcw, Copy, Check, AlertTriangle, Plus, Skull } from "lucide-react";

const KEY_STATES = {
  ACTIVE:      { label: "Sailing",          color: "var(--signal-green-bright)",  bg: "var(--signal-green-glow)" },
  ROTATING:    { label: "Changing Colors",  color: "var(--signal-amber-bright)",  bg: "var(--signal-amber-glow)" },
  RETIRED:     { label: "Anchored",         color: "var(--parchment-3)",           bg: "rgba(240,230,200,0.06)" },
  REVOKED:     { label: "Blackspot",        color: "var(--signal-red-bright)",    bg: "var(--signal-red-glow)" },
  COMPROMISED: { label: "Cursed",           color: "var(--signal-red-bright)",    bg: "var(--signal-red-glow)" },
};

type KeyStatus = keyof typeof KEY_STATES;

interface Identity {
  id: string;
  name: string;
  fingerprint: string;
  algorithm: string;
  created: string;
  status: KeyStatus;
  sealMark: string;
}

const DEMO_IDENTITIES: Identity[] = [
  {
    id: "01",
    name: "Captain Vane",
    fingerprint: "4f:8a:2c:91:b3:d5:e7:f2:1a:9c:4d:6e:8b:3f:5a:7c",
    algorithm: "Ed25519",
    created: "2026-09-11",
    status: "ACTIVE",
    sealMark: "seal-mark-4f8a2c91",
  },
  {
    id: "02",
    name: "Quartermaster Flint",
    fingerprint: "a1:c9:3e:7f:2b:d8:5a:0c:6f:e3:9a:1d:4c:8e:2f:b7",
    algorithm: "ECDSA-P256",
    created: "2026-08-15",
    status: "RETIRED",
    sealMark: "seal-mark-a1c93e7f",
  },
  {
    id: "03",
    name: "Navigator Teach",
    fingerprint: "7b:2d:f1:a8:3c:e5:9f:4b:d6:0a:8c:5e:1f:3d:7a:9b",
    algorithm: "Ed25519",
    created: "2026-07-01",
    status: "REVOKED",
    sealMark: "seal-mark-7b2df1a8",
  },
];

export default function IdentityPage() {
  const [identities] = useState<Identity[]>(DEMO_IDENTITIES);
  const [selectedId, setSelectedId] = useState<string | null>("01");
  const [copied, setCopied] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const selected = identities.find((id) => id.id === selectedId);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 1800));
    setGenerating(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Identity Vault</h2>
          <p className="page-subtitle">
            Captain's Seal — cryptographic identity management and key lifecycle
          </p>
        </div>
        <CompassRose size={52} state={generating ? "verifying" : "idle"} />
      </div>

      {/* Generate button */}
      <div
        className="card"
        style={{
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div className="section-label" style={{ marginBottom: "4px" }}>
            Forge New Captain's Seal
          </div>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--parchment-3)", opacity: 0.7 }}>
            Generates Ed25519 keypair in browser — private key stored in IndexedDB, never transmitted
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={generating}
          aria-label="Generate new cryptographic identity"
        >
          {generating ? (
            <><CompassRose size={16} state="verifying" /> Forging Seal…</>
          ) : (
            <><Plus size={14} /> Forge New Seal</>
          )}
        </button>
      </div>

      <div className="grid-2">
        {/* Identity list */}
        <div className="card">
          <div className="section-label" style={{ marginBottom: "16px" }}>
            Known Seals
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {identities.map((identity) => {
              const stateConfig = KEY_STATES[identity.status];
              const isSelected = selectedId === identity.id;
              return (
                <button
                  key={identity.id}
                  onClick={() => setSelectedId(identity.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 14px",
                    borderRadius: "6px",
                    border: `1px solid ${isSelected ? "var(--gold)" : "var(--border)"}`,
                    background: isSelected ? "var(--gold-glow)" : "var(--ink-2)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    width: "100%",
                  }}
                  aria-pressed={isSelected}
                  aria-label={`Select identity ${identity.name}`}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: stateConfig.bg,
                      border: `1px solid ${stateConfig.color}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {identity.status === "REVOKED" || identity.status === "COMPROMISED" ? (
                      <Skull size={14} style={{ color: stateConfig.color }} />
                    ) : (
                      <Key size={14} style={{ color: stateConfig.color }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-display)",
                        fontSize: "0.82rem",
                        color: "var(--parchment)",
                        letterSpacing: "0.03em",
                        marginBottom: "3px",
                      }}
                    >
                      {identity.name}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.58rem",
                        color: "var(--parchment-3)",
                        opacity: 0.6,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {identity.sealMark}
                    </div>
                  </div>
                  <span
                    className="badge"
                    style={{
                      background: stateConfig.bg,
                      borderColor: stateConfig.color,
                      color: stateConfig.color,
                      flexShrink: 0,
                      fontSize: "0.6rem",
                    }}
                  >
                    {stateConfig.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Identity detail */}
        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "var(--font-decorative)",
                      fontSize: "1.1rem",
                      color: "var(--gold)",
                      marginBottom: "4px",
                    }}
                  >
                    {selected.name}
                  </h3>
                  <span
                    className="badge"
                    style={{
                      background: KEY_STATES[selected.status].bg,
                      borderColor: KEY_STATES[selected.status].color,
                      color: KEY_STATES[selected.status].color,
                      fontSize: "0.65rem",
                    }}
                  >
                    {KEY_STATES[selected.status].label}
                  </span>
                </div>
                <CompassRose
                  size={48}
                  state={selected.status === "ACTIVE" ? "verified" : selected.status === "REVOKED" || selected.status === "COMPROMISED" ? "failed" : "idle"}
                />
              </div>

              <div className="envelope">
                {[
                  ["Seal Mark (ID)", selected.sealMark],
                  ["Algorithm", selected.algorithm],
                  ["Created", selected.created],
                  ["Status", `${selected.status} — ${KEY_STATES[selected.status].label}`],
                ].map(([k, v]) => (
                  <div key={k} className="envelope-field">
                    <span className="envelope-key">{k}</span>
                    <span className="envelope-value">{v}</span>
                  </div>
                ))}
              </div>

              {/* Fingerprint */}
              <div style={{ marginTop: "16px" }}>
                <div className="section-label" style={{ marginBottom: "8px" }}>
                  Public Key Fingerprint (SHA-256)
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "var(--ink-4)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    padding: "10px 14px",
                  }}
                >
                  <code
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.65rem",
                      color: "var(--gold)",
                      flex: 1,
                      letterSpacing: "0.04em",
                      wordBreak: "break-all",
                    }}
                  >
                    {selected.fingerprint}
                  </code>
                  <button
                    className="btn btn-ghost"
                    style={{ padding: "4px 8px", fontSize: "0.6rem", flexShrink: 0 }}
                    onClick={() => handleCopy(selected.fingerprint, "fp")}
                    aria-label="Copy fingerprint"
                  >
                    {copied === "fp" ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Key lifecycle actions */}
            <div className="card">
              <div className="section-label" style={{ marginBottom: "12px" }}>
                Key Lifecycle
              </div>
              {selected.status === "ACTIVE" ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button className="btn btn-ghost" style={{ width: "100%", fontSize: "0.75rem" }}>
                    <RefreshCcw size={13} /> Rotate Key (Changing Colors)
                  </button>
                  <button className="btn btn-danger" style={{ width: "100%", fontSize: "0.75rem" }}>
                    <AlertTriangle size={13} /> Revoke Seal (Blackspot)
                  </button>
                </div>
              ) : (
                <div
                  className="badge badge-warn"
                  style={{ width: "100%", justifyContent: "center", padding: "10px" }}
                >
                  <AlertTriangle size={12} />
                  Key is {selected.status} — no new signatures allowed
                </div>
              )}
            </div>

            {/* Security note */}
            <div
              style={{
                background: "rgba(201, 168, 76, 0.06)",
                border: "1px solid var(--border)",
                borderRadius: "6px",
                padding: "12px 14px",
              }}
            >
              <div className="section-label" style={{ marginBottom: "6px" }}>
                <Shield size={10} style={{ display: "inline", marginRight: "6px" }} />
                Security Note
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--parchment-3)", opacity: 0.7, lineHeight: 1.6 }}>
                Private keys are stored as non-extractable CryptoKey objects in IndexedDB. They never leave this browser. Only public key fingerprints are shared with the network.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
