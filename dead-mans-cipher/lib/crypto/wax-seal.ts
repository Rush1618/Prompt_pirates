/**
 * Dead Man's Cipher — Wax Seal & Passphrase Generator
 * High-entropy pirate passphrase generator + SVG Wax Seal Emblem Renderer
 */

const PIRATE_ADJECTIVES = [
  "crimson", "salty", "scurvy", "ghostly", "iron", "shadow", "golden",
  "dread", "stormy", "roaring", "cursed", "brazen", "mystic", "sunken"
];

const PIRATE_NOUNS = [
  "kraken", "doubloon", "cutlass", "compass", "galleon", "anchor",
  "sextant", "shanty", "voyage", "corsair", "plank", "horizon", "beacon"
];

const PIRATE_CAPTAINS = [
  "blackbeard", "calico", "morgan", "flint", "bonny", "kidd", "drake", "silver"
];

/**
 * Generate high-entropy pirate passphrase (e.g. "crimson-kraken-blackbeard-9418")
 */
export function generatePiratePassphrase(): string {
  const adj = PIRATE_ADJECTIVES[Math.floor(Math.random() * PIRATE_ADJECTIVES.length)];
  const noun = PIRATE_NOUNS[Math.floor(Math.random() * PIRATE_NOUNS.length)];
  const captain = PIRATE_CAPTAINS[Math.floor(Math.random() * PIRATE_CAPTAINS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj}-${noun}-${captain}-${num}`;
}

export interface WaxSealConfig {
  captainName: string;
  fingerprint: string;
  waxColor?: string; // Hex color (default crimson gold)
  emblem?: "skull" | "anchor" | "compass";
}

/**
 * SVG Wax Seal string generator for keypair visual verification
 */
export function renderWaxSealSvg(config: WaxSealConfig): string {
  const color = config.waxColor || "#991b1b"; // Deep crimson
  const emblem = config.emblem || "skull";
  const shortFingerprint = config.fingerprint.substring(0, 10);

  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" class="w-full h-full drop-shadow-lg">
    <!-- Wax Base Seal -->
    <circle cx="50" cy="50" r="46" fill="${color}" stroke="#d97706" stroke-width="2.5" />
    <circle cx="50" cy="50" r="41" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3,2" opacity="0.8" />

    <!-- Outer Circular Text Path -->
    <path id="sealPath" d="M 18 50 A 32 32 0 1 1 82 50 A 32 32 0 1 1 18 50" fill="none" />
    <text font-family="monospace" font-size="5.5" fill="#fef3c7" font-weight="bold" letter-spacing="1">
      <textPath href="#sealPath" startOffset="50%" text-anchor="middle">
        OFFICIAL SEAL • ${config.captainName.toUpperCase()}
      </textPath>
    </text>

    <!-- Center Emblem -->
    <g transform="translate(25, 23) scale(0.5)" fill="#fef3c7">
      ${
        emblem === "skull"
          ? `<path d="M50 15 C30 15 20 30 20 50 C20 65 30 75 40 80 L40 90 L60 90 L60 80 C70 75 80 65 80 50 C80 30 70 15 50 15 Z M35 45 C30 45 28 40 28 35 C28 30 30 25 35 25 C40 25 42 30 42 35 C42 40 40 45 35 45 Z M65 45 C60 45 58 40 58 35 C58 30 60 25 65 25 C70 25 72 30 72 35 C72 40 70 45 65 45 Z" />`
          : emblem === "compass"
          ? `<polygon points="50,10 40,50 50,45 60,50" fill="#fef3c7" /><circle cx="50" cy="50" r="35" stroke="#fef3c7" stroke-width="4" fill="none" />`
          : `<path d="M50 10 L50 80 M25 50 L75 50 M30 80 C30 95 70 95 70 80" stroke="#fef3c7" stroke-width="6" stroke-linecap="round" fill="none" /><circle cx="50" cy="20" r="8" stroke="#fef3c7" stroke-width="4" fill="none" />`
      }
    </g>

    <!-- Bottom Fingerprint Stamp -->
    <text x="50" y="78" font-family="monospace" font-size="4.5" fill="#fde68a" text-anchor="middle" font-weight="bold">
      ${shortFingerprint}
    </text>
  </svg>`;
}
