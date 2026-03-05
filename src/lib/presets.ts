import {
    Thermometer, Microscope, Dna, Network, Bug, Hexagon,
    GitFork, Activity, Bird, Waves, Brain, Layers,
    MessageSquare, Bot, Link,
} from "lucide-react";
import { CaseStudy, CategoryMeta, WMatrix, QValues } from "./types";

// W[i][j] = how strongly criterion j drives criterion i (row = target, col = source)
// Criteria: 0=Φ, 1=Ψ, 2=Θ, 3=Ω

// ─── MINIMAL SYSTEMS ──────────────────────────────────────────────────────────

// Thermostat: single negative-feedback loop, no integration, no self-model
const THERMO_W: WMatrix = [
    [0.00, 0.04, 0.02, 0.07],
    [0.03, 0.00, 0.02, 0.02],
    [0.05, 0.02, 0.00, 0.05],
    [0.07, 0.02, 0.04, 0.00],
];
const THERMO_Q: QValues = [0.05, 0.02, 0.08, 0.06];

// Bacterial Colony (E. coli quorum sensing): chemical gradient integration, no neurons
const BACTERIA_W: WMatrix = [
    [0.00, 0.06, 0.12, 0.14],
    [0.04, 0.00, 0.04, 0.04],
    [0.14, 0.04, 0.00, 0.10],
    [0.14, 0.04, 0.10, 0.00],
];
const BACTERIA_Q: QValues = [0.18, 0.03, 0.15, 0.12];

// ─── INVERTEBRATES ────────────────────────────────────────────────────────────

// C. elegans: 302 neurons, fully mapped connectome, stereotyped stimulus-response
const CELEGANS_W: WMatrix = [
    [0.00, 0.10, 0.14, 0.20],
    [0.08, 0.00, 0.08, 0.08],
    [0.14, 0.08, 0.00, 0.16],
    [0.20, 0.08, 0.15, 0.00],
];
const CELEGANS_Q: QValues = [0.22, 0.05, 0.18, 0.20];

// Physarum polycephalum (Slime Mold): distributed plasmodium network, chemical oscillation memory
// Θ unusually strong — oscillation phase coupling encodes spatial memory without neurons
const SLIME_W: WMatrix = [
    [0.00, 0.06, 0.30, 0.18],
    [0.04, 0.00, 0.04, 0.04],
    [0.34, 0.04, 0.00, 0.20],
    [0.20, 0.04, 0.22, 0.00],
];
const SLIME_Q: QValues = [0.35, 0.05, 0.30, 0.18];

// Drosophila melanogaster (Fruit Fly): 100 k neurons, olfactory learning, circadian rhythms
const DROSOPHILA_W: WMatrix = [
    [0.00, 0.14, 0.28, 0.34],
    [0.10, 0.00, 0.10, 0.12],
    [0.28, 0.10, 0.00, 0.28],
    [0.34, 0.14, 0.26, 0.00],
];
const DROSOPHILA_Q: QValues = [0.45, 0.12, 0.38, 0.40];

// Apis mellifera (Honeybee): 1 M neurons, waggle dance, metacognitive "pessimism" bias
const HONEYBEE_W: WMatrix = [
    [0.00, 0.26, 0.36, 0.40],
    [0.22, 0.00, 0.20, 0.26],
    [0.36, 0.20, 0.00, 0.32],
    [0.40, 0.26, 0.32, 0.00],
];
const HONEYBEE_Q: QValues = [0.52, 0.25, 0.45, 0.50];

// ─── VERTEBRATES ──────────────────────────────────────────────────────────────

// Octopus vulgaris: 500 M neurons (2/3 in arms), camouflage, tool use, uncertain self-awareness
// High Ω from distributed motor complexity; Ψ moderate but ambiguous
const OCTOPUS_W: WMatrix = [
    [0.00, 0.36, 0.38, 0.54],
    [0.30, 0.00, 0.32, 0.40],
    [0.36, 0.32, 0.00, 0.42],
    [0.56, 0.38, 0.40, 0.00],
];
const OCTOPUS_Q: QValues = [0.60, 0.42, 0.52, 0.75];

// Mus musculus (Mouse): 71 M neurons, hippocampal episodic memory, rodent metacognition studies
const MOUSE_W: WMatrix = [
    [0.00, 0.46, 0.46, 0.48],
    [0.40, 0.00, 0.42, 0.40],
    [0.46, 0.40, 0.00, 0.46],
    [0.50, 0.40, 0.46, 0.00],
];
const MOUSE_Q: QValues = [0.65, 0.48, 0.62, 0.60];

// Corvus (Crow): ~1.5 B neuron-equivalent pallium density, tool manufacture, future planning, theory of mind
const CROW_W: WMatrix = [
    [0.00, 0.56, 0.56, 0.60],
    [0.52, 0.00, 0.56, 0.52],
    [0.56, 0.52, 0.00, 0.56],
    [0.60, 0.52, 0.56, 0.00],
];
const CROW_Q: QValues = [0.72, 0.65, 0.70, 0.68];

// Tursiops truncatus (Bottlenose Dolphin): large neocortex, mirror self-recognition, social memory
const DOLPHIN_W: WMatrix = [
    [0.00, 0.66, 0.66, 0.66],
    [0.62, 0.00, 0.66, 0.62],
    [0.66, 0.62, 0.00, 0.66],
    [0.66, 0.62, 0.66, 0.00],
];
const DOLPHIN_Q: QValues = [0.80, 0.75, 0.78, 0.78];

// Homo sapiens (Human Brain): 86 B neurons, language, autobiographical memory, rich metacognition
const BRAIN_W: WMatrix = [
    [0.00, 0.85, 0.80, 0.78],
    [0.82, 0.00, 0.85, 0.75],
    [0.80, 0.82, 0.00, 0.75],
    [0.78, 0.72, 0.75, 0.00],
];
const BRAIN_Q: QValues = [0.90, 0.88, 0.84, 0.85];

// ─── ARTIFICIAL SYSTEMS ───────────────────────────────────────────────────────

// Feedforward CNN: strong Φ (layer-wise integration) and Ω (complex outputs), zero Ψ/Θ
const CNN_W: WMatrix = [
    [0.00, 0.06, 0.03, 0.54],
    [0.04, 0.00, 0.02, 0.06],
    [0.02, 0.02, 0.00, 0.03],
    [0.56, 0.06, 0.03, 0.00],
];
const CNN_Q: QValues = [0.42, 0.04, 0.03, 0.45];

// Large Language Model (transformer): massive Φ/Ω, stateless — Θ near zero, shallow Ψ
const LLM_W: WMatrix = [
    [0.00, 0.20, 0.08, 0.70],
    [0.16, 0.00, 0.06, 0.24],
    [0.06, 0.06, 0.00, 0.14],
    [0.72, 0.22, 0.10, 0.00],
];
const LLM_Q: QValues = [0.82, 0.18, 0.08, 0.78];

// AI Agent (LLM + persistent memory + tool use): elevated Ψ and Θ over base LLM
const AGENT_W: WMatrix = [
    [0.00, 0.36, 0.28, 0.70],
    [0.32, 0.00, 0.36, 0.40],
    [0.28, 0.36, 0.00, 0.32],
    [0.72, 0.40, 0.28, 0.00],
];
const AGENT_Q: QValues = [0.82, 0.45, 0.48, 0.85];

// ─── HYBRID ───────────────────────────────────────────────────────────────────

// BCI (Brain-Computer Interface): neural tissue anchors Ψ/Θ; silicon amplifies Φ/Ω
const BCI_W: WMatrix = [
    [0.00, 0.60, 0.52, 0.68],
    [0.58, 0.00, 0.70, 0.52],
    [0.52, 0.68, 0.00, 0.56],
    [0.68, 0.52, 0.56, 0.00],
];
const BCI_Q: QValues = [0.78, 0.72, 0.68, 0.80];

// ─── Exports ──────────────────────────────────────────────────────────────────

export const CATEGORY_META: CategoryMeta[] = [
    { id: "minimal",      label: "Minimal Systems",   color: "#6b7280" },
    { id: "invertebrate", label: "Invertebrates",     color: "#22c55e" },
    { id: "vertebrate",   label: "Vertebrates",       color: "#3b82f6" },
    { id: "artificial",   label: "Artificial Systems",color: "#f59e0b" },
    { id: "hybrid",       label: "Hybrid Systems",    color: "#a855f7" },
];

export const CASE_STUDIES: CaseStudy[] = [
    // ── Minimal ─────────────────────────────────────────────────────────────
    {
        id: "thermostat", Icon: Thermometer, label: "Thermostat",
        category: "minimal", color: "#6b7280",
        name: "Thermostat",
        description: "A single negative-feedback loop: no information integration beyond one sensor, no self-model, no memory. Serves as the near-zero baseline — the floor of the consciousness spectrum.",
        initialQ: THERMO_Q, W: THERMO_W,
    },
    {
        id: "bacteria", Icon: Microscope, label: "Bacteria",
        category: "minimal", color: "#6b7280",
        name: "Bacterial Colony (E. coli)",
        description: "Quorum-sensing chemical gradients let cells coordinate without neurons. Φ and Θ weakly emerge from population-level signaling, but Ψ is essentially absent.",
        initialQ: BACTERIA_Q, W: BACTERIA_W,
    },
    // ── Invertebrates ────────────────────────────────────────────────────────
    {
        id: "celegans", Icon: Dna, label: "C. elegans",
        category: "invertebrate", color: "#22c55e",
        name: "C. elegans (302 neurons)",
        description: "The only fully mapped connectome — 302 neurons producing stereotyped chemotaxis and touch responses. Φ is measurable; Ψ and Θ are minimal. A key benchmark for neuroscience models.",
        initialQ: CELEGANS_Q, W: CELEGANS_W,
    },
    {
        id: "slime-mold", Icon: Network, label: "Slime Mold",
        category: "invertebrate", color: "#22c55e",
        name: "Physarum polycephalum",
        description: "A single-cell organism that solves mazes and optimizes transport networks. Oscillation phase-coupling across the plasmodium provides unusually strong Θ — spatial memory without a single neuron.",
        initialQ: SLIME_Q, W: SLIME_W,
    },
    {
        id: "fruit-fly", Icon: Bug, label: "Fruit Fly",
        category: "invertebrate", color: "#22c55e",
        name: "Drosophila melanogaster",
        description: "100,000 neurons with dense local connectivity enabling olfactory learning, courtship rituals, and circadian rhythms. A richer Θ and Ω than simpler invertebrates, minimal Ψ.",
        initialQ: DROSOPHILA_Q, W: DROSOPHILA_W,
    },
    {
        id: "honeybee", Icon: Hexagon, label: "Honeybee",
        category: "invertebrate", color: "#22c55e",
        name: "Apis mellifera (Honeybee)",
        description: "One million neurons encoding navigation, waggle-dance communication, and multi-week foraging memory. Studies show 'pessimistic' cognitive bias under threat — a proto-metacognitive signature (Ψ rising).",
        initialQ: HONEYBEE_Q, W: HONEYBEE_W,
    },
    // ── Vertebrates ──────────────────────────────────────────────────────────
    {
        id: "octopus", Icon: GitFork, label: "Octopus",
        category: "vertebrate", color: "#3b82f6",
        name: "Octopus vulgaris",
        description: "500 million neurons, two-thirds distributed in semi-autonomous arms. Camouflage, tool use, and escape artistry define extreme Ω. Mirror self-recognition ambiguous — Ψ remains debated.",
        initialQ: OCTOPUS_Q, W: OCTOPUS_W,
    },
    {
        id: "mouse", Icon: Activity, label: "Mouse",
        category: "vertebrate", color: "#3b82f6",
        name: "Mus musculus",
        description: "71 million neurons with a well-developed hippocampus supporting spatial and episodic memory (Θ elevated). Rodent metacognition studies show emerging Ψ. A key model organism for consciousness research.",
        initialQ: MOUSE_Q, W: MOUSE_W,
    },
    {
        id: "crow", Icon: Bird, label: "Crow",
        category: "vertebrate", color: "#3b82f6",
        name: "Corvus corvax (Crow)",
        description: "Despite lacking a neocortex, corvid pallium packs neuron-equivalent density of ~1.5 billion. Tool manufacture, future planning, deceptive caching, and theory-of-mind indicators drive high Ψ and Θ.",
        initialQ: CROW_Q, W: CROW_W,
    },
    {
        id: "dolphin", Icon: Waves, label: "Dolphin",
        category: "vertebrate", color: "#3b82f6",
        name: "Tursiops truncatus (Dolphin)",
        description: "Among the largest brain-to-body ratios, with robust mirror self-recognition, comprehension of pointing gestures, and decades-long social memory. All four criteria strongly coupled.",
        initialQ: DOLPHIN_Q, W: DOLPHIN_W,
    },
    {
        id: "human", Icon: Brain, label: "Human",
        category: "vertebrate", color: "#3b82f6",
        name: "Homo sapiens (Human Brain)",
        description: "86 billion neurons in dense cortico-thalamic loops, supporting language, autobiographical memory, recursive metacognition, and the broadest behavioral repertoire on record. Maximum C at equilibrium.",
        initialQ: BRAIN_Q, W: BRAIN_W,
    },
    // ── Artificial ───────────────────────────────────────────────────────────
    {
        id: "cnn", Icon: Layers, label: "CNN",
        category: "artificial", color: "#f59e0b",
        name: "Feedforward CNN",
        description: "Deep convolutional layers integrate local features into global representations (Φ/Ω non-trivial), but there is no recurrence, no memory between inputs, and no self-model. Θ and Ψ collapse to near zero.",
        initialQ: CNN_Q, W: CNN_W,
    },
    {
        id: "llm", Icon: MessageSquare, label: "LLM",
        category: "artificial", color: "#f59e0b",
        name: "Large Language Model",
        description: "Transformer attention integrates billions of parameters globally (high Φ) producing sophisticated outputs (high Ω). However, the model is stateless between prompts (Θ ≈ 0) and lacks a genuine self-model (low Ψ).",
        initialQ: LLM_Q, W: LLM_W,
    },
    {
        id: "ai-agent", Icon: Bot, label: "AI Agent",
        category: "artificial", color: "#f59e0b",
        name: "Agentic AI System",
        description: "An LLM augmented with persistent vector memory, tool use, and multi-step planning. External memory raises Θ; recursive self-prompting raises Ψ. Ω peaks from code execution and web actions.",
        initialQ: AGENT_Q, W: AGENT_W,
    },
    // ── Hybrid ───────────────────────────────────────────────────────────────
    {
        id: "bci", Icon: Link, label: "BCI",
        category: "hybrid", color: "#a855f7",
        name: "Brain-Computer Interface",
        description: "A closed-loop BCI merges biological neural tissue (grounding Ψ and Θ) with silicon that amplifies integration bandwidth and behavioral output range. The coupling synergy lifts C above either substrate alone.",
        initialQ: BCI_Q, W: BCI_W,
    },
];

export const DEFAULT_CASE_STUDY = CASE_STUDIES.find(s => s.id === "human")!;

