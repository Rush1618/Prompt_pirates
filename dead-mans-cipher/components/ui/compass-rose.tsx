"use client";

interface CompassRoseProps {
  size?: number;
  state?: "idle" | "verifying" | "verified" | "failed";
  className?: string;
}

export function CompassRose({ size = 80, state = "idle", className = "" }: CompassRoseProps) {
  const stateClass =
    state === "verifying"
      ? "verifying"
      : state === "verified"
      ? "verified"
      : state === "failed"
      ? "failed"
      : "";

  const arrowColor =
    state === "verified"
      ? "var(--signal-green-bright)"
      : state === "failed"
      ? "var(--signal-red-bright)"
      : "var(--gold)";

  const ringColor =
    state === "verified"
      ? "var(--signal-green)"
      : state === "failed"
      ? "var(--signal-red)"
      : "var(--gold-dim)";

  return (
    <div
      className={`compass-container ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Compass rose — ${state}`}
    >
      <svg
        className={`compass-rose ${stateClass}`}
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer ring */}
        <circle cx="50" cy="50" r="46" stroke={ringColor} strokeWidth="1" opacity="0.4" />
        <circle cx="50" cy="50" r="42" stroke={ringColor} strokeWidth="0.5" opacity="0.3" />

        {/* Degree marks */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const isMajor = i % 9 === 0;
          const r1 = 42;
          const r2 = isMajor ? 36 : 39;
          const x1 = 50 + r1 * Math.sin(angle);
          const y1 = 50 - r1 * Math.cos(angle);
          const x2 = 50 + r2 * Math.sin(angle);
          const y2 = 50 - r2 * Math.cos(angle);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={ringColor}
              strokeWidth={isMajor ? "1.5" : "0.5"}
              opacity={isMajor ? "0.8" : "0.3"}
              suppressHydrationWarning
            />
          );
        })}

        {/* Cardinal direction arrows — N (gold/colored), others smaller */}
        {/* North — prominent */}
        <polygon
          points="50,6 44,46 50,42 56,46"
          fill={arrowColor}
          opacity="0.95"
        />
        {/* South */}
        <polygon
          points="50,94 56,54 50,58 44,54"
          fill={ringColor}
          opacity="0.5"
        />
        {/* East */}
        <polygon
          points="94,50 54,44 58,50 54,56"
          fill={ringColor}
          opacity="0.5"
        />
        {/* West */}
        <polygon
          points="6,50 46,56 42,50 46,44"
          fill={ringColor}
          opacity="0.5"
        />

        {/* Intercardinal arms */}
        {[45, 135, 225, 315].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x1 = 50 + 16 * Math.sin(rad);
          const y1 = 50 - 16 * Math.cos(rad);
          const x2 = 50 + 36 * Math.sin(rad);
          const y2 = 50 - 36 * Math.cos(rad);
          return (
            <line
              key={deg}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={ringColor}
              strokeWidth="1"
              opacity="0.4"
            />
          );
        })}

        {/* Inner circle */}
        <circle cx="50" cy="50" r="8" fill={ringColor} opacity="0.15" stroke={ringColor} strokeWidth="1" />
        <circle cx="50" cy="50" r="3" fill={arrowColor} opacity="0.9" />

        {/* N label */}
        <text
          x="50" y="30"
          textAnchor="middle"
          fontSize="7"
          fontFamily="Cinzel, serif"
          fontWeight="700"
          fill={arrowColor}
          letterSpacing="0.5"
        >
          N
        </text>
      </svg>
    </div>
  );
}
