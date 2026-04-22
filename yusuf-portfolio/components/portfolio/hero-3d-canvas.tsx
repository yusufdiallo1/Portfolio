"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, Stars, MeshDistortMaterial, Icosahedron, Torus, Sphere } from "@react-three/drei";
import { useEffect, useRef, useMemo } from "react";
import * as THREE from "three";

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

function GlowSphere({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.12;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.18;
  });
  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={1.2}>
      <Sphere ref={meshRef} args={[1.35, 64, 64]} position={position}>
        <MeshDistortMaterial
          color={C.react}
          emissive={C.react}
          emissiveIntensity={0.22}
          distort={0.42}
          speed={2.2}
          roughness={0.08}
          metalness={0.85}
          transparent
          opacity={0.72}
        />
      </Sphere>
    </Float>
  );
}

function SpinningTorus({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.22;
    ref.current.rotation.y = state.clock.elapsedTime * 0.14;
    ref.current.rotation.z = state.clock.elapsedTime * 0.09;
  });
  return (
    <Float speed={1.8} floatIntensity={1.6} rotationIntensity={0.6}>
      <Torus ref={ref} args={[0.7, 0.22, 32, 100]} position={position}>
        <meshStandardMaterial
          color={color} emissive={color} emissiveIntensity={0.35}
          roughness={0.1} metalness={0.9} transparent opacity={0.8}
        />
      </Torus>
    </Float>
  );
}

function WireIco({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.17;
    ref.current.rotation.y = state.clock.elapsedTime * 0.25;
  });
  return (
    <Float speed={1.2} floatIntensity={1.0} rotationIntensity={0.8}>
      <Icosahedron ref={ref} args={[0.9, 1]} position={position}>
        <meshStandardMaterial
          color={color} emissive={color} emissiveIntensity={0.4}
          roughness={0.05} metalness={1} wireframe
        />
      </Icosahedron>
    </Float>
  );
}

function AccentOrbs() {
  const configs = useMemo(() => [
    { pos: [-4.5,  2.2, -3] as [number,number,number], color: C.js,   s: 0.18, sp: 2.2 },
    { pos: [ 4.2,  1.8, -4] as [number,number,number], color: C.css,  s: 0.14, sp: 1.6 },
    { pos: [-3.8, -2.4, -2] as [number,number,number], color: C.go,   s: 0.22, sp: 2.8 },
    { pos: [ 3.5, -1.6, -3] as [number,number,number], color: C.rust, s: 0.16, sp: 2.0 },
    { pos: [ 0.8,  3.1, -5] as [number,number,number], color: C.ts,   s: 0.12, sp: 3.1 },
  ], []);

  return (
    <>
      {configs.map((c, i) => (
        <Float key={i} speed={c.sp} floatIntensity={2} rotationIntensity={0}>
          <Sphere args={[c.s, 16, 16]} position={c.pos}>
            <meshStandardMaterial
              color={c.color} emissive={c.color} emissiveIntensity={0.9}
              roughness={0} metalness={1}
            />
          </Sphere>
        </Float>
      ))}
    </>
  );
}

export default function Hero3DCanvas() {
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

      <ambientLight intensity={0.08} />
      <directionalLight position={[5, 8, 5]}   intensity={1.2} color={C.react} />
      <directionalLight position={[-8, -4, -6]} intensity={0.6} color={C.ts} />
      <pointLight position={[0, 0, 4]}   intensity={2.0} color={C.react} distance={12} decay={2} />
      <pointLight position={[-5, 3, -2]} intensity={1.0} color={C.go}    distance={10} decay={2} />
      <pointLight position={[5, -3, 0]}  intensity={0.8} color={C.css}   distance={8}  decay={2} />

      <Stars radius={90} depth={60} count={5500} factor={4} saturation={0.6} fade speed={0.4} />

      <GlowSphere position={[2.6, 0.3, 0]} />
      <SpinningTorus position={[-3.2, 0.8, -1.5]} color={C.ts} />
      <WireIco position={[3.8, 2.4, -2]}   color={C.js} />
      <WireIco position={[-2.4, -2.2, -3]} color={C.css} />
      <AccentOrbs />
    </Canvas>
  );
}
