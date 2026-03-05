import { QValues, WMatrix, SimParams, CriterionMeta } from "./types";

// ─── Criterion Metadata ───────────────────────────────────────────────────────

/** Tetrahedral arrangement: equidistant 4-node layout inscribed in sphere r=2.5 */
export const CRITERIA: CriterionMeta[] = [
    {
        symbol: "Φ",
        name: "Information Integration",
        shortName: "Integration",
        color: "#3b82f6",
        position: [0, 2.5, 0],
    },
    {
        symbol: "Ψ",
        name: "Adaptive Self-Referential Processing",
        shortName: "Self-Reference",
        color: "#8b5cf6",
        position: [2.357, -0.833, 0],
    },
    {
        symbol: "Θ",
        name: "Temporal Continuity",
        shortName: "Temporal",
        color: "#06b6d4",
        position: [-1.179, -0.833, 2.041],
    },
    {
        symbol: "Ω",
        name: "Behavioral & Representational Complexity",
        shortName: "Complexity",
        color: "#10b981",
        position: [-1.179, -0.833, -2.041],
    },
];

// ─── Core Math ────────────────────────────────────────────────────────────────

/**
 * Sigmoidal interaction function as defined in the paper:
 * f(Qi, Qj) = 1 / (1 + exp(-k * (Qi * Qj - alpha)))
 */
export function sigmoidInteraction(qi: number, qj: number, k: number, alpha: number): number {
    return 1 / (1 + Math.exp(-k * (qi * qj - alpha)));
}

/**
 * Compute derivatives dQ_i/dt for all 4 criteria.
 * dQ_i/dt = -λ·Q_i + Σ_j W_ij · f(Q_i, Q_j)
 */
function derivatives(Q: QValues, W: WMatrix, p: SimParams): QValues {
    return Q.map((qi, i) => {
        const decay = -p.lambda * qi;
        const reinforcement = W[i].reduce((sum, wij, j) => {
            return sum + wij * sigmoidInteraction(qi, Q[j], p.k, p.alpha);
        }, 0);
        return decay + reinforcement;
    }) as QValues;
}

/**
 * Runge-Kutta 4th-order integrator step.
 * Advances Q by dt, clamping each value to [0, 1].
 */
export function rk4Step(Q: QValues, W: WMatrix, p: SimParams, dt: number): QValues {
    const k1 = derivatives(Q, W, p);
    const Q2 = Q.map((q, i) => q + 0.5 * dt * k1[i]) as QValues;
    const k2 = derivatives(Q2, W, p);
    const Q3 = Q.map((q, i) => q + 0.5 * dt * k2[i]) as QValues;
    const k3 = derivatives(Q3, W, p);
    const Q4 = Q.map((q, i) => q + dt * k3[i]) as QValues;
    const k4 = derivatives(Q4, W, p);

    return Q.map((q, i) => {
        const newQ = q + (dt / 6) * (k1[i] + 2 * k2[i] + 2 * k3[i] + k4[i]);
        return Math.max(0, Math.min(1, newQ));
    }) as QValues;
}

/**
 * Consciousness score: C = Σ_i Σ_j W_ij · f(Q_i, Q_j)
 * Normalized to [0, 1] by dividing by theoretical maximum (N*(N-1) = 12 for N=4).
 */
export function computeC(Q: QValues, W: WMatrix, p: SimParams): number {
    let raw = 0;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            raw += W[i][j] * sigmoidInteraction(Q[i], Q[j], p.k, p.alpha);
        }
    }
    // Normalize: max raw score ≈ 12 (12 off-diagonal terms × 1.0 max weight × 1.0 max f)
    return Math.min(1, raw / 12);
}

/** Default simulation parameters */
export const DEFAULT_PARAMS: SimParams = {
    lambda: 1.4,   // Decay rate — calibrated so weak archetypes settle low, strong ones high
    k: 5.0,
    alpha: 0.15,
    speed: 1.0,
};

