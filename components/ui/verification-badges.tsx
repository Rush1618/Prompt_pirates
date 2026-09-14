"use client";

import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

export type VerificationStatus = "pending" | "pass" | "fail" | "warn";

export interface VerificationBadgeProps {
  label: string;
  status: VerificationStatus;
  detail?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    className: "badge-pending",
    aria: "pending",
  },
  pass: {
    icon: CheckCircle2,
    className: "badge-pass",
    aria: "passed",
  },
  fail: {
    icon: XCircle,
    className: "badge-fail",
    aria: "failed",
  },
  warn: {
    icon: AlertCircle,
    className: "badge-warn",
    aria: "warning",
  },
};

export function VerificationBadge({ label, status, detail }: VerificationBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`badge ${config.className}`}
      role="status"
      aria-label={`${label}: ${config.aria}${detail ? ` — ${detail}` : ""}`}
      title={detail}
    >
      <Icon size={10} aria-hidden />
      <span>{label}</span>
    </div>
  );
}

export interface VerificationGateProps {
  statuses: {
    schema: VerificationStatus;
    replay: VerificationStatus;
    freshness: VerificationStatus;
    keyStatus: VerificationStatus;
    signature: VerificationStatus;
    integrity: VerificationStatus;
  };
  details?: Partial<Record<keyof VerificationGateProps["statuses"], string>>;
}

const GATE_LABELS: Record<keyof VerificationGateProps["statuses"], string> = {
  schema: "Schema",
  replay: "Replay",
  freshness: "Freshness",
  keyStatus: "Key Status",
  signature: "Signature",
  integrity: "Integrity",
};

export function VerificationGate({ statuses, details }: VerificationGateProps) {
  const allPass = Object.values(statuses).every((s) => s === "pass");
  const anyFail = Object.values(statuses).some((s) => s === "fail");

  return (
    <div>
      <div
        className="section-label"
        style={{ marginBottom: "12px" }}
      >
        Boarding Inspection Gates
      </div>

      {/* Live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {allPass
          ? "All verification gates passed. Message may be decrypted."
          : anyFail
          ? "One or more verification gates failed. Message is rejected."
          : "Verification in progress."}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {(Object.keys(statuses) as Array<keyof typeof statuses>).map((key, i) => (
          <VerificationBadge
            key={key}
            label={GATE_LABELS[key]}
            status={statuses[key]}
            detail={details?.[key]}
          />
        ))}
      </div>

      {/* Overall verdict */}
      {allPass && (
        <div
          className="badge badge-pass"
          style={{ fontSize: "0.75rem", padding: "6px 16px" }}
          role="status"
          aria-label="All gates passed — boarding inspection complete"
        >
          <CheckCircle2 size={12} aria-hidden />
          ⚓ Boarding Inspection Complete — Message Cleared
        </div>
      )}
      {anyFail && (
        <div
          className="badge badge-fail"
          style={{ fontSize: "0.75rem", padding: "6px 16px" }}
          role="alert"
          aria-label="Verification failed — message rejected"
        >
          <XCircle size={12} aria-hidden />
          ☠ Inspection Failed — Message Rejected
        </div>
      )}
    </div>
  );
}

// sr-only utility
// Add this to globals if not already present
