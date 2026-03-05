"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SimState } from "@/lib/types";
import { computeC } from "@/lib/simulation";

interface ParticleFieldProps {
    count?: number;
    spread?: number;
    simRef: React.MutableRefObject<SimState>;
}

export function ParticleField({ count = 2500, spread = 80, simRef }: ParticleFieldProps) {
    const pointsRef = useRef<THREE.Points>(null);
    const cSmoothed = useRef(0);

    // Pre-allocated colors for lerp (avoid GC)
    const coldColor = useMemo(() => new THREE.Color("#94a3b8"), []);
    const warmColor = useMemo(() => new THREE.Color("#7dd3fc"), []);
    const tempColor = useMemo(() => new THREE.Color(), []);

    // Original (rest) positions, and per-particle normalized radius
    const { originalPositions, rNorms, sizes } = useMemo(() => {
        const originalPositions = new Float32Array(count * 3);
        const rNorms = new Float32Array(count);
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const r = spread * (0.4 + 0.6 * Math.cbrt(Math.random()));
            const theta = Math.acos(2 * Math.random() - 1);
            const phi = 2 * Math.PI * Math.random();
            const x = r * Math.sin(theta) * Math.cos(phi);
            const y = r * Math.sin(theta) * Math.sin(phi);
            const z = r * Math.cos(theta);
            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;
            // Normalized radius — outer particles contract more
            rNorms[i] = Math.sqrt(x * x + y * y + z * z) / spread;
            sizes[i] = Math.random() * 0.06 + 0.01;
        }
        return { originalPositions, rNorms, sizes };
    }, [count, spread]);

    // Mutable copy used as the live position attribute
    const livePositions = useMemo(() => new Float32Array(originalPositions), [originalPositions]);

    useFrame((_, delta) => {
        if (!pointsRef.current) return;

        // Slow rotation
        pointsRef.current.rotation.y += delta * 0.005;
        pointsRef.current.rotation.x += delta * 0.002;

        // ── React to consciousness score C ──────────────────────────────
        const { Q, W, params } = simRef.current;
        const cRaw = computeC(Q, W, params);
        cSmoothed.current += (cRaw - cSmoothed.current) * Math.min(delta * 2, 1);
        const c = cSmoothed.current;

        // Contract outer particles inward as C rises.
        // rNorm-weighted: particles near the shell contract most → density gradient.
        const posAttr = pointsRef.current.geometry.getAttribute("position") as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < count; i++) {
            const f = 1 - c * 0.45 * rNorms[i]; // 1.0 at C=0, ~0.55 at C=1 (shell)
            arr[i * 3]     = originalPositions[i * 3]     * f;
            arr[i * 3 + 1] = originalPositions[i * 3 + 1] * f;
            arr[i * 3 + 2] = originalPositions[i * 3 + 2] * f;
        }
        posAttr.needsUpdate = true;

        // Color: cold slate → warm sky-blue as C rises
        const mat = pointsRef.current.material as THREE.PointsMaterial;
        tempColor.copy(coldColor).lerp(warmColor, c * 0.7);
        mat.color.copy(tempColor);
        mat.opacity = 0.25 + c * 0.35;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[livePositions, 3]} />
                <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
            </bufferGeometry>
            <pointsMaterial
                size={0.05}
                color="#94a3b8"
                transparent
                opacity={0.35}
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
}

