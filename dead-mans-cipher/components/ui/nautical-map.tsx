"use client";

import { useState } from "react";
import { MapPin, Navigation } from "lucide-react";

export interface NauticalPresetLocation {
  id: string;
  name: string;
  coordinates: string;
  x: number; // Percentage on SVG chart
  y: number; // Percentage on SVG chart
  region: string;
}

export const NAUTICAL_PRESETS: NauticalPresetLocation[] = [
  {
    id: "port_royal",
    name: "Port Royal, Jamaica",
    coordinates: "17.9241° N, 76.8122° W",
    x: 35,
    y: 55,
    region: "Caribbean Sea",
  },
  {
    id: "tortuga",
    name: "Isla de la Tortuga",
    coordinates: "20.0543° N, 72.8790° W",
    x: 48,
    y: 45,
    region: "Hispaniola",
  },
  {
    id: "nassau",
    name: "Nassau, Bahamas",
    coordinates: "25.0343° N, 77.3963° W",
    x: 32,
    y: 28,
    region: "New Providence",
  },
  {
    id: "cape_good_hope",
    name: "Cape of Good Hope",
    coordinates: "34.3568° S, 18.4740° E",
    x: 82,
    y: 85,
    region: "Atlantic-Indian Ocean",
  },
  {
    id: "secret_atoll",
    name: "Kraken's Secret Atoll",
    coordinates: "14.2500° N, 81.1200° W",
    x: 22,
    y: 72,
    region: "Uncharted Waters",
  },
];

interface NauticalMapProps {
  onSelectCoordinates?: (coords: string, name: string) => void;
  selectedCoordinates?: string;
}

export function NauticalMap({ onSelectCoordinates, selectedCoordinates }: NauticalMapProps) {
  const [activePreset, setActivePreset] = useState<NauticalPresetLocation>(NAUTICAL_PRESETS[0]);

  const handlePinClick = (preset: NauticalPresetLocation) => {
    setActivePreset(preset);
    if (onSelectCoordinates) {
      onSelectCoordinates(preset.coordinates, preset.name);
    }
  };

  return (
    <div className="bg-slate-950 border border-amber-900/40 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between font-serif text-xs font-bold text-amber-200">
        <span className="flex items-center gap-1.5">
          <Navigation className="w-4 h-4 text-amber-500" /> Interactive Nautical Chart Map
        </span>
        <span className="font-mono text-amber-400 font-normal">
          {activePreset.name} ({activePreset.region})
        </span>
      </div>

      {/* Interactive SVG Chart Container */}
      <div className="relative w-full h-52 bg-slate-900/90 rounded-lg border border-amber-900/30 overflow-hidden">
        {/* SVG Grid & Compass Backdrop */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#d97706" strokeWidth="0.5" strokeDasharray="2,2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#gridPattern)" />
          {/* Waves background paths */}
          <path d="M 10 30 Q 50 10 90 30 T 170 30 T 250 30" stroke="#f59e0b" strokeWidth="0.5" fill="none" opacity="0.3" />
          <path d="M 30 110 Q 80 90 130 110 T 230 110" stroke="#f59e0b" strokeWidth="0.5" fill="none" opacity="0.3" />
        </svg>

        {/* Clickable Preset Pins */}
        {NAUTICAL_PRESETS.map((preset) => {
          const isSelected = selectedCoordinates?.includes(preset.coordinates) || activePreset.id === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handlePinClick(preset)}
              style={{ left: `${preset.x}%`, top: `${preset.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 group transition-all"
              title={`${preset.name} (${preset.coordinates})`}
            >
              <div className="relative flex items-center justify-center">
                <MapPin
                  className={`w-6 h-6 transition-all ${
                    isSelected
                      ? "text-amber-400 scale-125 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                      : "text-amber-900/80 hover:text-amber-500 hover:scale-110"
                  }`}
                />
                {isSelected && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Preset Location Buttons Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
        {NAUTICAL_PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => handlePinClick(p)}
            className={`px-2.5 py-1.5 rounded text-[11px] font-mono border transition-all text-left truncate ${
              activePreset.id === p.id
                ? "bg-amber-950 border-amber-500 text-amber-200 font-bold"
                : "bg-slate-900 border-amber-900/30 text-slate-400 hover:border-amber-700"
            }`}
          >
            📍 {p.name.split(",")[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
