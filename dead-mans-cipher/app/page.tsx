"use client";

import { CompassRose } from "@/components/ui/compass-rose";
import { VerificationBadge } from "@/components/ui/verification-badges";
import {
  Shield,
  Lock,
  AlertTriangle,
  RefreshCcw,
  Users,
  TrendingUp,
  Activity,
  ArrowRight,
  Anchor,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Messages Secured", value: "247", icon: Lock, trend: "+12", color: "var(--gold)" },
  { label: "Verification Failures", value: "3", icon: AlertTriangle, trend: "+1", color: "var(--signal-amber-bright)" },
  { label: "Replay Attempts", value: "8", icon: RefreshCcw, trend: "+2", color: "var(--signal-red-bright)" },
  { label: "Tamper Attempts", value: "5", icon: Shield, trend: "0", color: "var(--signal-red-bright)" },
  { label: "Active Identities", value: "4", icon: Users, trend: "+1", color: "var(--signal-green-bright)" },
];

const recentEvents = [
  { type: "SIGNATURE_VERIFIED", msg: "Rendezvous dispatch — Captain Vane", time: "2m ago", severity: "success" },
  { type: "REPLAY_DETECTED", msg: "Ghost ship intercepted — msgId #a3f2c", time: "11m ago", severity: "critical" },
  { type: "KEY_ROTATED", msg: "Captain's Seal renewed — identity #02", time: "1h ago", severity: "warning" },
  { type: "TAMPER_DETECTED", msg: "Ciphertext modified — dispatch #c9e1", time: "3h ago", severity: "critical" },
  { type: "MESSAGE_SEALED", msg: "Navigation chart sealed into carrier", time: "5h ago", severity: "success" },
];

const severityMap = {
  success: "event-success",
  critical: "event-critical",
  warning: "event-warning",
};

export default function QuarterdeckPage() {
  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-left">
          <h2 className="page-title">The Quarterdeck</h2>
          <p className="page-subtitle">
            Command center — cipher engine status and security intelligence
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.65rem",
              color: "var(--gold-dim)",
              textAlign: "right",
              lineHeight: 1.8,
            }}
          >
            <div>
              <span style={{ color: "var(--signal-green-bright)" }}>●</span> AES-256-GCM ONLINE
            </div>
            <div>
              <span style={{ color: "var(--signal-green-bright)" }}>●</span> Ed25519 SIGNING READY
            </div>
            <div>
              <span style={{ color: "var(--signal-green-bright)" }}>●</span> REPLAY GUARD ACTIVE
            </div>
          </div>
          <CompassRose size={56} state="idle" />
        </div>
      </div>

      {/* Storm Warning Banner */}
      <div
        style={{
          background: "rgba(26, 122, 74, 0.08)",
          border: "1px solid var(--signal-green)",
          borderRadius: "6px",
          padding: "12px 20px",
          marginBottom: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--signal-green-glow)",
              border: "1px solid var(--signal-green)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Anchor size={14} style={{ color: "var(--signal-green-bright)" }} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.8rem",
                color: "var(--signal-green-bright)",
                fontWeight: 600,
                letterSpacing: "0.04em",
              }}
            >
              Storm Warning: LOW — Calm Seas
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--parchment-3)",
                opacity: 0.7,
                marginTop: "2px",
              }}
            >
              Threat score 12 / 100 — All cipher systems nominal
            </div>
          </div>
        </div>
        <Link href="/threat" className="btn btn-ghost" style={{ fontSize: "0.7rem", padding: "6px 12px" }}>
          Full Report <ArrowRight size={12} />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: "32px" }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`card-stat animate-fade-up stagger-${i + 1}`}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: `${stat.color}15`,
                    border: `1px solid ${stat.color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={14} style={{ color: stat.color }} />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: "var(--signal-green-bright)",
                    opacity: 0.8,
                  }}
                >
                  {stat.trend !== "0" ? `${stat.trend} today` : "stable"}
                </span>
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "2rem",
                  fontWeight: 600,
                  color: stat.color,
                  lineHeight: 1,
                  marginBottom: "6px",
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "0.7rem",
                  color: "var(--parchment-3)",
                  opacity: 0.8,
                  letterSpacing: "0.04em",
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main grid */}
      <div className="grid-2" style={{ marginBottom: "32px" }}>
        {/* Recent Events */}
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
              <div className="section-label">Recent Ship's Log Entries</div>
              <p
                style={{
                  fontSize: "0.7rem",
                  color: "var(--parchment-3)",
                  opacity: 0.6,
                  fontFamily: "var(--font-mono)",
                }}
              >
                Hash-linked security events
              </p>
            </div>
            <Activity size={16} style={{ color: "var(--gold-dim)", opacity: 0.6 }} />
          </div>

          <div className="timeline" style={{ paddingLeft: "28px" }}>
            {recentEvents.map((event, i) => (
              <div
                key={i}
                className={`timeline-event ${severityMap[event.severity as keyof typeof severityMap] || ""}`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="event-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--gold)",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                      }}
                    >
                      {event.type}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.6rem",
                        color: "var(--parchment-3)",
                        opacity: 0.5,
                      }}
                    >
                      {event.time}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontFamily: "var(--font-display)",
                      color: "var(--parchment)",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {event.msg}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/audit"
            className="btn btn-ghost"
            style={{ marginTop: "16px", width: "100%", fontSize: "0.7rem" }}
          >
            View Full Ship's Log <ArrowRight size={12} />
          </Link>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Cipher Engine Status */}
          <div className="card" style={{ flex: 1 }}>
            <div className="section-label" style={{ marginBottom: "16px" }}>
              Cipher Engine Status
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                padding: "16px 0",
              }}
            >
              <CompassRose size={80} state="idle" />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "Encryption", status: "pass" as const },
                  { label: "Signing", status: "pass" as const },
                  { label: "Replay Guard", status: "pass" as const },
                  { label: "Audit Chain", status: "pass" as const },
                ].map((item) => (
                  <VerificationBadge key={item.label} label={item.label} status={item.status} />
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="section-label" style={{ marginBottom: "16px" }}>
              Quick Orders
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link href="/compose" className="btn btn-primary">
                <Lock size={14} /> Forge Sealed Missive
              </Link>
              <Link href="/inspect" className="btn btn-ghost">
                <Shield size={14} /> Boarding Inspection
              </Link>
              <Link href="/attack-lab" className="btn btn-danger">
                <TrendingUp size={14} /> Launch Kraken's Trial
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Gate Preview */}
      <div className="card" style={{ marginBottom: "32px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div>
            <div className="section-label">Last Boarding Inspection</div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                color: "var(--parchment-3)",
                opacity: 0.6,
                marginTop: "4px",
              }}
            >
              dispatch #a3f2c9 — Rendezvous Point message — 2 minutes ago
            </p>
          </div>
          <span className="badge badge-pass" style={{ fontSize: "0.65rem" }}>
            All Clear
          </span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {["Schema", "Replay", "Freshness", "Key Status", "Signature", "Integrity"].map((label) => (
            <VerificationBadge key={label} label={label} status="pass" />
          ))}
        </div>
      </div>
    </div>
  );
}
