"use client";

import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { SimState, CriterionMeta } from "@/lib/types";
import { sigmoidInteraction } from "@/lib/simulation";

interface SentioNodeProps {
    index: number;
    meta: CriterionMeta;
    simRef: React.MutableRefObject<SimState>;
    showLabels: boolean;
    description?: string;
}

const BASE_RADIUS = 0.22;
const HALO_RADIUS = 0.38;

export function SentioNode({ index, meta, simRef, showLabels, description }: SentioNodeProps) {
    const coreRef = useRef<THREE.Mesh>(null);
    const halo1Ref = useRef<THREE.Mesh>(null);
    const halo2Ref = useRef<THREE.Mesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);
    const haloMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const [hovered, setHovered] = useState(false);

    const color = new THREE.Color(meta.color);

    useFrame(({ clock }) => {
        const { Q, W, params } = simRef.current;
        const q = Q[index];
        const t = clock.getElapsedTime();

        // ── Phase synchronization ──────────────────────────────────────
        // Compute this node's average coupling strength with its 3 partners.
        // High coupling → phases converge (synchronized breathing).
        // Low coupling → independent phase offsets (fragmented pulsing).
        let avgCoupling = 0;
        for (let j = 0; j < 4; j++) {
            if (j !== index) {
                avgCoupling += W[index][j] * sigmoidInteraction(q, Q[j], params.k, params.alpha);
            }
        }
        avgCoupling /= 3; // normalize to 0–1

        const freq = 0.6 + q * 1.2;
        // Phase offset shrinks toward 0 as coupling increases → unison
        const phaseOffset = index * 1.2 * (1 - avgCoupling * 0.85);
        const pulse = 1 + Math.sin(t * freq + phaseOffset) * 0.12 * q;
        const scale = (0.6 + q * 0.7) * pulse;

        if (coreRef.current) {
            coreRef.current.scale.setScalar(scale);
        }

        // Halo layers: outer glow
        const haloScale = scale * (1.3 + 0.2 * Math.sin(t * freq * 0.7));
        if (halo1Ref.current) halo1Ref.current.scale.setScalar(haloScale);
        if (halo2Ref.current) halo2Ref.current.scale.setScalar(scale * 1.8 + 0.1 * Math.sin(t * 0.4 + index));

        // Emissive intensity reacts to q
        if (matRef.current) {
            matRef.current.emissiveIntensity = 0.4 + q * 1.6;
        }
        if (haloMatRef.current) {
            haloMatRef.current.opacity = 0.06 + q * 0.18;
        }

        // Point light brightness
        if (lightRef.current) {
            lightRef.current.intensity = q * 3.5;
        }
    });

    return (
        <group position={meta.position}>
            {/* Point light — gives environmental glow */}
            <pointLight ref={lightRef} color={meta.color} intensity={2} distance={6} decay={2} />

            {/* Outer diffuse halo */}
            <mesh ref={halo2Ref}>
                <sphereGeometry args={[HALO_RADIUS * 1.5, 16, 16]} />
                <meshStandardMaterial
                    color={meta.color}
                    transparent
                    opacity={0.04}
                    depthWrite={false}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Inner halo */}
            <mesh ref={halo1Ref}>
                <sphereGeometry args={[HALO_RADIUS, 16, 16]} />
                <meshStandardMaterial
                    ref={haloMatRef}
                    color={meta.color}
                    transparent
                    opacity={0.1}
                    depthWrite={false}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Core sphere — interactive hit target */}
            <mesh
                ref={coreRef}
                onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
                onPointerOut={() => setHovered(false)}
            >
                <sphereGeometry args={[BASE_RADIUS, 32, 32]} />
                <meshStandardMaterial
                    ref={matRef}
                    color={color}
                    emissive={color}
                    emissiveIntensity={1.0}
                    roughness={0.1}
                    metalness={0.3}
                />
            </mesh>

            {/* Label */}
            {showLabels && (
                <Html center position={[0, BASE_RADIUS * 2.8, 0]} zIndexRange={[0, 0]}>
                    <div className="pointer-events-none select-none text-center">
                        <div className="text-lg font-bold leading-none" style={{ color: meta.color, textShadow: `0 0 8px ${meta.color}` }}>
                            {meta.symbol}
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5 uppercase tracking-wider whitespace-nowrap font-medium">
                            {meta.shortName}
                        </div>
                    </div>
                </Html>
            )}

            {/* Hover tooltip */}
            {hovered && description && (
                <Html center position={[0, BASE_RADIUS * 5.5, 0]} zIndexRange={[10, 10]}>
                    <div
                        className="pointer-events-none select-none"
                        style={{ transform: "translateX(-50%)", minWidth: "200px", maxWidth: "240px" }}
                    >
                        <div
                            style={{
                                background: "rgba(15, 23, 42, 0.92)",
                                border: `1px solid ${meta.color}44`,
                                borderRadius: "10px",
                                padding: "10px 13px",
                                boxShadow: `0 0 18px ${meta.color}33, 0 4px 24px rgba(0,0,0,0.6)`,
                                backdropFilter: "blur(12px)",
                            }}
                        >
                            <div
                                style={{
                                    color: meta.color,
                                    fontSize: "10px",
                                    fontWeight: 700,
                                    letterSpacing: "0.12em",
                                    textTransform: "uppercase",
                                    marginBottom: "5px",
                                    textShadow: `0 0 8px ${meta.color}`,
                                }}
                            >
                                {meta.symbol} · {meta.name}
                            </div>
                            <div style={{ color: "#cbd5e1", fontSize: "11px", lineHeight: "1.55" }}>
                                {description}
                            </div>
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}


