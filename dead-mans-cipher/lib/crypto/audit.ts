/**
 * Dead Man's Cipher — Tamper-Evident Hash Chain Audit Engine
 * Cryptographically linked event logs (H_n = SHA-256(H_{n-1} || EventData))
 */

export interface AuditLogEntry {
  id: string;
  sequence: number;
  timestamp: string;
  eventType:
    | "IDENTITY_CREATED"
    | "KEY_ROTATED"
    | "KEY_REVOKED"
    | "ENCRYPTION_EXECUTED"
    | "INSPECTION_PASSED"
    | "INSPECTION_FAILED"
    | "ATTACK_SIMULATED"
    | "STEGO_EMBEDDED";
  actor: string;
  details: string;
  previousHash: string;
  currentHash: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
}

const GENESIS_HASH = "0000000000000000000000000000000000000000000000000000000000000000";

// Compute SHA-256 hex string synchronously/asynchronously
async function sha256Hex(data: string): Promise<string> {
  const enc = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", enc.encode(data));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const STORAGE_AUDIT_KEY = "dmc_audit_chain";

/**
 * Load persistent audit chain from LocalStorage or initialize with default sample genesis
 */
export async function getAuditChain(): Promise<AuditLogEntry[]> {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_AUDIT_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore error
  }

  // Initialize sample pirate ship audit chain
  const now = new Date();
  const t1 = new Date(now.getTime() - 3600000 * 5).toISOString();
  const t2 = new Date(now.getTime() - 3600000 * 3).toISOString();

  const h1 = await sha256Hex(`${GENESIS_HASH}:IDENTITY_CREATED:Captain Blackbeard:Genesis keypair generated`);
  const h2 = await sha256Hex(`${h1}:ENCRYPTION_EXECUTED:Captain Blackbeard:Encrypted treasure coordinates`);

  const initialChain: AuditLogEntry[] = [
    {
      id: "evt_1",
      sequence: 1,
      timestamp: t1,
      eventType: "IDENTITY_CREATED",
      actor: "Captain Blackbeard",
      details: "Genesis Ed25519 identity created (0x9f4a...2c81)",
      previousHash: GENESIS_HASH,
      currentHash: h1,
      severity: "INFO",
    },
    {
      id: "evt_2",
      sequence: 2,
      timestamp: t2,
      eventType: "ENCRYPTION_EXECUTED",
      actor: "Captain Blackbeard",
      details: "AES-256-GCM cipher payload created for 17.9241° N, 76.8122° W",
      previousHash: h1,
      currentHash: h2,
      severity: "INFO",
    },
  ];

  try {
    localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(initialChain));
  } catch {}

  return initialChain;
}

/**
 * Append a new cryptographic event to the audit chain
 */
export async function appendAuditEvent(
  eventType: AuditLogEntry["eventType"],
  actor: string,
  details: string,
  severity: AuditLogEntry["severity"] = "INFO"
): Promise<AuditLogEntry> {
  const chain = await getAuditChain();
  const previousHash = chain.length > 0 ? chain[chain.length - 1].currentHash : GENESIS_HASH;
  const sequence = chain.length + 1;
  const timestamp = new Date().toISOString();

  const dataPayload = `${previousHash}:${sequence}:${timestamp}:${eventType}:${actor}:${details}`;
  const currentHash = await sha256Hex(dataPayload);

  const newEntry: AuditLogEntry = {
    id: `evt_${Date.now()}_${sequence}`,
    sequence,
    timestamp,
    eventType,
    actor,
    details,
    previousHash,
    currentHash,
    severity,
  };

  chain.push(newEntry);
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(chain));
    } catch {}
  }

  return newEntry;
}

/**
 * Re-evaluate every link in the hash chain to verify audit log integrity
 */
export async function verifyAuditChainIntegrity(
  chain: AuditLogEntry[]
): Promise<{
  isValid: boolean;
  brokenIndex?: number;
  message: string;
}> {
  if (chain.length === 0) {
    return { isValid: true, message: "Chain is empty." };
  }

  for (let i = 0; i < chain.length; i++) {
    const entry = chain[i];
    const expectedPrev = i === 0 ? GENESIS_HASH : chain[i - 1].currentHash;

    if (entry.previousHash !== expectedPrev) {
      return {
        isValid: false,
        brokenIndex: i,
        message: `Previous hash mismatch at sequence #${entry.sequence}. Expected ${expectedPrev.substring(0, 10)}..., got ${entry.previousHash.substring(0, 10)}...`,
      };
    }

    const dataPayload = `${entry.previousHash}:${entry.sequence}:${entry.timestamp}:${entry.eventType}:${entry.actor}:${entry.details}`;
    const recomputedHash = await sha256Hex(dataPayload);

    if (recomputedHash !== entry.currentHash) {
      return {
        isValid: false,
        brokenIndex: i,
        message: `Hash validation failure at sequence #${entry.sequence}. Log entry content was mutated!`,
      };
    }
  }

  return {
    isValid: true,
    message: "Tamper-evident hash chain verified. All entries cryptographically intact.",
  };
}
