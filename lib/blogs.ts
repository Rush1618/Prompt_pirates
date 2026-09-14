export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: string;
  category: "Cryptography" | "Steganography" | "Naval Intelligence" | "Security Audits";
  tags: string[];
  featured?: boolean;
}

export const GHOST_BLOG_POSTS: BlogPost[] = [
  {
    slug: "mathematics-of-blackbeards-aes-256-gcm-cipher",
    title: "The Mathematics of Blackbeard's AES-256-GCM Cipher",
    excerpt:
      "How 17th-century pirate captains would leverage modern Galois/Counter Mode authenticated encryption to guarantee missive secrecy and tamper prevention.",
    category: "Cryptography",
    tags: ["AES-GCM", "Authenticated Encryption", "Galois Field", "WebCrypto"],
    featured: true,
    publishedAt: "2026-09-14",
    readTime: "6 min read",
    author: {
      name: "Captain Edward Teach",
      role: "Chief Cryptographer, Queen Anne's Revenge",
      avatar: "🏴‍☠️",
    },
    content: `
# The Mathematics of Blackbeard's AES-256-GCM Cipher

When operating in hostile Caribbean waters dominated by royal navies and rival privateers, transmitting plain maritime coordinates is suicidal. A single intercepted dispatch can cost a captain his ship, treasure vault, and crew.

In the modern digital era of **Dead Man's Cipher**, we employ **AES-256-GCM** (Advanced Encryption Standard in Galois/Counter Mode) — the gold standard of authenticated symmetric encryption.

---

## 1. Why Authenticated Encryption Matters

Traditional ciphers like AES-CBC or RC4 only provided confidentiality. An adversary (or rival corsair) sitting in the middle could alter encrypted ciphertext bytes without detection. When decrypted, the corrupted message might still produce plausible-looking coordinates that lead a ship directly into an enemy ambush.

**AES-GCM solves this through Authenticated Encryption with Associated Data (AEAD).**

It computes a 128-bit authentication tag (MAC) alongside the ciphertext using multiplication in the Galois Field $\\text{GF}(2^{128})$. If even a single bit of the encrypted payload is tampered with:

$$ \\text{Tag Verification} \\implies \\text{FAIL} $$

The decryption function immediately rejects the missive before any unsafe data reaches the captain's log.

---

## 2. WebCrypto Hardware Acceleration

In **Dead Man's Cipher**, AES-GCM operations execute directly on host CPU hardware instructions via the browser's native \`window.crypto.subtle\` API:

\`\`\`typescript
const key = await window.crypto.subtle.importKey(
  "raw",
  rawKeyBuffer,
  { name: "AES-GCM" },
  false,
  ["encrypt", "decrypt"]
);

const ciphertext = await window.crypto.subtle.encrypt(
  {
    name: "AES-GCM",
    iv: nonce12Bytes,
    additionalData: enc.encode("DMC_AUTHENTICATED_HEADER_V1"),
  },
  key,
  encodedPayload
);
\`\`\`

---

## 3. Nonce Uniqueness Rule

The cardinal rule of AES-GCM is **NEVER reuse a 96-bit Initial Vector (IV / Nonce) with the same key**.

If two messages share the same key and nonce, an attacker can compute the XOR of the two plaintexts and crack the Galois authentication key $H$. In Dead Man's Cipher, every single encryption draws a fresh 96-bit nonce from the system's cryptographically secure pseudo-random number generator (\`window.crypto.getRandomValues\`).

---

## Summary

By combining 256-bit key length with Galois authentication, Dead Man's Cipher ensures that stolen treasure maps and secret maritime orders remain mathematically uncrackable against both brute-force attacks and active tampering.
    `,
  },
  {
    slug: "zero-width-steganography-hiding-coordinates-in-sea-shanties",
    title: "Zero-Width Steganography: Hiding Coordinates in Sea Shanties",
    excerpt:
      "A deep dive into carrier text steganography using non-printable Unicode zero-width characters to hide encrypted JSON payloads inside tavern songs.",
    category: "Steganography",
    tags: ["Steganography", "Unicode", "Zero-Width", "Covert Channels"],
    publishedAt: "2026-09-12",
    readTime: "5 min read",
    author: {
      name: "Anne Bonny",
      role: "Naval Intelligence Officer, The Revenge",
      avatar: "⚔️",
    },
    content: `
# Zero-Width Steganography: Hiding Coordinates in Sea Shanties

In 1718, passing an encrypted string like \`0x9f4a8b2c...\` to a crewmate in a crowded port tavern attracted immediate suspicion from royal navy guards. But singing a sea shanty? That was completely normal.

**Zero-Width Steganography** allows us to embed arbitrary binary ciphertext inside innocuous plain text (such as sea shanties or vessel manifests) without changing a single visible letter on the screen or paper.

---

## 1. How Zero-Width Encoding Works

Unicode contains invisible non-printing characters used primarily for typography and language joiners:

| Character | Name | Unicode Codepoint | Binary Bit |
|---|---|---|---|
| Zero-Width Space | \`\\u200B\` | \`U+200B\` | \`0\` |
| Zero-Width Non-Joiner | \`\\u200C\` | \`U+200C\` | \`1\` |
| Zero-Width Joiner | \`\\u200D\` | \`U+200D\` | Delimiter |

To hide a secret message inside a sea shanty:

1. Convert the encrypted payload into binary bits (\`0\`s and \`1\`s).
2. Map every \`0\` to \`\\u200B\` and every \`1\` to \`\\u200C\`.
3. Wrap the hidden stream with \`\\u200D\` start and end markers.
4. Append or inject the invisible characters between normal words in the shanty text.

---

## 2. The Carrier Shanty Example

Consider this innocent-looking shanty text:

> *What shall we do with a drunken sailor?*  
> *Early in the morning!*

To human eyes and standard text readers, it looks identical to normal lyrics. But underneath, between the space characters, lies a full 512-byte encrypted JSON wire payload containing signed island coordinates!

---

## 3. Extraction & Inspection

When a trusted officer pastes the carrier text into the **Boarding Inspection Deck** or **Steganography Lab**, Dead Man's Cipher scans the string for the \`\\u200D\` boundary markers, extracts the hidden binary stream, reconstructs the original JSON wire format, and proceeds to verify digital signatures!
    `,
  },
  {
    slug: "ed25519-digital-signatures-captains-seal-verification",
    title: "Ed25519 Digital Signatures: The Captain's Unforgeable Seal",
    excerpt:
      "Why modern high-speed asymmetric Elliptic Curve Cryptography (Ed25519) replaces bulky RSA signatures for maritime identity authentication.",
    category: "Naval Intelligence",
    tags: ["Ed25519", "Digital Signatures", "Elliptic Curve", "Public Key"],
    publishedAt: "2026-09-10",
    readTime: "7 min read",
    author: {
      name: "Calico Jack Rackham",
      role: "Fleet Commodore & Master Navigator",
      avatar: "⚓",
    },
    content: `
# Ed25519 Digital Signatures: The Captain's Unforgeable Seal

Historically, a captain authenticated orders using a heavy wax seal pressed with his signet ring. But wax can be stolen or duplicated.

In Dead Man's Cipher, every captain generates a high-security **Ed25519 Elliptic Curve Keypair** stored securely in the local browser **Identity Vault**.

---

## 1. What is Ed25519?

Ed25519 is an Edwards-curve Digital Signature Algorithm (EdDSA) operating over the twisted Edwards curve:

$$ -x^2 + y^2 = 1 - \\frac{121665}{121666} x^2 y^2 $$

It offers 128-bit security level while using compact 32-byte public keys and 64-byte signatures.

---

## 2. Key Advantages over RSA & ECDSA

1. **Immunity to Side-Channel Attacks**: Ed25519 operations execute in constant time, preventing timing attacks.
2. **No Random Number Vulnerability**: ECDSA signatures rely on fresh random $k$ values per signature; if the RNG fails, private keys leak. Ed25519 deterministically hashes the private key with the message payload, eliminating RNG risks.
3. **Compact Fingerprints**: A 32-byte public key yields a clean 16-character hexadecimal fingerprint (e.g. \`7F-3A-9C-E1-8B-2D\`).

---

## 3. 6-Gate Inspection Protocol

When a missive is inspected on the Quarterdeck, Gate 2 verifies the Ed25519 signature against the signing captain's public key fingerprint. If the signature is valid, you can be 100% certain the order was dispatched by the genuine captain!
    `,
  },
  {
    slug: "defeating-frequency-analysis-modern-attack-simulations",
    title: "Defeating Frequency Analysis: How 17th-Century Ciphers Evolved",
    excerpt:
      "Exploring letter frequency distribution in Monoalphabetic, Vigenère, and AES ciphers, and how the Kraken's Trial simulator tests key resilience.",
    category: "Security Audits",
    tags: ["Frequency Analysis", "Cipher Cracker", "Cryptanalysis", "Entropy"],
    publishedAt: "2026-09-08",
    readTime: "4 min read",
    author: {
      name: "Henry Morgan",
      role: "Chief Cryptanalyst, Port Royal Citadel",
      avatar: "📜",
    },
    content: `
# Defeating Frequency Analysis: How 17th-Century Ciphers Evolved

In the golden age of piracy, simple monoalphabetic substitution ciphers (where 'A' becomes 'E', 'B' becomes 'R', etc.) were quickly broken by cryptanalysts using **Frequency Analysis**.

In English prose, the letter **E** appears with ~12.7% frequency, followed by **T** (9.1%) and **A** (8.2%). A simple count of letter occurrences instantly unmasks monoalphabetic substitution.

---

## 1. From Vigenère to Polyalphabetic Ciphers

The Vigenère cipher improved security by shifting letters based on a repeating keyword, flattening the single-letter frequency curve. However, using **Kasiski examination** or index of coincidence, attackers could determine the keyword length and crack the message.

---

## 2. High-Entropy Modern Cipher Output

Modern AES-256-GCM and ChaCha20-Poly1305 output bytes that are statistically indistinguishable from uniform random noise.

In Dead Man's Cipher's **Cipher Cracker** and **Kraken's Trial Attack Simulator**, you can visualize real-time Shannon Entropy calculations:

$$ H(X) = - \\sum_{i=1}^{n} P(x_i) \\log_2 P(x_i) $$

For a perfectly encrypted ciphertext payload, Shannon Entropy reaches **~7.98 to 8.00 bits per byte**, proving zero leakage of plaintext statistical structure!
    `,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return GHOST_BLOG_POSTS.find((p) => p.slug === slug);
}
