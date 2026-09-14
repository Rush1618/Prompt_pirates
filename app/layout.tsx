import type { Metadata } from "next";
import "./globals.css";
import { AppShellWrapper } from "@/components/layout/app-shell-wrapper";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://prompt-pirates.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Dead Man's Cipher — Maritime Cryptographic Workbench",
    template: "%s | Dead Man's Cipher",
  },
  description:
    "A high-performance cybersecurity workbench demonstrating authenticated AES-256-GCM encryption, Ed25519 digital signatures, carrier steganography, and tamper-evident auditing in a pirate-themed 3D interface.",
  keywords: [
    "cryptography",
    "security",
    "AES-GCM",
    "Ed25519",
    "steganography",
    "cybersecurity",
    "WebCrypto API",
    "3D WebGL",
    "Maritime Security",
  ],
  authors: [{ name: "Dead Man's Cipher Crew" }],
  creator: "Dead Man's Cipher Team",
  publisher: "Dead Man's Cipher",
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Dead Man's Cipher",
    title: "Dead Man's Cipher — Maritime Cryptographic Workbench",
    description:
      "Authenticated encryption, Ed25519 signatures, zero-width steganography & 3D WebGL dual key engine.",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 800,
        alt: "Dead Man's Cipher Emblem",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dead Man's Cipher — Maritime Cryptographic Workbench",
    description:
      "Authenticated encryption, Ed25519 signatures, zero-width steganography & 3D WebGL dual key engine.",
    images: ["/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Dead Man's Cipher",
  alternateName: "DMC Cryptographic Workbench",
  url: baseUrl,
  logo: `${baseUrl}/logo.jpg`,
  applicationCategory: "SecurityApplication",
  operatingSystem: "Any",
  description:
    "Authenticated AES-256-GCM encryption, Ed25519 digital signatures, carrier steganography, and tamper-evident audit logs.",
  offers: {
    "@type": "Offer",
    price: "0.00",
    priceCurrency: "USD",
  },
  featureList: [
    "WebCrypto AES-256-GCM / ChaCha20-Poly1305 Encryption",
    "Ed25519 Asymmetric Digital Signatures & Fingerprinting",
    "Zero-Width Unicode Carrier Steganography",
    "3D WebGL Bi-Directional Concentric Hardware Key Engine",
    "6-Gate Verification & Inspection Engine",
    "Tamper-Evident SHA-256 Hash Audit Chain",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/jpeg" href="/logo.jpg" />
        <link rel="shortcut icon" href="/logo.jpg" />
        <link rel="apple-touch-icon" href="/logo.jpg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;900&family=Cinzel+Decorative:wght@400;700&family=JetBrains+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AppShellWrapper>{children}</AppShellWrapper>
      </body>
    </html>
  );
}
