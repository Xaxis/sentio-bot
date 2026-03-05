"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { SimState } from "@/lib/types";
import { SentioGraph } from "./SentioGraph";
import { ParticleField } from "./ParticleField";
import { ConsciousnessRing } from "./ConsciousnessRing";

interface Scene3DProps {
    simRef: React.MutableRefObject<SimState>;
    showLabels: boolean;
    nodeDescriptions: [string, string, string, string];
}

export function Scene3D({ simRef, showLabels, nodeDescriptions }: Scene3DProps) {
    return (
        <Canvas
            camera={{
                position: [0, 1.5, 11],
                fov: 55,
                near: 0.01,
                far: 1000,
            }}
            style={{ background: "#000000" }}
        >
            <color attach="background" args={["#000000"]} />

            {/* Scene lighting */}
            <ambientLight intensity={0.08} />
            <pointLight position={[10, 10, 10]} intensity={0.4} color="#1e3a5f" />
            <pointLight position={[-10, -5, -10]} intensity={0.2} color="#1a1a2e" />

            {/* Background star field — contracts & warms with C */}
            <ParticleField count={2500} spread={80} simRef={simRef} />

            {/* Dynamic consciousness score ring */}
            <ConsciousnessRing simRef={simRef} />

            {/* The 4-node sentio consciousness graph */}
            <SentioGraph simRef={simRef} showLabels={showLabels} nodeDescriptions={nodeDescriptions} />

            {/* Camera controls */}
            <OrbitControls
                enableDamping
                dampingFactor={0.06}
                minDistance={3}
                maxDistance={25}
                makeDefault
            />
        </Canvas>
    );
}

