# ☠️ Dead Man's Cipher — Maritime Cryptographic Workbench

> **A high-performance educational cybersecurity workbench demonstrating client-side authenticated encryption, digital signatures, steganography, tamper-evident auditing, and 3D WebGL key hardware controls in a 17th-century naval intelligence interface.**

![Build Status](https://img.shields.io/badge/Vercel-Deployed-brightgreen?style=for-the-badge&logo=vercel)
![Version](https://img.shields.io/badge/Release-v1.2.0-gold?style=for-the-badge)
![Security](https://img.shields.io/badge/WebCrypto-Client--Side-emerald?style=for-the-badge)

---

## 🌟 Overview

In the Golden Age of Sail, intercepting an order or forging a captain's seal could alter the fate of an empire. **Dead Man's Cipher** bridges historical pirate folklore with modern production cryptography. 

It executes **authenticated symmetric encryption (AES-256-GCM)**, **Ed25519 digital signatures**, **Zero-Width Unicode and LSB Image Steganography**, **6-Gate Boarding Inspection Engine**, **Tamper-Evident Hash Chain Auditing**, and an **Interactive 3D WebGL Hardware Key Dial**—all running 100% client-side in the browser using native `window.crypto.subtle` Web Crypto APIs.

---

## 🚀 Key Features & Architectural Modules

### 1. 🎲 Interactive 3D WebGL Key Dial & Entropy Core
- **Three.js WebGL Engine**: Features an armillary brass compass ring, wireframe Icosahedron cipher gem core, and dynamic starfield particles.
- **Real Hardware Entropy Generator**: Harvesting hardware-random bytes via `window.crypto.getRandomValues()` to calculate key dial angles (0°–360°), AES initialization vectors (IV), and key salts.
- **Functional Key Control**: Dragging or sliding the 3D key dial dynamically locks/unlocks missives and injects generated seeds into passphrase key derivation.

### 2. 🔐 Sealed Missive Forge (Compose & Encrypt)
- **Authenticated Encryption**: Choice of **AES-256-GCM** (GCM AuthTag validation) or **ChaCha20-Poly1305** stream cipher.
- **Asymmetric Digital Signatures**: Every payload is signed with the Captain's **Ed25519** private key.
- **Key Derivation**: 100,000 rounds of **PBKDF2-SHA256** key stretching for brute-force resistance.
- **Interactive Nautical Map**: Select historical pirate ports (Port Royal, Tortuga, Nassau, Key West) to auto-populate coordinates.

### 3. 🔍 Boarding Inspection Deck (6-Gate Verification)
Automated multi-layer verification gate engine checking:
1. **Schema Gate**: Validates protocol magic header (`DMC1`) and wire structure.
2. **Replay Skew Gate**: Rejects payloads older than the max timestamp expiration window.
3. **Freshness Gate**: Verifies timestamp integrity.
4. **Key Lifecycle Gate**: Audits sender key state (`SAILING`, `ANCHORED`, `BLACKSPOT`).
5. **Signature Gate**: Validates Ed25519 digital signature against public key fingerprint.
6. **Cipher Integrity Gate**: Verifies AES-GCM AuthTag and decrypts coordinates.
- **Visual 3D Verification Feedback**: The 3D WebGL compass auto-rotates and changes lighting states (**Glowing Emerald** for Valid vs. **Glowing Crimson** for Tampered).

### 4. 🪶 Steganography Lab (Covert Channels)
- **Zero-Width Unicode Stego**: Invisibly encodes JSON cipher payloads into innocent Sea Shanty lyrics using zero-width spaces (`\u200B`), non-joiners (`\u200C`), and joiners (`\u200D`).
- **LSB Image Steganography**: Hides encrypted payload bytes inside the Least Significant Bits of HTML5 Canvas RGB image pixels with <0.39% visual distortion.

### 5. 📜 Tamper-Evident Hash Chain Ship Log (Audit Engine)
- **Cryptographically Linked Log**: Every action generates a hash-linked entry:
  $$\text{Hash}_n = \text{SHA-256}(\text{Hash}_{n-1} \parallel \text{Sequence} \parallel \text{Timestamp} \parallel \text{EventType} \parallel \text{Actor} \parallel \text{Details})$$
- **Integrity Verification**: One-click re-computation of every link in the chain to instantly catch modified or deleted log entries.

### 6. ⚔️ The Kraken's Trial (Attack Simulator & Cipher Cracker)
- **Attack Simulations**: Test defenses against Replay Attacks, Ciphertext Bit-Flipping, Key Revocation, and Timestamp Forgery.
- **Cipher Cracker**: Frequency analysis for classical ciphers and PBKDF2 brute-force estimation.
- **Storm Warning Threat Dashboard**: Real-time composite security score (0 to 100) and radar chart assurance metrics.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 16 (App Router)](https://nextjs.org/) |
| **UI Library** | [React 19](https://react.dev/) & [TypeScript 5](https://www.typescriptlang.org/) |
| **3D Graphics** | [Three.js](https://threejs.org/) (WebGL Canvas) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) & Dark Glassmorphism CSS Tokens |
| **Icons & Audio** | [Lucide React](https://lucide.dev/) & Web Audio API synthesis |
| **Cryptography** | Native Web Crypto API (`window.crypto.subtle`) |

---

## 📁 Repository Structure

```text
Prompt_pirates/
├── app/                        # Next.js App Router Pages
│   ├── page.tsx                # The Quarterdeck (Command Center & 3D WebGL Dashboard)
│   ├── compose/page.tsx        # Sealed Missive Forge (Encryption & 3D Key Seed Generator)
│   ├── inspect/page.tsx        # Boarding Inspection Deck (6-Gate Verification & 3D Verifier)
│   ├── identity/page.tsx       # Identity Vault (Ed25519 Captain's Seal & Key Lifecycle)
│   ├── stego/page.tsx          # Steganography Lab (Shanty & LSB Image Carrier)
│   ├── attack-lab/page.tsx     # The Kraken's Trial (Cryptographic Attack Simulator)
│   ├── cracker/page.tsx        # Cipher Cracker (Frequency Analysis & Brute Force)
│   ├── threat/page.tsx         # Storm Warning (Threat Radar & Composite Risk Score)
│   ├── audit/page.tsx          # Ship's Log (Tamper-Evident Hash Chain Audit Timeline)
│   ├── layout.tsx              # Root Layout & Google Font Integrations
│   └── globals.css             # Maritime Dark Design Tokens & Glassmorphism System
├── components/
│   ├── layout/                 # AppShell, Top Header & Responsive Drawer Sidebar
│   └── ui/                     # Nautical 3D Compass, CompassRose, NauticalMap, Badges
├── lib/
│   ├── crypto/                 # Pure WebCrypto Engine (cipher, identity, audit, threat, stego)
│   └── audio.ts                # Web Audio API sound synthesizer
├── public/                     # Favicons & static assets
├── vercel.json                 # Vercel deployment configuration
├── package.json                # Project dependencies & scripts
└── tsconfig.json               # TypeScript configuration
```

---

## 💻 Local Development Guide

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YourUsername/Prompt_pirates.git
   cd Prompt_pirates
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to **`http://localhost:3000`** to launch **The Quarterdeck**.

5. **Build for production**:
   ```bash
   npm run build
   ```

---

## 🌐 Deployment Guide (Vercel)

### Option 1: Vercel CLI (Recommended)
From the project root directory, run:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy Preview Build
vercel

# Deploy Production Build
vercel --prod
```

### Option 2: GitHub Dashboard Integration
1. Push your repository to GitHub (`Prompt_pirates`).
2. Go to [Vercel Dashboard](https://vercel.com/new) and import the repository.
3. Vercel automatically detects Next.js.
4. Click **Deploy**.

> **Note**: Because *Dead Man's Cipher* runs 100% client-side via native browser Web Crypto APIs, no external database connection strings or environment secret keys are required to deploy!

---

## 🛡️ Security & Privacy Notice

- **Educational Prototype**: *Dead Man's Cipher* is designed for educational demonstrations, hackathons, and cybersecurity awareness.
- **Client-Side Execution**: All keys, signatures, and ciphers are processed strictly in the user's browser memory via `window.crypto.subtle`. No secret payloads or private keys are ever transmitted to an external server.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for details.
