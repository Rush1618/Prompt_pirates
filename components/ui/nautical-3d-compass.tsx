"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { nauticalAudio } from "@/lib/audio";
import { Copy, Check, KeyRound, Dices, Lock, Unlock, Compass, Layers } from "lucide-react";

interface Nautical3DCompassProps {
  height?: string;
  interactive?: boolean;
  mode?: "vault" | "inspector" | "entropy";
  verificationStatus?: "idle" | "verifying" | "pass" | "fail";
  onAngleChange?: (
    outerAngleDeg: number,
    innerAngleDeg: number,
    seedHex: string,
    saltHex: string,
    outerHexKey: string,
    innerHexKey: string
  ) => void;
}

export function Nautical3DCompass({
  height = "380px",
  interactive = true,
  mode = "vault",
  verificationStatus = "idle",
  onAngleChange,
}: Nautical3DCompassProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [outerAngle, setOuterAngle] = useState(137);
  const [innerAngle, setInnerAngle] = useState(76);
  const [outerHexKey, setOuterHexKey] = useState("0x9f4a8b2c");
  const [innerHexKey, setInnerHexKey] = useState("0x1d3e5f7a");
  const [entropySeed, setEntropySeed] = useState("0x9f4a8b2c1d3e5f7a");
  const [saltHex, setSaltHex] = useState("0x7a8b9c0d1e2f3a4b");
  const [isLocked, setIsLocked] = useState(true);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState("DUAL 3D COMPASS RINGS ALIGNED");

  // References for Three.js objects
  const compassGroupRef = useRef<THREE.Group | null>(null);
  const outerRingRef = useRef<THREE.Mesh | null>(null);
  const innerRingRef = useRef<THREE.Mesh | null>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Compute Hex Numbers & Letters Encryption Keys from Dual 3D Rings
  const updateKeyParameters = (outerDeg: number, innerDeg: number) => {
    const enc = new TextEncoder();
    const outerStr = `DMC_OUTER_HEX_KEY:${outerDeg}`;
    const innerStr = `DMC_INNER_HEX_KEY:${innerDeg}`;

    Promise.all([
      crypto.subtle.digest("SHA-256", enc.encode(outerStr)),
      crypto.subtle.digest("SHA-256", enc.encode(innerStr)),
    ]).then(([outerBuf, innerBuf]) => {
      const hOuter = Array.from(new Uint8Array(outerBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const hInner = Array.from(new Uint8Array(innerBuf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      const hex1 = `0x${hOuter.substring(0, 8)}`;
      const hex2 = `0x${hInner.substring(0, 8)}`;
      const fullSeed = `${hex1}${hex2.replace("0x", "")}`;
      const fullSalt = `0x${hOuter.substring(8, 16)}${hInner.substring(8, 16)}`;

      setOuterHexKey(hex1);
      setInnerHexKey(hex2);
      setEntropySeed(fullSeed);
      setSaltHex(fullSalt);
      onAngleChange?.(outerDeg, innerDeg, fullSeed, fullSalt, hex1, hex2);
    });
  };

  // Generate Real Hardware Random Entropy via Web Crypto for Dual Rings
  const handleGenerateEntropy = () => {
    nauticalAudio.playClick();
    setIsSpinning(true);
    setStatusMessage("HARVESTING DUAL-AXIS WEBCRYPTO HARDWARE ENTROPY...");

    const bytes = new Uint8Array(8);
    window.crypto.getRandomValues(bytes);
    const newOuter = Math.round((bytes[0] * 360) / 255);
    const newInner = Math.round((bytes[1] * 360) / 255);

    setOuterAngle(newOuter);
    setInnerAngle(newInner);
    updateKeyParameters(newOuter, newInner);

    setTimeout(() => {
      setIsSpinning(false);
      setStatusMessage(`DUAL RINGS ALIGNED: OUTER ${outerHexKey} × INNER ${innerHexKey}`);
      nauticalAudio.playChime();
    }, 800);
  };

  // Handle Manual Outer Slider Change
  const handleOuterSliderChange = (newOuter: number) => {
    setOuterAngle(newOuter);
    updateKeyParameters(newOuter, innerAngle);

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = (newOuter * Math.PI) / 180;
    }
  };

  // Handle Manual Inner Slider Change
  const handleInnerSliderChange = (newInner: number) => {
    setInnerAngle(newInner);
    updateKeyParameters(outerAngle, newInner);

    if (innerRingRef.current) {
      innerRingRef.current.rotation.y = (newInner * Math.PI) / 180;
    }
  };

  const toggleLockState = () => {
    const nextLocked = !isLocked;
    setIsLocked(nextLocked);
    if (nextLocked) {
      nauticalAudio.playAlarm();
      setStatusMessage("DUAL CIPHER RINGS SEALED");
    } else {
      nauticalAudio.playBell();
      setStatusMessage("DUAL CIPHER RINGS UNSEALED");
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const h = container.clientHeight || 380;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0f1c, 0.08);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / h, 0.1, 1000);
    camera.position.set(0, 0, 5.5);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xfffae6, 0.6);
    scene.add(ambientLight);

    const goldPointLight = new THREE.PointLight(0xe8c56e, 3, 15);
    goldPointLight.position.set(2, 3, 4);
    scene.add(goldPointLight);

    const statusLightColor =
      verificationStatus === "pass" ? 0x22c55e : verificationStatus === "fail" ? 0xef4444 : 0x22c55e;

    const emeraldPointLight = new THREE.PointLight(statusLightColor, 2, 10);
    emeraldPointLight.position.set(-3, -2, 2);
    scene.add(emeraldPointLight);

    // 5. 3D Compass Group
    const compassGroup = new THREE.Group();
    compassGroupRef.current = compassGroup;
    scene.add(compassGroup);

    // Gold Outer Brass Ring (Bi-Directional Outer Ring)
    const ringGeo = new THREE.TorusGeometry(1.6, 0.08, 24, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: verificationStatus === "fail" ? 0xef4444 : 0xc9a84c,
      metalness: 0.85,
      roughness: 0.25,
      emissive: isLocked ? 0x3d2f0d : 0x1a7a4a,
    });
    const outerRing = new THREE.Mesh(ringGeo, ringMat);
    outerRing.rotation.z = (outerAngle * Math.PI) / 180;
    outerRingRef.current = outerRing;
    compassGroup.add(outerRing);

    // Inner Gimbal Ring (Bi-Directional Inner Ring)
    const innerRingGeo = new THREE.TorusGeometry(1.25, 0.05, 16, 80);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xe8c56e,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x2a1f0a,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 4;
    innerRing.rotation.y = (innerAngle * Math.PI) / 180;
    innerRingRef.current = innerRing;
    compassGroup.add(innerRing);

    // Central Cipher Core (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(0.55, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: verificationStatus === "fail" ? 0xef4444 : 0x22c55e,
      wireframe: true,
      emissive: verificationStatus === "fail" ? 0xc0392b : 0x1a7a4a,
      emissiveIntensity: 0.8,
    });
    coreMatRef.current = coreMat;
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    compassGroup.add(coreMesh);

    // Inner Gem Crystal
    const gemGeo = new THREE.OctahedronGeometry(0.35);
    const gemMat = new THREE.MeshPhongMaterial({
      color: 0xe8c56e,
      shininess: 100,
      emissive: 0x8a6f2e,
    });
    const gemMesh = new THREE.Mesh(gemGeo, gemMat);
    compassGroup.add(gemMesh);

    // 4 Compass Needle Points (North, South, East, West cones)
    const needleGroup = new THREE.Group();
    const coneGeo = new THREE.ConeGeometry(0.14, 0.9, 4);
    const northMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.7, roughness: 0.3 });
    const southMat = new THREE.MeshStandardMaterial({ color: 0xf0e6c8, metalness: 0.7, roughness: 0.3 });
    const eastWestMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, metalness: 0.7, roughness: 0.3 });

    // North Cone
    const northCone = new THREE.Mesh(coneGeo, northMat);
    northCone.position.set(0, 1.0, 0);
    needleGroup.add(northCone);

    // South Cone
    const southCone = new THREE.Mesh(coneGeo, southMat);
    southCone.position.set(0, -1.0, 0);
    southCone.rotation.z = Math.PI;
    needleGroup.add(southCone);

    // East Cone
    const eastCone = new THREE.Mesh(coneGeo, eastWestMat);
    eastCone.position.set(1.0, 0, 0);
    eastCone.rotation.z = -Math.PI / 2;
    needleGroup.add(eastCone);

    // West Cone
    const westCone = new THREE.Mesh(coneGeo, eastWestMat);
    westCone.position.set(-1.0, 0, 0);
    westCone.rotation.z = Math.PI / 2;
    needleGroup.add(westCone);

    compassGroup.add(needleGroup);

    // Particle Sea Mist
    const particleCount = 150;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 12;
      positions[i + 1] = (Math.random() - 0.5) * 12;
      positions[i + 2] = (Math.random() - 0.5) * 12;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      color: 0xc9a84c,
      transparent: true,
      opacity: 0.5,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Mouse Interaction
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      targetRotY = x * 1.2;
      targetRotX = y * 1.2;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (compassGroupRef.current) {
        const spinVel = isSpinning ? 0.1 : 0.003;
        compassGroupRef.current.rotation.y += (targetRotY - compassGroupRef.current.rotation.y) * 0.05 + spinVel;
        compassGroupRef.current.rotation.x += (targetRotX - compassGroupRef.current.rotation.x) * 0.05;
      }

      // Bi-directional rotation: Outer Ring Z vs Inner Ring Y
      if (outerRingRef.current) {
        outerRingRef.current.rotation.z = (outerAngle * Math.PI) / 180 + (isSpinning ? elapsedTime * 2 : 0);
      }
      if (innerRingRef.current) {
        innerRingRef.current.rotation.y = (innerAngle * Math.PI) / 180 - (isSpinning ? elapsedTime * 3 : elapsedTime * 0.4);
      }

      coreMesh.rotation.y = -elapsedTime * 1.2;
      gemMesh.rotation.x = elapsedTime * 1.5;

      if (coreMatRef.current) {
        coreMatRef.current.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 3) * 0.3;
      }

      particles.rotation.y = elapsedTime * 0.02;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactive, isSpinning, verificationStatus, isLocked, outerAngle, innerAngle]);

  const handleCopySeed = () => {
    navigator.clipboard.writeText(entropySeed);
    setCopied(true);
    nauticalAudio.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-900/40 p-3 sm:p-4 shadow-2xl backdrop-blur-xl overflow-hidden group space-y-3 sm:space-y-4">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onClick={handleGenerateEntropy}
        style={{ height }}
        className="w-full cursor-pointer flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.01] touch-manipulation"
      />

      {/* Bi-Directional Dual Ring Controls with Hex Numbers & Letters Encryption Keys */}
      <div className="bg-slate-950/90 border border-amber-900/40 rounded-xl p-3 sm:p-4 backdrop-blur-md space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between border-b border-amber-900/30 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-[11px] sm:text-xs font-bold text-amber-200 uppercase tracking-wider">
              Dual 3D Key Controls
            </span>
          </div>
          <button
            type="button"
            onClick={toggleLockState}
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isLocked
                ? "bg-amber-950 border border-amber-500/60 text-amber-300"
                : "bg-emerald-950 border border-emerald-500/60 text-emerald-300"
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isLocked ? "SEALED" : "UNSEALED"}</span>
          </button>
        </div>

        {/* Dual Ring Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Outer Ring Slider (Hex Key Block 1 before X) */}
          <div className="space-y-1.5 bg-slate-900/60 p-2.5 sm:p-3 rounded-lg border border-amber-900/30">
            <div className="flex justify-between items-center font-mono text-[11px] sm:text-xs">
              <span className="text-amber-300 font-bold truncate">Outer (Key Block 1):</span>
              <span className="text-emerald-400 font-bold font-mono ml-2 shrink-0">{outerHexKey}</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={outerAngle}
              onChange={(e) => handleOuterSliderChange(Number(e.target.value))}
              className="w-full h-3 bg-slate-950 border border-amber-900/40 rounded-lg appearance-none cursor-pointer accent-amber-500 touch-none"
            />
          </div>

          {/* Inner Ring Slider (Hex Key Block 2 after X) */}
          <div className="space-y-1.5 bg-slate-900/60 p-2.5 sm:p-3 rounded-lg border border-amber-900/30">
            <div className="flex justify-between items-center font-mono text-[11px] sm:text-xs">
              <span className="text-amber-300 font-bold truncate">Inner (Key Block 2):</span>
              <span className="text-emerald-400 font-bold font-mono ml-2 shrink-0">{innerHexKey}</span>
            </div>
            <input
              type="range"
              min="0"
              max="360"
              value={innerAngle}
              onChange={(e) => handleInnerSliderChange(Number(e.target.value))}
              className="w-full h-3 bg-slate-950 border border-amber-900/40 rounded-lg appearance-none cursor-pointer accent-amber-500 touch-none"
            />
          </div>
        </div>

        {/* Readouts & Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-amber-900/30 font-mono text-[11px] sm:text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-400">Combined Key:</span>
            <code className="text-amber-300 font-bold bg-amber-950/60 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded border border-amber-800/40 break-all">
              {outerHexKey} × {innerHexKey}
            </code>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleGenerateEntropy}
              disabled={isSpinning}
              className="flex-1 sm:flex-none px-3 py-2 sm:py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer min-h-[38px] sm:min-h-[32px]"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Bi-Directional Entropy</span>
            </button>

            <button
              type="button"
              onClick={handleCopySeed}
              className="px-3 py-2 sm:py-1.5 bg-slate-900 border border-amber-900/40 hover:border-amber-500 text-amber-300 font-mono text-xs rounded flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer min-h-[38px] sm:min-h-[32px]"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied!" : "Copy Seed"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
