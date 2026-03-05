import type { LucideIcon } from "lucide-react";

/**
 * Sentio criteria indices:
 * 0 = Φ (Phi)  - Information Integration
 * 1 = Ψ (Psi)  - Adaptive Self-Referential Processing
 * 2 = Θ (Theta) - Temporal Continuity
 * 3 = Ω (Omega) - Behavioral & Representational Complexity
 */

export type QValues = [number, number, number, number];

/** 4×4 interaction weight matrix (row i influences column j: W[i][j]) */
export type WMatrix = [
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
    [number, number, number, number],
];

/** Parameters governing the ODE dynamics */
export interface SimParams {
    lambda: number; // decay rate λ
    k: number;      // sigmoid steepness
    alpha: number;  // interaction threshold α
    speed: number;  // simulation speed multiplier
}

/** Full simulation state held in a ref for framerate-independent updates */
export interface SimState {
    Q: QValues;
    W: WMatrix;
    params: SimParams;
    t: number;
    isPlaying: boolean;
}

export type ArchetypeCategory = "minimal" | "invertebrate" | "vertebrate" | "artificial" | "hybrid" | "hypothetical";

/** A named preset representing a system archetype */
export interface CaseStudy {
    id: string;
    Icon: LucideIcon;       // Lucide icon component for this archetype
    label: string;          // Short label for buttons
    name: string;           // Full display name
    description: string;    // Explanation of the system
    /** Per-node hover descriptions: [Φ, Ψ, Θ, Ω] */
    nodeDescriptions: [string, string, string, string];
    category: ArchetypeCategory;
    initialQ: QValues;
    W: WMatrix;
    color: string;          // Accent color hex
}

export interface CategoryMeta {
    id: ArchetypeCategory;
    label: string;
    color: string;          // Hex accent for the group header
}

/** One criterion node's metadata */
export interface CriterionMeta {
    symbol: string;    // e.g. "Φ"
    name: string;      // e.g. "Information Integration"
    shortName: string; // e.g. "Integration"
    color: string;     // hex
    position: [number, number, number]; // 3D position in scene
}

