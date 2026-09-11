/**
 * Dead Man's Cipher — Threat Assessment Engine
 * Risk Scoring, Severity Tiers, and Residual Risk Mitigation Rules
 */

export interface ThreatFactor {
  id: string;
  category: "CIPHER" | "SIGNATURE" | "KEY_LIFECYCLE" | "TIMESTAMP" | "STEGO";
  name: string;
  weight: number;
  score: number; // 0 (safe) to 100 (critical)
  description: string;
  mitigation: string;
}

export interface ThreatEvaluation {
  overallRiskScore: number; // 0 to 100
  riskTier: "SAFE" | "ELEVATED" | "CRITICAL";
  factors: ThreatFactor[];
  radarMetrics: {
    cipherStrength: number;
    keyFreshness: number;
    signatureAssurance: number;
    antiReplay: number;
    stegoStealth: number;
  };
}

export function evaluateThreatLevel(params?: {
  cipherAlgo?: "AES-256-GCM" | "ChaCha20-Poly1305";
  keyState?: "SAILING" | "ANCHORED" | "BLACKSPOT";
  hasSignature?: boolean;
  timestampAgeHours?: number;
  stegoBitsDensity?: number;
}): ThreatEvaluation {
  const cipherAlgo = params?.cipherAlgo || "AES-256-GCM";
  const keyState = params?.keyState || "SAILING";
  const hasSignature = params?.hasSignature ?? true;
  const timestampAgeHours = params?.timestampAgeHours ?? 0.5;

  const factors: ThreatFactor[] = [
    {
      id: "factor_1",
      category: "CIPHER",
      name: "Symmetric Cipher Algorithm",
      weight: 25,
      score: cipherAlgo === "AES-256-GCM" ? 5 : 15,
      description: cipherAlgo === "AES-256-GCM" ? "AES-256-GCM authenticated encryption." : "ChaCha20-Poly1305 fallback cipher.",
      mitigation: "Standardize on AES-256-GCM for hardware-accelerated GCM AuthTag validation.",
    },
    {
      id: "factor_2",
      category: "SIGNATURE",
      name: "Digital Signature & Non-Repudiation",
      weight: 30,
      score: hasSignature ? 0 : 95,
      description: hasSignature ? "Valid Ed25519 digital signature attached." : "MISSING DIGITAL SIGNATURE. Unauthenticated payload vulnerable to forgery.",
      mitigation: "Require Ed25519 or ECDSA P-256 signatures on all transmitted ciphertexts.",
    },
    {
      id: "factor_3",
      category: "KEY_LIFECYCLE",
      name: "Sender Identity & Key State",
      weight: 25,
      score: keyState === "SAILING" ? 0 : keyState === "ANCHORED" ? 60 : 100,
      description: `Sender key state is currently ${keyState}.`,
      mitigation: keyState === "SAILING" ? "None required." : "Immediately rotate keys and revoke compromised fingerprints via identity vault.",
    },
    {
      id: "factor_4",
      category: "TIMESTAMP",
      name: "Replay Attack Skew Window",
      weight: 20,
      score: timestampAgeHours < 1 ? 5 : timestampAgeHours < 12 ? 35 : 85,
      description: `Payload timestamp is ${timestampAgeHours.toFixed(1)} hours old.`,
      mitigation: "Enforce strict 1-hour timestamp expiration windows on high-value maritime coordinates.",
    },
  ];

  let weightedSum = 0;
  let totalWeight = 0;
  for (const f of factors) {
    weightedSum += f.score * f.weight;
    totalWeight += f.weight;
  }

  const overallRiskScore = Math.round(weightedSum / (totalWeight || 1));
  let riskTier: "SAFE" | "ELEVATED" | "CRITICAL" = "SAFE";

  if (overallRiskScore >= 70) {
    riskTier = "CRITICAL";
  } else if (overallRiskScore >= 30) {
    riskTier = "ELEVATED";
  }

  return {
    overallRiskScore,
    riskTier,
    factors,
    radarMetrics: {
      cipherStrength: cipherAlgo === "AES-256-GCM" ? 98 : 88,
      keyFreshness: keyState === "SAILING" ? 95 : 20,
      signatureAssurance: hasSignature ? 99 : 0,
      antiReplay: Math.max(10, Math.round(100 - timestampAgeHours * 4)),
      stegoStealth: 92,
    },
  };
}
