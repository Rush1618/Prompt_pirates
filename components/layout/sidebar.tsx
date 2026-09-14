"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lock,
  Inbox,
  ShieldCheck,
  ImageIcon,
  Swords,
  BarChart3,
  ScrollText,
  Skull,
  Volume2,
  VolumeX,
} from "lucide-react";
import { CompassRose } from "@/components/ui/compass-rose";
import { nauticalAudio } from "@/lib/audio";

const navItems = [
  {
    section: "Command",
    items: [
      { href: "/", label: "The Quarterdeck", subLabel: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Cipher Operations",
    items: [
      { href: "/compose", label: "Sealed Missive Forge", subLabel: "Compose + Encrypt", icon: Lock },
      { href: "/inspect", label: "Boarding Inspection", subLabel: "Receive + Verify", icon: Inbox },
      { href: "/identity", label: "Identity Vault", subLabel: "Captain's Seal", icon: ShieldCheck },
    ],
  },
  {
    section: "Covert Ops",
    items: [
      { href: "/stego", label: "Steganography Lab", subLabel: "Chart + Shanty Stego", icon: ImageIcon },
    ],
  },
  {
    section: "Security",
    items: [
      { href: "/attack-lab", label: "The Kraken's Trial", subLabel: "Attack Simulator", icon: Swords },
      { href: "/cracker", label: "Cipher Cracker", subLabel: "Freq. Analysis + Brute Force", icon: BarChart3 },
      { href: "/threat", label: "Storm Warning", subLabel: "Threat Dashboard", icon: BarChart3 },
      { href: "/audit", label: "Ship's Log", subLabel: "Audit Timeline", icon: ScrollText },
    ],
  },
];

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleAudio = () => {
    const muted = nauticalAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      nauticalAudio.playChime();
    }
  };

  return (
    <aside className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Logo */}
      <div className="sidebar-logo">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <Link
            href="/"
            onClick={() => onNavigate?.()}
            className="flex items-center gap-3 group hover:opacity-90 transition-opacity cursor-pointer"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <img
              src="/logo.jpg"
              alt="Dead Man's Cipher Emblem"
              className="w-10 h-10 rounded-full border border-amber-500/50 shadow-md group-hover:scale-105 transition-transform"
            />
            <div>
              <h1 className="group-hover:text-amber-300 transition-colors">Dead Man's<br />Cipher</h1>
            </div>
          </Link>
          <button
            type="button"
            onClick={handleToggleAudio}
            title={isMuted ? "Unmute Sound Effects" : "Mute Sound Effects"}
            className="p-1.5 rounded-lg bg-slate-900 border border-amber-900/40 text-amber-400 hover:text-amber-300 transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
        <p style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Cryptographic Workbench</p>
        <div
          style={{
            fontSize: "0.6rem",
            fontFamily: "var(--font-mono)",
            color: "var(--gold-dim)",
            opacity: 0.6,
            letterSpacing: "0.06em",
            borderTop: "1px solid var(--border)",
            paddingTop: "8px",
          }}
        >
          <span style={{ color: "var(--signal-green-bright)" }}>●</span> CIPHER ENGINE ONLINE
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1 }}>
        {navItems.map((section) => (
          <div key={section.section}>
            <div className="nav-section-label">{section.section}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onNavigate?.()}
                  className={`nav-item ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="nav-icon" size={15} />
                  <div>
                    <div style={{ lineHeight: 1.3 }}>{item.label}</div>
                    <div
                      style={{
                        fontSize: "0.6rem",
                        fontFamily: "var(--font-mono)",
                        opacity: 0.5,
                        color: isActive ? "var(--gold-dim)" : "var(--parchment-3)",
                        marginTop: "1px",
                      }}
                    >
                      {item.subLabel}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border)",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
          }}
        >
          <Skull size={12} style={{ color: "var(--gold-dim)" }} />
          <span
            style={{
              fontSize: "0.6rem",
              fontFamily: "var(--font-mono)",
              color: "var(--gold-dim)",
              opacity: 0.7,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Hackathon Prototype
          </span>
        </div>
        <p
          style={{
            fontSize: "0.55rem",
            fontFamily: "var(--font-mono)",
            color: "var(--parchment-3)",
            opacity: 0.4,
            lineHeight: 1.5,
          }}
        >
          Educational use only. Not for production secrets.
        </p>
      </div>
    </aside>
  );
}
