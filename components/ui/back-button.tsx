"use client";

import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Anchor } from "lucide-react";
import Link from "next/link";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
  className?: string;
}

export function BackButton({ fallbackHref = "/", label = "Return to Quarterdeck", className = "" }: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Don't render back button on homepage Quarterdeck
  if (pathname === "/") return null;

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 2) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <div className={`flex items-center gap-2 mb-4 ${className}`}>
      <button
        type="button"
        onClick={handleBack}
        className="px-3.5 py-2 rounded-lg bg-slate-900/90 hover:bg-amber-950/60 border border-amber-900/50 hover:border-amber-500 text-amber-300 font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
        title="Go back to previous page"
      >
        <ArrowLeft className="w-4 h-4 text-amber-400" /> Back
      </button>

      <Link
        href={fallbackHref}
        className="px-3.5 py-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-amber-900/30 hover:border-amber-700 text-slate-400 hover:text-amber-200 font-mono text-xs flex items-center gap-1.5 transition-all cursor-pointer"
      >
        <Anchor className="w-3.5 h-3.5 text-amber-500" /> {label}
      </Link>
    </div>
  );
}
