"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { nauticalAudio } from "@/lib/audio";

interface Nautical3DCompassProps {
  height?: string;
  interactive?: boolean;
}

export function Nautical3DCompass({ height = "360px", interactive = true }: Nautical3DCompassProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [activeStatus, setActiveStatus] = useState("3D CIPHER ENGINE IDLE");

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 400;
    const h = container.clientHeight || 360;

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
    let spinVelocity = 0.005;

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
      compassGroup.rotation.y += (targetRotY - compassGroup.rotation.y) * 0.05 + spinVelocity;
      compassGroup.rotation.x += (targetRotX - compassGroup.rotation.x) * 0.05;

      innerRing.rotation.y = elapsedTime * 0.8;
      innerRing.rotation.z = elapsedTime * 0.4;
      coreMesh.rotation.y = -elapsedTime * 1.2;
      gemMesh.rotation.x = elapsedTime * 1.5;

      // Pulse core light
      coreMat.emissiveIntensity = 0.5 + Math.sin(elapsedTime * 3) * 0.3;

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
  }, [interactive]);

  const handleCompassClick = () => {
    nauticalAudio.playBell();
    setIsSpinning(true);
    setActiveStatus("EXECUTING WebCrypto 3D CIPHER ALIGNMENT...");

    setTimeout(() => {
      setIsSpinning(false);
      setActiveStatus("3D CIPHER ENGINE ALIGNED & ONLINE");
    }, 1800);
  };

  return (
    <div className="relative w-full rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-amber-900/40 p-4 shadow-2xl backdrop-blur-xl overflow-hidden group">
      {/* 3D WebGL Canvas Container */}
      <div
        ref={mountRef}
        onClick={handleCompassClick}
        style={{ height }}
        className="w-full cursor-pointer flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.02]"
      />

      {/* Interactive Overlay Info Pill */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between pointer-events-none px-4 py-2 bg-slate-950/80 border border-amber-900/40 rounded-xl backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isSpinning ? "bg-amber-400 animate-ping" : "bg-emerald-400"}`} />
          <span className="font-mono text-[11px] font-bold tracking-wider text-amber-200 uppercase">
            {activeStatus}
          </span>
        </div>
        <span className="font-mono text-[10px] text-slate-400">
          Click 3D sphere to calibrate
        </span>
      </div>
    </div>
  );
}
