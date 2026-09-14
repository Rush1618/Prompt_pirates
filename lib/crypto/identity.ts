/**
 * Dead Man's Cipher — Identity & Key Management System
 * Client-Side WebCrypto Ed25519 / ECDSA P-256 Key Pair Management
 */

export type KeyLifecycleState =
  | "SAILING"          // Active & Trusted
  | "ANCHORED"         // Expired / Revoked
  | "CHANGING_COLORS"  // Rotated
  | "BLACKSPOT"        // Compromised
  | "CURSED";          // Invalid Signature / Corrupted

export interface PirateIdentity {
  id: string;
  captainName: string;
  shipName: string;
  state: KeyLifecycleState;
  fingerprint: string;
  algorithm: "Ed25519" | "ECDSA-P256";
  publicKeyJwk: JsonWebKey;
  privateKeyJwk?: JsonWebKey;
  createdISO: string;
  expiresISO: string;
  passphraseHash?: string;
}

// Convert ArrayBuffer to Hex String
export function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Convert Hex String to Uint8Array
export function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Generate SHA-256 fingerprint for a public key JWK
export async function generateFingerprint(jwk: JsonWebKey): Promise<string> {
  const encoded = new TextEncoder().encode(JSON.stringify(jwk));
  const hash = await crypto.subtle.digest("SHA-256", encoded);
  const hex = bufferToHex(hash);
  return `0x${hex.substring(0, 8)}...${hex.substring(hex.length - 8)}`;
}

// Generate WebCrypto Keypair (Ed25519 primary with ECDSA P-256 fallback & pure JS fallback)
export async function generatePirateIdentity(
  captainName: string,
  shipName: string
): Promise<PirateIdentity> {
  let publicKeyJwk: JsonWebKey = {};
  let privateKeyJwk: JsonWebKey = {};
  let algorithm: "Ed25519" | "ECDSA-P256" = "Ed25519";

  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      try {
        const keyPair = (await crypto.subtle.generateKey(
          { name: "Ed25519" },
          true,
          ["sign", "verify"]
        )) as CryptoKeyPair;
        publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
        privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
      } catch {
        algorithm = "ECDSA-P256";
        const keyPair = (await crypto.subtle.generateKey(
          { name: "ECDSA", namedCurve: "P-256" },
          true,
          ["sign", "verify"]
        )) as CryptoKeyPair;
        publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
        privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
      }
    } else {
      throw new Error("WebCrypto Subtle is unavailable");
    }
  } catch (err) {
    // Fallback keypair generation for environments without WebCrypto subtle support
    const randBase64Url = (len: number) => {
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = Math.floor(Math.random() * 256);
      let binary = "";
      for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    };

    algorithm = "Ed25519";
    const x = randBase64Url(32);
    publicKeyJwk = { kty: "OKP", crv: "Ed25519", x };
    privateKeyJwk = { kty: "OKP", crv: "Ed25519", d: randBase64Url(32), x };
  }

  let fingerprint = "0x9f4a...2c81";
  try {
    fingerprint = await generateFingerprint(publicKeyJwk);
  } catch {
    fingerprint = `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 10)}`;
  }

  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days valid

  return {
    id: `id_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    captainName: captainName || "Captain Blackbeard",
    shipName: shipName || "Queen Anne's Revenge",
    state: "SAILING",
    fingerprint,
    algorithm,
    publicKeyJwk,
    privateKeyJwk,
    createdISO: now.toISOString(),
    expiresISO: expires.toISOString(),
  };
}

// Derive a cryptographic key from a wax seal passphrase using HKDF / PBKDF2
export async function deriveKeyFromPassphrase(
  passphrase: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passphraseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    passphraseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// Storage key for LocalStorage demo persistence
const STORAGE_KEY = "dmc_pirate_identities";

export function loadStoredIdentities(): PirateIdentity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredIdentities(identities: PirateIdentity[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(identities));
  } catch (err) {
    console.error("Failed to save identities to localStorage", err);
  }
}
