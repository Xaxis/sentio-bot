"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SimState } from "@/lib/types";
import { sigmoidInteraction } from "@/lib/simulation";

const PARTICLE_COUNT = 2; // flow particles per directed edge

interface QualiaEdgeProps {
    fromIndex: number;
    toIndex: number;
    startPos: [number, number, number];
    endPos: [number, number, number];
    fromColor: string;
    toColor: string;
    simRef: React.MutableRefObject<SimState>;
}

export function QualiaEdge({ fromIndex, toIndex, startPos, endPos, fromColor, simRef }: QualiaEdgeProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);

    // Flow particle refs
    const p0Ref = useRef<THREE.Mesh>(null);
    const p1Ref = useRef<THREE.Mesh>(null);
    const pMat0Ref = useRef<THREE.MeshStandardMaterial>(null);
    const pMat1Ref = useRef<THREE.MeshStandardMaterial>(null);

    const edgeColor = useMemo(() => new THREE.Color(fromColor), [fromColor]);

    // Pre-allocate vectors for start/end (avoids GC each frame)
    const startVec = useMemo(() => new THREE.Vector3(...startPos), [startPos]);
    const endVec = useMemo(() => new THREE.Vector3(...endPos), [endPos]);

    // Shared tiny sphere geometry for flow particles
    const particleGeo = useMemo(() => new THREE.SphereGeometry(0.035, 8, 6), []);

    // Static edge geometry: unit cylinder positioned at midpoint
    const { position, quaternion, length } = useMemo(() => {
        const s = new THREE.Vector3(...startPos);
        const e = new THREE.Vector3(...endPos);
        const len = s.distanceTo(e);
        const mid = s.clone().add(e).multiplyScalar(0.5);
        const dir = e.clone().sub(s).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        return { position: mid, quaternion: quat, length: len };
    }, [startPos, endPos]);

    useFrame(({ clock }) => {
        const { Q, W, params } = simRef.current;
        const wij = W[fromIndex][toIndex];
        const t = clock.getElapsedTime();

        // ── Edge cylinder opacity/emissive ──────────────────────────────
        if (matRef.current) {
            if (wij < 0.01) {
                matRef.current.opacity = 0;
            } else {
                const fVal = sigmoidInteraction(Q[fromIndex], Q[toIndex], params.k, params.alpha);
                const flow = 0.5 + 0.5 * Math.sin(t * 1.5 + fromIndex * 0.9 + toIndex * 1.3);
                matRef.current.opacity = 0.12 + wij * fVal * 0.65 * (0.8 + 0.2 * flow);
                matRef.current.emissiveIntensity = 0.3 + wij * fVal * 1.4;
            }
        }

        // ── Directional flow particles ──────────────────────────────────
        // Travel from source → target. Speed/opacity scale with interaction
        // strength. Source-coloured, so you can see "who drives whom".
        const fVal = sigmoidInteraction(Q[fromIndex], Q[toIndex], params.k, params.alpha);
        const strength = wij * fVal;
        const speed = 0.15 + strength * 0.8;

        const particleRefs = [p0Ref, p1Ref];
        const matRefs = [pMat0Ref, pMat1Ref];

        for (let p = 0; p < PARTICLE_COUNT; p++) {
            const pRef = particleRefs[p];
            const mRef = matRefs[p];
            if (!pRef.current || !mRef.current) continue;

            // Phase: offset each particle evenly so they don't bunch
            const phase = ((t * speed + p * (1 / PARTICLE_COUNT)) % 1 + 1) % 1;
            pRef.current.position.lerpVectors(startVec, endVec, phase);

            // Size: bigger when stronger
            pRef.current.scale.setScalar(0.5 + strength * 1.5);

            // Opacity: sin fade (0 at ends, peak in middle), overall strength-scaled
            const fade = Math.sin(phase * Math.PI);
            mRef.current.opacity = strength * 0.75 * fade;
            mRef.current.emissiveIntensity = 0.4 + strength * 2.5;
        }
    });

    const w = simRef.current.W[fromIndex][toIndex];
    const baseRadius = 0.012 + w * 0.028;

    return (
        <>
            {/* Edge cylinder */}
            <mesh
                ref={meshRef}
                position={position}
                quaternion={quaternion}
                scale={[1, length, 1]}
            >
                <cylinderGeometry args={[baseRadius, baseRadius, 1, 6, 1]} />
                <meshStandardMaterial
                    ref={matRef}
                    color={edgeColor}
                    emissive={edgeColor}
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.3}
                    depthWrite={false}
                />
            </mesh>

            {/* Flow particle 0 */}
            <mesh ref={p0Ref} geometry={particleGeo}>
                <meshStandardMaterial
                    ref={pMat0Ref}
                    color={fromColor}
                    emissive={fromColor}
                    emissiveIntensity={1}
                    transparent
                    opacity={0}
                    depthWrite={false}
                />
            </mesh>

            {/* Flow particle 1 */}
            <mesh ref={p1Ref} geometry={particleGeo}>
                <meshStandardMaterial
                    ref={pMat1Ref}
                    color={fromColor}
                    emissive={fromColor}
                    emissiveIntensity={1}
                    transparent
                    opacity={0}
                    depthWrite={false}
                />
            </mesh>
        </>
    );
}

