"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, Icosahedron, Torus, Sphere } from "@react-three/drei";
import { useEffect, useRef, useMemo, useState } from "react";

const C = {
  react: "#61dafb",
  ts:    "#3178c6",
  js:    "#f7df1e",
  go:    "#00add8",
  css:   "#ff6b9d",
  rust:  "#ff4500",
} as const;

function CameraRig() {
  const { camera } = useThree();
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  useFrame((_, delta) => {
    camera.position.x += (mouse.current.x * 0.9 - camera.position.x) * delta * 1.2;
    camera.position.y += (-mouse.current.y * 0.6 - camera.position.y) * delta * 1.2;
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function FloatingShape({ 
  Shape, 
  args, 
  position, 
  color, 
  speed = 1, 
  rotationSpeed = 1 
}: { 
  Shape: any, 
  args: any, 
  position: [number, number, number], 
  color: string, 
  speed?: number, 
  rotationSpeed?: number 
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.x = t * 0.1 * rotationSpeed;
    ref.current.rotation.y = t * 0.15 * rotationSpeed;
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <Shape ref={ref} args={args} position={position}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.15}
          wireframe
          transparent
          opacity={0.12}
          roughness={0}
          metalness={1}
        />
      </Shape>
    </Float>
  );
}

export default function Hero3DCanvas() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 55, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      dpr={[1, 1.8]}
      style={{ background: "#0a0a0a" }}
    >
      <CameraRig />

      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      
      <Stars 
        radius={100} 
        depth={50} 
        count={5000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />

      {/* Subtle floating wireframes */}
      <FloatingShape 
        Shape={Icosahedron} 
        args={[1.5, 1]} 
        position={[3, 2, -5]} 
        color="#ffffff" 
        speed={1.2} 
      />
      <FloatingShape 
        Shape={Torus} 
        args={[2, 0.05, 16, 100]} 
        position={[-4, -2, -8]} 
        color="#ffffff" 
        speed={0.8} 
      />
      <FloatingShape 
        Shape={Sphere} 
        args={[1, 32, 32]} 
        position={[5, -3, -10]} 
        color="#ffffff" 
        speed={1.5} 
      />
      <FloatingShape 
        Shape={Icosahedron} 
        args={[2, 0]} 
        position={[-6, 4, -12]} 
        color="#ffffff" 
        speed={0.5} 
      />
    </Canvas>
  );
}
