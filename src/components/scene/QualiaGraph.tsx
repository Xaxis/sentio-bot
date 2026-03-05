"use client";

import { useFrame } from "@react-three/fiber";
import { SimState } from "@/lib/types";
import { CRITERIA, sigmoidInteraction } from "@/lib/simulation";
import { QualiaNode } from "./QualiaNode";
import { QualiaEdge } from "./QualiaEdge";
import { useRef } from "react";
import * as THREE from "three";

interface QualiaGraphProps {
    simRef: React.MutableRefObject<SimState>;
    showLabels: boolean;
}

export function QualiaGraph({ simRef, showLabels }: QualiaGraphProps) {
    const groupRef = useRef<THREE.Group>(null);
    const graphScaleRef = useRef(1);

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        const { Q, W, params } = simRef.current;

        // ── Dynamic graph radius ────────────────────────────────────────
        // Compute average interaction strength across all 12 directed pairs.
        // High coupling → compact cluster; low → sprawling scatter.
        let totalInteraction = 0;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                if (i !== j) {
                    totalInteraction += W[i][j] * sigmoidInteraction(Q[i], Q[j], params.k, params.alpha);
                }
            }
        }
        const avgInteraction = totalInteraction / 12; // 0 → ~1

        // Scale: 1.35 when fully disconnected → 0.65 when fully connected
        const targetScale = 1.35 - avgInteraction * 0.7;
        graphScaleRef.current += (targetScale - graphScaleRef.current) * Math.min(delta * 2.5, 1);

        groupRef.current.scale.setScalar(graphScaleRef.current);
        groupRef.current.rotation.y += delta * 0.06;
    });

    // All directed edges (i → j where i ≠ j)
    const edges: Array<{ from: number; to: number }> = [];
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (i !== j) edges.push({ from: i, to: j });
        }
    }

    return (
        <group ref={groupRef}>
            {/* Edges rendered first (behind nodes) */}
            {edges.map(({ from, to }) => (
                <QualiaEdge
                    key={`edge-${from}-${to}`}
                    fromIndex={from}
                    toIndex={to}
                    startPos={CRITERIA[from].position}
                    endPos={CRITERIA[to].position}
                    fromColor={CRITERIA[from].color}
                    toColor={CRITERIA[to].color}
                    simRef={simRef}
                />
            ))}

            {/* Nodes rendered on top */}
            {CRITERIA.map((meta, i) => (
                <QualiaNode
                    key={`node-${i}`}
                    index={i}
                    meta={meta}
                    simRef={simRef}
                    showLabels={showLabels}
                />
            ))}
        </group>
    );
}

