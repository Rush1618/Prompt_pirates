"use client";

import { CompassRose } from "@/components/ui/compass-rose";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar } from "recharts";
import { AlertTriangle, TrendingUp, Shield, BarChart3 } from "lucide-react";

const threatHistory = [
  { time: "06:00", score: 5 },
  { time: "07:00", score: 8 },
  { time: "08:00", score: 12 },
  { time: "09:00", score: 45 },
  { time: "10:00", score: 72 },
  { time: "11:00", score: 38 },
  { time: "12:00", score: 15 },
];

const eventBreakdown = [
  { name: "Tamper", count: 5 },
  { name: "Replay", count: 8 },
  { name: "Bad Sig", count: 2 },
  { name: "Expired", count: 3 },
  { name: "Key Miss", count: 1 },
  { name: "Corrupt", count: 4 },
];

const riskRadar = [
  { axis: "Ciphertext Integrity", value: 80 },
  { axis: "Identity Auth",        value: 90 },
  { axis: "Replay Resistance",    value: 70 },
  { axis: "Freshness Control",    value: 85 },
  { axis: "Carrier Integrity",    value: 65 },
  { axis: "Audit Coverage",       value: 75 },
];

// Scoring rules (rule-based, not ML):
const THREAT_RULES = [
  { event: "Integrity failure (tamper detected)", score: 40, count: 5 },
  { event: "Invalid signature", score: 30, count: 2 },
  { event: "Replay detected (Ghost Ship)", score: 20, count: 8 },
  { event: "Unknown/revoked sender", score: 15, count: 1 },
  { event: "Expired message", score: 10, count: 3 },
];

const currentScore = 72; // capped at 100
const getLevel = (score: number) => {
  if (score < 25)  return { label: "LOW",      color: "var(--signal-green-bright)",  cssClass: "threat-low" };
  if (score < 50)  return { label: "MEDIUM",   color: "var(--signal-amber-bright)",  cssClass: "threat-medium" };
  if (score < 75)  return { label: "HIGH",     color: "var(--signal-red-bright)",    cssClass: "threat-high" };
  return              { label: "CRITICAL",  color: "var(--signal-red-bright)",    cssClass: "threat-critical" };
};

const level = getLevel(currentScore);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    const score = payload[0].value;
    const l = getLevel(score);
    return (
      <div style={{ background: "var(--ink-3)", border: "1px solid var(--border)", borderRadius: "4px", padding: "8px 12px" }}>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--parchment-3)", marginBottom: "4px" }}>{label}</p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: l.color, fontWeight: 600 }}>
          Score: {score} — {l.label}
        </p>
      </div>
    );
  }
  return null;
};

export default function ThreatPage() {
  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Storm Warning Dashboard</h2>
          <p className="page-subtitle">
            Rule-based threat scoring — integrity failure(40) + invalid sig(30) + replay(20) + unknown sender(15) + expired(10), capped at 100
          </p>
        </div>
        <CompassRose size={52} state={currentScore >= 75 ? "failed" : currentScore >= 50 ? "idle" : "verified"} />
      </div>

      {/* Current threat level */}
      <div
        className="card"
        style={{
          marginBottom: "24px",
          borderColor: level.color,
          boxShadow: `0 0 30px ${level.color}20`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          {/* Score gauge */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={{ position: "relative", width: "100px", height: "100px" }}>
              <svg viewBox="0 0 100 100" width="100" height="100" className="threat-ring">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--ink-4)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke={level.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(currentScore / 100) * 251.2} 251.2`}
                  style={{ filter: `drop-shadow(0 0 6px ${level.color})` }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "1.6rem", fontWeight: 700, color: level.color, lineHeight: 1 }}>
                  {currentScore}
                </span>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--parchment-3)", opacity: 0.6 }}>
                  / 100
                </span>
              </div>
            </div>
            <div>
              <div className="section-label" style={{ marginBottom: "6px" }}>Storm Warning Level</div>
              <div
                className={`threat-level-label ${level.cssClass}`}
                style={{ fontSize: "1.8rem", letterSpacing: "0.1em" }}
              >
                {level.label}
              </div>
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--parchment-3)", opacity: 0.6, marginTop: "4px" }}>
                High threat detected — multiple security events in last hour
              </p>
            </div>
          </div>

          {/* Scoring rules */}
          <div style={{ flex: 1, minWidth: "280px" }}>
            <div className="section-label" style={{ marginBottom: "10px" }}>Active Threat Contributions</div>
            {THREAT_RULES.map((rule) => (
              <div
                key={rule.event}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    color: "var(--signal-red-bright)",
                    fontWeight: 700,
                    flexShrink: 0,
                    textAlign: "right",
                  }}
                >
                  +{rule.score}
                </div>
                <div
                  style={{
                    flex: 1,
                    height: "4px",
                    background: "var(--ink-4)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(rule.score / 40) * 100}%`,
                      height: "100%",
                      background: `linear-gradient(90deg, var(--signal-amber), var(--signal-red))`,
                      borderRadius: "2px",
                    }}
                  />
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--parchment-3)", opacity: 0.7, flex: 1 }}>
                  {rule.event} ({rule.count}×)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts grid */}
      <div className="grid-2" style={{ marginBottom: "24px" }}>
        {/* Score history */}
        <div className="card">
          <div className="section-label" style={{ marginBottom: "16px" }}>
            <TrendingUp size={10} style={{ display: "inline", marginRight: "6px" }} />
            Threat Score History (24h)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={threatHistory} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(201,168,76,0.1)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--parchment-3)", opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--parchment-3)", opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="score"
                fill="var(--gold-dim)"
                radius={[3, 3, 0, 0]}
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Event breakdown */}
        <div className="card">
          <div className="section-label" style={{ marginBottom: "16px" }}>
            <BarChart3 size={10} style={{ display: "inline", marginRight: "6px" }} />
            Security Event Types (24h)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={eventBreakdown} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(201,168,76,0.1)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--parchment-3)", opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--parchment-3)", opacity: 0.6 }}
                axisLine={false}
                tickLine={false}
                width={55}
              />
              <Tooltip
                contentStyle={{ background: "var(--ink-3)", border: "1px solid var(--border)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}
                cursor={{ fill: "rgba(201,168,76,0.05)" }}
              />
              <Bar dataKey="count" fill="var(--signal-red)" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk coverage radar */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="section-label" style={{ marginBottom: "16px" }}>
          <Shield size={10} style={{ display: "inline", marginRight: "6px" }} />
          Security Coverage Radar
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
          <ResponsiveContainer width={300} height={250}>
            <RadarChart data={riskRadar}>
              <PolarGrid stroke="rgba(201,168,76,0.15)" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "var(--parchment-3)", opacity: 0.7 }}
              />
              <Radar
                name="Coverage"
                dataKey="value"
                stroke="var(--gold)"
                fill="var(--gold)"
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
            </RadarChart>
          </ResponsiveContainer>
          <div style={{ flex: 1 }}>
            {riskRadar.map((item) => (
              <div key={item.axis} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "60px", fontFamily: "var(--font-mono)", fontSize: "0.7rem", color: "var(--gold)", fontWeight: 600, textAlign: "right", flexShrink: 0 }}>
                  {item.value}%
                </div>
                <div style={{ flex: 1, height: "4px", background: "var(--ink-4)", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ width: `${item.value}%`, height: "100%", background: `linear-gradient(90deg, var(--gold-dim), var(--gold))`, borderRadius: "2px" }} />
                </div>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--parchment-3)", opacity: 0.7, flex: 1 }}>
                  {item.axis}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Residual risks */}
      <div className="card">
        <div className="section-label" style={{ marginBottom: "12px" }}>
          <AlertTriangle size={10} style={{ display: "inline", marginRight: "6px" }} />
          Disclosed Residual Risks
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          {[
            "Compromised browser/device defeats client-side protection",
            "Basic LSB steganography is statistically detectable",
            "Audit hash chain is tamper-evident, not independently immutable",
            "LSB data destroyed by lossy image compression (JPEG)",
          ].map((risk) => (
            <div
              key={risk}
              style={{
                display: "flex",
                gap: "8px",
                padding: "10px 12px",
                background: "var(--ink-2)",
                borderRadius: "4px",
                border: "1px solid rgba(217,119,6,0.2)",
              }}
            >
              <AlertTriangle size={12} style={{ color: "var(--signal-amber-bright)", flexShrink: 0, marginTop: "2px" }} />
              <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.63rem", color: "var(--parchment-3)", opacity: 0.8, lineHeight: 1.6 }}>
                {risk}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
