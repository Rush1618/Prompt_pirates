"use client";

import { useState, useCallback } from "react";
import { CompassRose } from "@/components/ui/compass-rose";
import { Search, Zap, RotateCcw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// ── English letter frequency table (reference) ──────────────────────────────
const ENGLISH_FREQ: Record<string, number> = {
  E:12.7,T:9.06,A:8.17,O:7.51,I:6.97,N:6.75,S:6.33,H:6.09,
  R:5.99,D:4.25,L:4.03,C:2.78,U:2.76,M:2.41,W:2.36,F:2.23,
  G:2.02,Y:1.97,P:1.93,B:1.49,V:0.98,K:0.77,J:0.15,X:0.15,
  Q:0.10,Z:0.07,
};

const SHANTY_CIPHERTEXT = `Znk bnoy oy gs otzoxkj ykolgtze.
Znk mxkgt xkj jxgmut yng vkxoyn gz ykg.
Jkevknky gx bgotz lux znk cgtzkxotm ynov.
Ruujy rtj voxgzkyz mkgx gx notjkt ot znk znot.`;

const DEMO_VIGENERE = "XHZDW MFQXH AEJWK QPHJX MFAJX WPAHK QZWDM FAJXP";

function analyzeFrequency(text: string): Array<{ letter: string; count: number; percent: number }> {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (!clean.length) return [];
  const counts: Record<string, number> = {};
  for (const ch of clean) counts[ch] = (counts[ch] || 0) + 1;
  return Object.entries(counts)
    .map(([letter, count]) => ({
      letter,
      count,
      percent: parseFloat(((count / clean.length) * 100).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count);
}

function caesarDecrypt(text: string, shift: number): string {
  return text.replace(/[A-Za-z]/g, (ch) => {
    const base = ch >= "a" ? 97 : 65;
    return String.fromCharCode(((ch.charCodeAt(0) - base - shift + 26) % 26) + base);
  });
}

function indexOfCoincidence(text: string): number {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, "");
  if (clean.length < 2) return 0;
  const counts: Record<string, number> = {};
  for (const ch of clean) counts[ch] = (counts[ch] || 0) + 1;
  const n = clean.length;
  const sum = Object.values(counts).reduce((acc, c) => acc + c * (c - 1), 0);
  return sum / (n * (n - 1));
}

type CrackerMode = "frequency" | "brute-force" | "ioc";

export default function CrackerPage() {
  const [mode, setMode] = useState<CrackerMode>("frequency");
  const [ciphertext, setCiphertext] = useState(SHANTY_CIPHERTEXT);
  const [shift, setShift] = useState(6);
  const [crackerRunning, setCrackerRunning] = useState(false);
  const [crackerLog, setCrackerLog] = useState<string[]>([]);
  const [bruteResult, setBruteResult] = useState<Array<{ shift: number; text: string; score: number }>>([]);
  const [freqData, setFreqData] = useState<ReturnType<typeof analyzeFrequency>>([]);
  const [iocValue, setIocValue] = useState<number | null>(null);
  const [manualDecrypt, setManualDecrypt] = useState("");

  // ── Frequency analysis ────────────────────────────────────────────────────
  const runFrequency = useCallback(() => {
    const data = analyzeFrequency(ciphertext);
    setFreqData(data);
    setIocValue(indexOfCoincidence(ciphertext));
  }, [ciphertext]);

  // ── Brute-force Caesar (shift 1-25) ───────────────────────────────────────
  const runBruteForce = useCallback(async () => {
    setCrackerRunning(true);
    setCrackerLog([]);
    setBruteResult([]);

    const log: string[] = [];
    const results: typeof bruteResult = [];

    const COMMON_WORDS = ["THE", "AND", "IS", "OF", "TO", "IN", "FOR", "AT"];
    const score = (text: string) => {
      const upper = text.toUpperCase();
      return COMMON_WORDS.reduce((s, w) => s + (upper.split(w).length - 1), 0);
    };

    for (let s = 1; s <= 25; s++) {
      await new Promise((r) => setTimeout(r, 60));
      const decrypted = caesarDecrypt(ciphertext, s);
      const sc = score(decrypted);
      results.push({ shift: s, text: decrypted.slice(0, 80) + "…", score: sc });
      log.push(`Shift ${String(s).padStart(2, "0")}: score=${sc} — ${decrypted.slice(0, 40)}…`);
      setCrackerLog([...log]);
    }

    results.sort((a, b) => b.score - a.score);
    setBruteResult(results.slice(0, 5));
    setCrackerRunning(false);
  }, [ciphertext]);

  const handleManualShift = useCallback(() => {
    setManualDecrypt(caesarDecrypt(ciphertext, shift));
  }, [ciphertext, shift]);

  const chartData = freqData.slice(0, 12).map((d) => ({
    letter: d.letter,
    cipher: d.percent,
    english: ENGLISH_FREQ[d.letter] ?? 0,
  }));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h2 className="page-title">Cipher Cracker</h2>
          <p className="page-subtitle">
            Frequency analysis · Brute-force simulation · Index of Coincidence — educational attack demonstration
          </p>
        </div>
        <CompassRose size={52} state={crackerRunning ? "verifying" : "idle"} />
      </div>

      {/* Educational disclaimer */}
      <div
        style={{
          background: "rgba(192,57,43,0.06)",
          border: "1px solid rgba(192,57,43,0.3)",
          borderRadius: "6px",
          padding: "10px 16px",
          marginBottom: "24px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
        }}
      >
        <AlertTriangle size={13} style={{ color: "var(--signal-amber-bright)", flexShrink: 0 }} />
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.63rem", color: "var(--parchment-3)", opacity: 0.85, lineHeight: 1.6 }}>
          <strong style={{ color: "var(--signal-amber-bright)" }}>Educational only.</strong> These attacks apply to classical ciphers (Caesar, Vigenère). AES-256-GCM and Ed25519 in the Sealed Missive Forge are computationally infeasible to crack this way — this cracker exists to show <em>why</em> modern authenticated encryption replaced classical methods.
        </p>
      </div>

      <div className="grid-2">
        {/* Left: Input + controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Ciphertext input */}
          <div className="card">
            <div className="section-label" style={{ marginBottom: "12px" }}>Intercepted Ciphertext</div>
            <div style={{ display: "flex", gap: "6px", marginBottom: "10px", flexWrap: "wrap" }}>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.62rem", padding: "4px 10px" }}
                onClick={() => setCiphertext(SHANTY_CIPHERTEXT)}
              >
                Load Shanty (Caesar-6)
              </button>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.62rem", padding: "4px 10px" }}
                onClick={() => setCiphertext(DEMO_VIGENERE)}
              >
                Load Vigenère Sample
              </button>
              <button
                className="btn btn-ghost"
                style={{ fontSize: "0.62rem", padding: "4px 10px" }}
                onClick={() => setCiphertext("")}
              >
                Clear
              </button>
            </div>
            <textarea
              className="input"
              rows={7}
              value={ciphertext}
              onChange={(e) => setCiphertext(e.target.value)}
              style={{ fontSize: "0.72rem", fontFamily: "var(--font-mono)" }}
              placeholder="Paste intercepted ciphertext here…"
              aria-label="Ciphertext input"
            />
          </div>

          {/* Mode selector */}
          <div className="card">
            <div className="section-label" style={{ marginBottom: "12px" }}>Attack Mode</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {([
                { id: "frequency" as CrackerMode, label: "Frequency Analysis", desc: "Compare letter frequencies to known English distribution" },
                { id: "brute-force" as CrackerMode, label: "Brute-Force Caesar", desc: "Try all 25 shifts, score by common word matches" },
                { id: "ioc" as CrackerMode, label: "Index of Coincidence", desc: "Estimate key length for polyalphabetic ciphers (Vigenère)" },
              ] as const).map((m) => (
                <label
                  key={m.id}
                  style={{
                    display: "flex",
                    gap: "10px",
                    padding: "10px 12px",
                    border: `1px solid ${mode === m.id ? "var(--gold)" : "var(--border)"}`,
                    borderRadius: "6px",
                    background: mode === m.id ? "var(--gold-glow)" : "var(--ink-2)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={m.id}
                    checked={mode === m.id}
                    onChange={() => setMode(m.id)}
                    style={{ accentColor: "var(--gold)", marginTop: "2px" }}
                  />
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: "0.8rem", color: "var(--parchment)" }}>
                      {m.label}
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--parchment-3)", opacity: 0.6, marginTop: "2px" }}>
                      {m.desc}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Manual shift (for brute-force mode) */}
            {mode === "brute-force" && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "10px" }}>
                  <label className="input-label" style={{ margin: 0, flexShrink: 0 }}>Manual shift (1–25):</label>
                  <input
                    type="range"
                    min={1} max={25} step={1}
                    value={shift}
                    onChange={(e) => setShift(parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: "var(--gold)" }}
                    aria-label={`Caesar shift: ${shift}`}
                  />
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--gold)", fontWeight: 700, minWidth: "24px" }}>
                    {shift}
                  </span>
                </div>
                <button className="btn btn-ghost" style={{ width: "100%", fontSize: "0.7rem" }} onClick={handleManualShift}>
                  <RotateCcw size={12} /> Apply Shift {shift} Manually
                </button>
              </div>
            )}

            <button
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "16px", padding: "12px", fontSize: "0.8rem" }}
              onClick={mode === "brute-force" ? runBruteForce : runFrequency}
              disabled={crackerRunning || !ciphertext.trim()}
              aria-label="Run cipher attack"
            >
              {crackerRunning ? (
                <><CompassRose size={16} state="verifying" /> Cracking…</>
              ) : (
                <><Search size={14} /> Run {mode === "frequency" ? "Frequency Analysis" : mode === "brute-force" ? "Brute-Force" : "IoC Analysis"}</>
              )}
            </button>
          </div>
        </div>

        {/* Right: Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Frequency chart */}
          {mode === "frequency" && freqData.length > 0 && (
            <div className="card">
              <div className="section-label" style={{ marginBottom: "16px" }}>
                Letter Frequency — Cipher vs. English
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(201,168,76,0.1)" />
                  <XAxis dataKey="letter" tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--parchment-3)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontFamily: "var(--font-mono)", fill: "var(--parchment-3)", opacity: 0.6 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--ink-3)", border: "1px solid var(--border)", borderRadius: "4px", fontFamily: "var(--font-mono)", fontSize: "0.62rem" }}
                    formatter={(val, name) => [`${val}%`, name === "cipher" ? "Ciphertext" : "English avg"]}
                  />
                  <Bar dataKey="cipher" fill="var(--gold)" radius={[3,3,0,0]} name="cipher" />
                  <Bar dataKey="english" fill="rgba(26,122,74,0.5)" radius={[3,3,0,0]} name="english" />
                </BarChart>
              </ResponsiveContainer>

              {/* Most likely shift suggestion */}
              {freqData[0] && (
                <div style={{ marginTop: "12px", padding: "10px 12px", background: "var(--ink-4)", borderRadius: "6px", border: "1px solid var(--border)" }}>
                  <div className="section-label" style={{ marginBottom: "6px" }}>Shift Hypothesis</div>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--parchment)", lineHeight: 1.7 }}>
                    Most frequent cipher letter: <strong style={{ color: "var(--gold)" }}>{freqData[0].letter}</strong> ({freqData[0].percent}%)<br />
                    English most frequent: <strong style={{ color: "var(--signal-green-bright)" }}>E</strong> (12.7%)<br />
                    Suggested Caesar shift: <strong style={{ color: "var(--signal-amber-bright)" }}>
                      {((freqData[0].letter.charCodeAt(0) - 69 + 26) % 26)} (try it in Brute-Force mode)
                    </strong>
                  </p>
                </div>
              )}

              {/* Top 8 frequencies */}
              <div style={{ marginTop: "12px" }}>
                <div className="section-label" style={{ marginBottom: "8px" }}>Full Frequency Table</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "4px" }}>
                  {freqData.slice(0, 16).map((d) => (
                    <div key={d.letter} style={{ display: "flex", justifyContent: "space-between", padding: "3px 6px", background: "var(--ink-4)", borderRadius: "3px", border: "1px solid var(--border)" }}>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--gold)", fontWeight: 700 }}>{d.letter}</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--parchment-3)", opacity: 0.7 }}>{d.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* IoC result */}
          {mode === "ioc" && iocValue !== null && (
            <div className="card">
              <div className="section-label" style={{ marginBottom: "16px" }}>Index of Coincidence Result</div>
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "3rem", fontWeight: 700, color: "var(--gold)", marginBottom: "8px" }}>
                  {iocValue.toFixed(4)}
                </div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "0.9rem", color: "var(--parchment-3)", marginBottom: "16px" }}>
                  {iocValue > 0.065 ? (
                    <span style={{ color: "var(--signal-amber-bright)" }}>
                      ≈ Monoalphabetic (Caesar / Substitution) — IoC close to English 0.0667
                    </span>
                  ) : iocValue > 0.045 ? (
                    <span style={{ color: "var(--signal-amber-bright)" }}>
                      ≈ Polyalphabetic (Vigenère) — IoC between random(0.0385) and English(0.0667)
                    </span>
                  ) : (
                    <span style={{ color: "var(--signal-red-bright)" }}>
                      ≈ Random / Strong cipher — IoC near 0.0385 (random English)
                    </span>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                  {[
                    { label: "Random text", val: "0.0385", color: "var(--signal-red-bright)" },
                    { label: "Measured", val: iocValue.toFixed(4), color: "var(--gold)" },
                    { label: "English text", val: "0.0667", color: "var(--signal-green-bright)" },
                  ].map((item) => (
                    <div key={item.label} style={{ padding: "10px", background: "var(--ink-4)", borderRadius: "6px", border: "1px solid var(--border)", textAlign: "center" }}>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "1rem", color: item.color, fontWeight: 700 }}>{item.val}</div>
                      <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--parchment-3)", opacity: 0.6, marginTop: "4px" }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Brute-force log */}
          {mode === "brute-force" && (crackerLog.length > 0 || bruteResult.length > 0) && (
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {bruteResult.length > 0 && (
                <>
                  <div>
                    <div className="section-label" style={{ marginBottom: "10px" }}>
                      <CheckCircle2 size={10} style={{ display: "inline", marginRight: "6px", color: "var(--signal-green-bright)" }} />
                      Top 5 Candidates
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {bruteResult.map((r, i) => (
                        <div key={r.shift} style={{ padding: "10px 12px", background: "var(--ink-4)", borderRadius: "6px", border: `1px solid ${i === 0 ? "var(--gold)" : "var(--border)"}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: i === 0 ? "var(--gold)" : "var(--parchment-3)", fontWeight: i === 0 ? 700 : 400 }}>
                              Shift {r.shift} {i === 0 ? "★ Best match" : ""}
                            </span>
                            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--signal-green-bright)" }}>
                              score: {r.score}
                            </span>
                          </div>
                          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--parchment-3)", opacity: 0.8, lineHeight: 1.5 }}>
                            {r.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <hr className="gold-divider" />
                </>
              )}

              {/* Log output */}
              <div>
                <div className="section-label" style={{ marginBottom: "8px" }}>Brute-Force Log</div>
                <div
                  style={{
                    background: "var(--ink-4)",
                    border: "1px solid var(--border)",
                    borderRadius: "4px",
                    padding: "10px 12px",
                    maxHeight: "220px",
                    overflowY: "auto",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6rem",
                    color: "var(--parchment-3)",
                    lineHeight: 1.8,
                    opacity: 0.8,
                  }}
                  aria-live="polite"
                  aria-label="Brute force output log"
                >
                  {crackerLog.map((line, i) => (
                    <div key={i} style={{ color: line.includes("score=3") || line.includes("score=4") || line.includes("score=5") ? "var(--gold)" : undefined }}>
                      {line}
                    </div>
                  ))}
                  {crackerRunning && <div style={{ color: "var(--signal-amber-bright)" }}>⟳ running…</div>}
                </div>
              </div>
            </div>
          )}

          {/* Manual decryption result */}
          {manualDecrypt && (
            <div className="card">
              <div className="section-label" style={{ marginBottom: "10px" }}>Manual Shift {shift} Result</div>
              <pre style={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: "var(--parchment)", lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {manualDecrypt}
              </pre>
            </div>
          )}

          {/* Why AES is immune */}
          <div className="card">
            <div className="section-label" style={{ marginBottom: "10px" }}>
              <Zap size={10} style={{ display: "inline", marginRight: "6px" }} />
              Why AES-256-GCM Is Immune to This
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                ["Classical Caesar", "26 possible shifts — cracked in seconds", "var(--signal-red-bright)"],
                ["Classical Vigenère", "Key length via IoC → Friedman test → cracked", "var(--signal-amber-bright)"],
                ["AES-256-GCM", "2²⁵⁶ keyspace — heat death of universe to brute-force", "var(--signal-green-bright)"],
                ["Ed25519 signature", "Elliptic curve discrete log — computationally infeasible", "var(--signal-green-bright)"],
              ].map(([cipher, note, color]) => (
                <div key={cipher as string} style={{ display: "flex", gap: "10px", padding: "8px 10px", background: "var(--ink-4)", borderRadius: "4px", border: "1px solid var(--border)" }}>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: color as string, fontWeight: 700, minWidth: "140px", flexShrink: 0 }}>{cipher as string}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--parchment-3)", opacity: 0.8 }}>{note as string}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
