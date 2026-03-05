"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SimState } from "@/lib/types";
import { computeC } from "@/lib/simulation";

interface ConsciousnessRingProps {
    simRef: React.MutableRefObject<SimState>;
}

/**
 * A dynamic torus ring whose size, glow, and rotation speed
 * reflect the live consciousness score C.
 * Low C → dim, slow, small ring. High C → bright, fast, large.
 */
export function ConsciousnessRing({ simRef }: ConsciousnessRingProps) {
    const outerRingRef  = useRef<THREE.Mesh>(null);
    const innerRingRef  = useRef<THREE.Mesh>(null);
    const outerMatRef   = useRef<THREE.MeshStandardMaterial>(null);
    const innerMatRef   = useRef<THREE.MeshStandardMaterial>(null);
    const groupRef      = useRef<THREE.Group>(null);
    const cSmoothed     = useRef(0);

    // Torus: args = [radius, tube, radialSegs, tubularSegs]
    const outerGeo = useMemo(() => new THREE.TorusGeometry(3.6, 0.018, 8, 128), []);
    const innerGeo = useMemo(() => new THREE.TorusGeometry(3.1, 0.010, 8, 128), []);

    useFrame(({ clock }, delta) => {
        const { Q, W, params } = simRef.current;
        const cRaw = computeC(Q, W, params);

        // Exponential smoothing so the ring doesn't jitter
        cSmoothed.current += (cRaw - cSmoothed.current) * Math.min(delta * 3, 1);
        const c = cSmoothed.current;

        const t = clock.getElapsedTime();

        // Rotation: counter-rotation of inner/outer rings for a gyroscope feel
        if (groupRef.current) {
            groupRef.current.rotation.y  = t * (0.04 + c * 0.12);
            groupRef.current.rotation.x  = Math.sin(t * 0.15) * 0.35;
        }
        if (outerRingRef.current) {
            outerRingRef.current.rotation.z = t * (0.07 + c * 0.06);
        }
        if (innerRingRef.current) {
            innerRingRef.current.rotation.z = -t * (0.05 + c * 0.09);
        }

        // Outer ring: emissive & opacity
        if (outerMatRef.current) {
            const pulse = 0.5 + 0.5 * Math.sin(t * (1.2 + c * 2));
            outerMatRef.current.emissiveIntensity = (0.3 + c * 1.8) * (0.7 + 0.3 * pulse);
            outerMatRef.current.opacity = 0.15 + c * 0.75;
            // Color: shifts from slate (low C) → blue (mid) → white-blue (high C)
            const r = 0.18 + c * 0.05;
            const g = 0.25 + c * 0.40;
            const b = 0.45 + c * 0.55;
            outerMatRef.current.color.setRGB(r, g, b);
            outerMatRef.current.emissive.setRGB(r * 0.4, g * 0.6, b);
        }

        // Inner ring: subtler complement
        if (innerMatRef.current) {
            innerMatRef.current.emissiveIntensity = 0.2 + c * 1.2;
            innerMatRef.current.opacity = 0.08 + c * 0.5;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Outer ring */}
            <mesh ref={outerRingRef} geometry={outerGeo}>
                <meshStandardMaterial
                    ref={outerMatRef}
                    color="#3b82f6"
                    emissive="#1d4ed8"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.4}
                    depthWrite={false}
                />
            </mesh>

            {/* Inner ring — slightly tilted for 3D feel */}
            <mesh ref={innerRingRef} geometry={innerGeo} rotation={[Math.PI / 3, 0, 0]}>
                <meshStandardMaterial
                    ref={innerMatRef}
                    color="#8b5cf6"
                    emissive="#6d28d9"
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0.25}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
}

