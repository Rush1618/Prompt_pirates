"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { nauticalAudio } from "@/lib/audio";
import { RefreshCw, Copy, Check, ShieldCheck, KeyRound, Dices } from "lucide-react";

interface Nautical3DCompassProps {
  height?: string;
  interactive?: boolean;
  onSeedGenerated?: (seedHex: string) => void;
}

export function Nautical3DCompass({
  height = "380px",
  interactive = true,
  onSeedGenerated,
}: Nautical3DCompassProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeStatus, setActiveStatus] = useState("3D CIPHER ENGINE READY");
  const [dialAngle, setDialAngle] = useState(137);
  const [entropySeed, setEntropySeed] = useState("0x9f4a8b2c1d3e5f7a");
  const [copied, setCopied] = useState(false);

  // References for Three.js objects
  const compassGroupRef = useRef<THREE.Group | null>(null);
  const coreMatRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Helper to generate WebCrypto entropy seed
  const generateRealEntropy = () => {
    nauticalAudio.playClick();
    setIsSpinning(true);
    setActiveStatus("CALCULATING WEBCRYPTO HARDWARE ENTROPY...");

    // Generate random 8 bytes using Web Crypto API
    const bytes = new Uint8Array(8);
    window.crypto.getRandomValues(bytes);
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    const newSeed = `0x${hex}`;
    const newAngle = Math.floor(Math.random() * 360);

    setDialAngle(newAngle);
    setEntropySeed(newSeed);
    onSeedGenerated?.(newSeed);

    setTimeout(() => {
      setIsSpinning(false);
      setActiveStatus(`ENTROPY GENERATED (${newAngle}° ALIGNED)`);
      nauticalAudio.playChime();
    }, 800);
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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xfffae6, 0.6);
    scene.add(ambientLight);

    const goldPointLight = new THREE.PointLight(0xe8c56e, 3, 15);
    goldPointLight.position.set(2, 3, 4);
    scene.add(goldPointLight);

    const emeraldPointLight = new THREE.PointLight(0x22c55e, 2, 10);
    emeraldPointLight.position.set(-3, -2, 2);
    scene.add(emeraldPointLight);

    // 5. 3D Compass Group
    const compassGroup = new THREE.Group();
    compassGroupRef.current = compassGroup;
    scene.add(compassGroup);

    // Gold Outer Brass Ring
    const ringGeo = new THREE.TorusGeometry(1.6, 0.08, 24, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xc9a84c,
      metalness: 0.85,
      roughness: 0.25,
      emissive: 0x3d2f0d,
    });
    const outerRing = new THREE.Mesh(ringGeo, ringMat);
    compassGroup.add(outerRing);

    // Inner Gimbal Ring
    const innerRingGeo = new THREE.TorusGeometry(1.3, 0.04, 16, 80);
    const innerRingMat = new THREE.MeshStandardMaterial({
      color: 0xe8c56e,
      metalness: 0.9,
      roughness: 0.2,
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = Math.PI / 4;
    compassGroup.add(innerRing);

    // Central Cipher Core (Icosahedron)
    const coreGeo = new THREE.IcosahedronGeometry(0.55, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      wireframe: true,
      emissive: 0x1a7a4a,
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

    // 6. Particle Sea Mist / Starfield
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

    // Mouse Interaction Target Positions
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

      // Smooth rotation dampening
      if (compassGroupRef.current) {
        const spinVel = isSpinning ? 0.08 : 0.005;
        compassGroupRef.current.rotation.y += (targetRotY - compassGroupRef.current.rotation.y) * 0.05 + spinVel;
        compassGroupRef.current.rotation.x += (targetRotX - compassGroupRef.current.rotation.x) * 0.05;
      }

      innerRing.rotation.y = elapsedTime * 0.8;
      innerRing.rotation.z = elapsedTime * 0.4;
      coreMesh.rotation.y = -elapsedTime * 1.2;
      gemMesh.rotation.x = elapsedTime * 1.5;

      // Pulse core light
      if (coreMatRef.current) {
        coreMatRef.current.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 3) * 0.3;
      }

      // Particles float
      particles.rotation.y = elapsedTime * 0.02;

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
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
  }, [interactive, isSpinning]);

  const handleCopySeed = () => {
    navigator.clipboard.writeText(entropySeed);
    setCopied(true);
    nauticalAudio.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-900/40 p-4 shadow-2xl backdrop-blur-xl overflow-hidden group space-y-3">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onClick={generateRealEntropy}
        style={{ height }}
        className="w-full cursor-pointer flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.01]"
      />

      {/* Real Functional 3D Control Bar & Readout */}
      <div className="bg-slate-950/90 border border-amber-900/40 rounded-xl p-3 backdrop-blur-md space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-900/30 pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isSpinning ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
            <span className="font-mono text-xs font-bold text-amber-200 tracking-wider uppercase">
              {activeStatus}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
            <span>Dial Angle: <strong className="text-amber-400 font-bold">{dialAngle}°</strong></span>
            <span>Vector Skew: <strong className="text-emerald-400 font-bold">17.92° N</strong></span>
          </div>
        </div>

        {/* Functional Control Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] text-slate-400 flex items-center gap-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-500" /> Derived Entropy Seed:
            </span>
            <code className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
              {entropySeed}
            </code>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={generateRealEntropy}
              disabled={isSpinning}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-mono text-xs font-bold rounded flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Generate WebCrypto Entropy</span>
            </button>

            <button
              type="button"
              onClick={handleCopySeed}
              className="px-3 py-1.5 bg-slate-900 border border-amber-900/40 hover:border-amber-500 text-amber-300 font-mono text-xs rounded flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
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
