import type { Metadata } from "next";
import "./globals.css";
import { AppShellWrapper } from "@/components/layout/app-shell-wrapper";

export const metadata: Metadata = {
  title: "Dead Man's Cipher — Maritime Cryptographic Workbench",
  description:
    "A high-performance cybersecurity workbench demonstrating authenticated encryption, digital signatures, steganography, and tamper-evident auditing in a pirate-themed interface.",
  keywords: ["cryptography", "security", "AES-GCM", "steganography", "education"],
  icons: {
    icon: "/logo.jpg",
    shortcut: "/logo.jpg",
    apple: "/logo.jpg",
  },
  openGraph: {
    title: "Dead Man's Cipher — Maritime Cryptographic Workbench",
    description: "Authenticated encryption, digital signatures & 3D WebGL key hardware engine.",
    images: [{ url: "/logo.jpg", width: 800, height: 800, alt: "Dead Man's Cipher Emblem" }],
  },
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
      </head>
      <body>
        <AppShellWrapper>{children}</AppShellWrapper>
      </body>
    </html>
  );
}
