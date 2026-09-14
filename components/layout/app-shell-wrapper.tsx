"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ArrowLeft, Anchor, Volume2, VolumeX, Shield } from "lucide-react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { nauticalAudio } from "@/lib/audio";

interface AppShellWrapperProps {
  children: React.ReactNode;
}

const ROUTE_NAMES: Record<string, string> = {
  "/": "Quarterdeck",
  "/compose": "Sealed Missive Forge",
  "/inspect": "Boarding Inspection",
  "/identity": "Identity Vault",
  "/stego": "Steganography Lab",
  "/attack-lab": "Kraken's Trial",
  "/cracker": "Cipher Cracker",
  "/threat": "Storm Warning",
  "/audit": "Ship's Log",
};

export function AppShellWrapper({ children }: AppShellWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentTitle = ROUTE_NAMES[pathname] || "Deck";

  // Automatically open sidebar on desktop viewports (>= 1024px)
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSidebarOpen(true);
    }
  }, []);

  const handleToggleAudio = () => {
    const muted = nauticalAudio.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      nauticalAudio.playChime();
    }
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleNavClick = () => {
    // Only close drawer on mobile screens (< 1024px) so desktop sidebar stays still
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Universal App Header Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/90 border-b border-amber-900/40 px-4 py-2.5 backdrop-blur-md flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Toggle Button */}
          <button
            type="button"
            onClick={() => {
              nauticalAudio.playClick();
              setSidebarOpen(!sidebarOpen);
            }}
            className="p-2 rounded-lg bg-slate-900 border border-amber-900/40 text-amber-400 hover:text-amber-200 hover:border-amber-500 transition-all flex items-center gap-1.5 font-mono text-xs cursor-pointer shadow-md active:scale-95"
            aria-label="Toggle navigation sidebar"
          >
            {sidebarOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5 text-amber-400" />}
            <span className="font-bold uppercase tracking-wider text-[11px] sm:text-xs">Navigation</span>
          </button>

          {/* Universal Back Button (shown on subpages) */}
          {pathname !== "/" && (
            <button
              type="button"
              onClick={handleBack}
              className="px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-900/50 text-amber-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md active:scale-95"
              title="Go back to previous page"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Back</span>
            </button>
          )}

          {/* Current Page Breadcrumb Badge */}
          <div className="flex items-center gap-2 border-l border-amber-900/30 pl-3">
            <Link
              href="/"
              className="text-xs font-mono text-slate-500 hover:text-amber-400 transition-colors hidden md:inline cursor-pointer"
              title="Return to Quarterdeck (Home)"
            >
              Dead Man's Cipher
            </Link>
            <span className="text-xs font-mono text-slate-500 hidden md:inline">/</span>
            <span className="text-xs font-serif font-bold text-amber-200 flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-amber-500" /> {currentTitle}
            </span>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cipher Ready (AES-GCM / Ed25519)</span>
          </div>

          <button
            type="button"
            onClick={handleToggleAudio}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-amber-900/40 text-amber-400 hover:text-amber-300 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95"
            title={isMuted ? "Unmute Audio" : "Mute Audio"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />}
            <span className="hidden sm:inline text-[11px] font-medium">{isMuted ? "Muted" : "Audio On"}</span>
          </button>
        </div>
      </header>

      {/* App Shell Content Container */}
      <div className="flex-1 flex relative">
        {/* Sidebar Drawer Container — Stationary on Desktop (lg:static lg:translate-x-0) */}
        <div
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-950 border-r border-amber-900/40 transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0 lg:static lg:translate-x-0" : "-translate-x-full lg:hidden"
          }`}
          style={{ top: "49px" }}
        >
          <Sidebar onNavigate={handleNavClick} />
        </div>

        {/* Mobile & Drawer Backdrop Overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 z-30 lg:hidden backdrop-blur-sm transition-opacity"
            style={{ top: "49px" }}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 hex-grid-bg overflow-x-hidden w-full max-w-full min-h-[calc(100vh-49px)]">
          {children}
        </main>
      </div>
    </div>
  );
}
