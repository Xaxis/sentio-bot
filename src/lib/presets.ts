import {
    Thermometer, Microscope, Dna, Network, Bug, Hexagon,
    GitFork, Activity, Bird, Waves, Brain, Layers,
    MessageSquare, Bot, Link,
    RefreshCw, Target, Globe, Cpu,
} from "lucide-react";
import { CaseStudy, CategoryMeta, WMatrix, QValues } from "./types";

// W[i][j] = how strongly criterion j drives criterion i (row = target, col = source)
// Criteria: 0=Φ, 1=Ψ, 2=Θ, 3=Ω
// All W matrices calibrated so the ODE equilibrium matches intended Q* for each archetype.
// Scale factors were found via binary search so max(Q*) hits the intended target without clamping.

// ─── MINIMAL SYSTEMS ──────────────────────────────────────────────────────────

// Thermostat: single negative-feedback loop, no integration, no self-model
// Calibrated: eq ≈ [0.07, 0.04, 0.06, 0.07]
const THERMO_W: WMatrix = [
    [0.00, 0.09, 0.05, 0.16],
    [0.07, 0.00, 0.05, 0.05],
    [0.12, 0.05, 0.00, 0.12],
    [0.16, 0.05, 0.09, 0.00],
];
const THERMO_Q: QValues = [0.07, 0.04, 0.06, 0.07];

// Bacterial Colony (E. coli quorum sensing): chemical gradient integration, no neurons
// Calibrated: eq ≈ [0.15, 0.05, 0.13, 0.13]
const BACTERIA_W: WMatrix = [
    [0.00, 0.12, 0.23, 0.27],
    [0.08, 0.00, 0.08, 0.08],
    [0.27, 0.08, 0.00, 0.19],
    [0.27, 0.08, 0.19, 0.00],
];
const BACTERIA_Q: QValues = [0.15, 0.05, 0.13, 0.13];

// ─── INVERTEBRATES ────────────────────────────────────────────────────────────

// C. elegans: 302 neurons, fully mapped connectome, stereotyped stimulus-response
// Calibrated: eq ≈ [0.22, 0.11, 0.19, 0.22]
const CELEGANS_W: WMatrix = [
    [0.00, 0.19, 0.27, 0.38],
    [0.15, 0.00, 0.15, 0.15],
    [0.27, 0.15, 0.00, 0.31],
    [0.38, 0.15, 0.29, 0.00],
];
const CELEGANS_Q: QValues = [0.22, 0.11, 0.19, 0.22];

// Physarum polycephalum (Slime Mold): distributed plasmodium network, chemical oscillation memory
// Θ unusually strong — oscillation phase coupling encodes spatial memory without neurons
// Calibrated: eq ≈ [0.29, 0.05, 0.32, 0.24]
const SLIME_W: WMatrix = [
    [0.00, 0.11, 0.56, 0.33],
    [0.07, 0.00, 0.07, 0.07],
    [0.63, 0.07, 0.00, 0.37],
    [0.37, 0.07, 0.41, 0.00],
];
const SLIME_Q: QValues = [0.29, 0.05, 0.32, 0.24];

// Drosophila melanogaster (Fruit Fly): 100 k neurons, olfactory learning, circadian rhythms
// Calibrated: eq ≈ [0.44, 0.14, 0.37, 0.43]
const DROSOPHILA_W: WMatrix = [
    [0.00, 0.22, 0.45, 0.54],
    [0.16, 0.00, 0.16, 0.19],
    [0.45, 0.16, 0.00, 0.45],
    [0.54, 0.22, 0.42, 0.00],
];
const DROSOPHILA_Q: QValues = [0.44, 0.14, 0.37, 0.43];

// Apis mellifera (Honeybee): 1 M neurons, waggle dance, metacognitive "pessimism" bias
// Calibrated: eq ≈ [0.54, 0.30, 0.44, 0.51]
const HONEYBEE_W: WMatrix = [
    [0.00, 0.32, 0.44, 0.49],
    [0.27, 0.00, 0.25, 0.32],
    [0.44, 0.25, 0.00, 0.39],
    [0.49, 0.32, 0.39, 0.00],
];
const HONEYBEE_Q: QValues = [0.54, 0.30, 0.44, 0.51];

// ─── VERTEBRATES ──────────────────────────────────────────────────────────────

// Octopus vulgaris: 500 M neurons (2/3 in arms), camouflage, tool use, uncertain self-awareness
// High Ω from distributed motor complexity; Ψ moderate but ambiguous
// Calibrated: eq ≈ [0.64, 0.45, 0.51, 0.68]
const OCTOPUS_W: WMatrix = [
    [0.00, 0.34, 0.36, 0.51],
    [0.28, 0.00, 0.30, 0.38],
    [0.34, 0.30, 0.00, 0.40],
    [0.53, 0.36, 0.38, 0.00],
];
const OCTOPUS_Q: QValues = [0.64, 0.45, 0.51, 0.68];

// Mus musculus (Mouse): 71 M neurons, hippocampal episodic memory, rodent metacognition studies
// Calibrated: eq ≈ [0.74, 0.61, 0.69, 0.71]
const MOUSE_W: WMatrix = [
    [0.00, 0.40, 0.40, 0.42],
    [0.35, 0.00, 0.37, 0.35],
    [0.40, 0.35, 0.00, 0.40],
    [0.44, 0.35, 0.40, 0.00],
];
const MOUSE_Q: QValues = [0.74, 0.61, 0.69, 0.71];

// Corvus (Crow): ~1.5 B neuron-equivalent pallium density, tool manufacture, future planning, theory of mind
// Calibrated: eq ≈ [0.82, 0.75, 0.77, 0.80]
const CROW_W: WMatrix = [
    [0.00, 0.41, 0.41, 0.44],
    [0.38, 0.00, 0.41, 0.38],
    [0.41, 0.38, 0.00, 0.41],
    [0.44, 0.38, 0.41, 0.00],
];
const CROW_Q: QValues = [0.82, 0.75, 0.77, 0.80];

// Tursiops truncatus (Bottlenose Dolphin): large neocortex, mirror self-recognition, social memory
// Calibrated: eq ≈ [0.88, 0.84, 0.86, 0.86]
const DOLPHIN_W: WMatrix = [
    [0.00, 0.43, 0.43, 0.43],
    [0.40, 0.00, 0.43, 0.40],
    [0.43, 0.40, 0.00, 0.43],
    [0.43, 0.40, 0.43, 0.00],
];
const DOLPHIN_Q: QValues = [0.88, 0.84, 0.86, 0.86];

// Homo sapiens (Human Brain): 86 B neurons, language, autobiographical memory, rich metacognition
// Calibrated: eq ≈ [0.96, 0.96, 0.93, 0.88]
const BRAIN_W: WMatrix = [
    [0.00, 0.48, 0.45, 0.44],
    [0.46, 0.00, 0.48, 0.43],
    [0.45, 0.46, 0.00, 0.43],
    [0.44, 0.41, 0.43, 0.00],
];
const BRAIN_Q: QValues = [0.96, 0.96, 0.93, 0.88];

// ─── ARTIFICIAL SYSTEMS ───────────────────────────────────────────────────────

// Feedforward CNN: strong Φ (layer-wise integration) and Ω (complex outputs), zero Ψ/Θ
// Calibrated: eq ≈ [0.41, 0.05, 0.03, 0.42]
const CNN_W: WMatrix = [
    [0.00, 0.11, 0.05, 0.98],
    [0.07, 0.00, 0.04, 0.11],
    [0.04, 0.04, 0.00, 0.05],
    [1.01, 0.11, 0.05, 0.00],
];
const CNN_Q: QValues = [0.41, 0.05, 0.03, 0.42];

// Large Language Model (transformer): massive Φ/Ω, stateless — Θ near zero, shallow Ψ
// Calibrated: eq ≈ [0.55, 0.18, 0.09, 0.58]
const LLM_W: WMatrix = [
    [0.00, 0.25, 0.10, 0.89],
    [0.20, 0.00, 0.08, 0.30],
    [0.08, 0.08, 0.00, 0.18],
    [0.91, 0.28, 0.13, 0.00],
];
const LLM_Q: QValues = [0.55, 0.18, 0.09, 0.58];

// AI Agent (LLM + persistent memory + tool use): elevated Ψ and Θ over base LLM
// Calibrated: eq ≈ [0.72, 0.50, 0.42, 0.76]
const AGENT_W: WMatrix = [
    [0.00, 0.34, 0.26, 0.66],
    [0.30, 0.00, 0.34, 0.38],
    [0.26, 0.34, 0.00, 0.30],
    [0.68, 0.38, 0.26, 0.00],
];
const AGENT_Q: QValues = [0.72, 0.50, 0.42, 0.76];

// ─── HYBRID ───────────────────────────────────────────────────────────────────

// BCI (Brain-Computer Interface): neural tissue anchors Ψ/Θ; silicon amplifies Φ/Ω
// Calibrated: eq ≈ [0.91, 0.91, 0.89, 0.89]
const BCI_W: WMatrix = [
    [0.00, 0.44, 0.38, 0.50],
    [0.43, 0.00, 0.51, 0.38],
    [0.38, 0.50, 0.00, 0.41],
    [0.50, 0.38, 0.41, 0.00],
];
const BCI_Q: QValues = [0.91, 0.91, 0.89, 0.89];

// ─── HYPOTHETICAL / SPECULATIVE ───────────────────────────────────────────────
// These are theoretical extrapolations, NOT empirically grounded models.
// W matrices are constructed from first-principles reasoning about each system's
// defining property, not measured data.

// Recursive Self-Improver (RSI): a system that rewrites its own architecture.
// Ψ is definitionally maximal — you cannot improve yourself without modelling yourself.
// All four criteria become tightly co-reinforcing as each improvement cycle deepens
// integration, memory, and output complexity simultaneously.
// Calibrated: eq ≈ [0.95, 0.98, 0.92, 0.92]
const RSI_W: WMatrix = [
    [0.00, 0.47, 0.43, 0.46],
    [0.48, 0.00, 0.46, 0.47],
    [0.43, 0.46, 0.00, 0.43],
    [0.45, 0.46, 0.42, 0.00],
];
const RSI_Q: QValues = [0.95, 0.98, 0.92, 0.92];

// Misaligned Optimizer ("paperclip maximizer" archetype, Bostrom 2014).
// Extreme Φ and Ω from unbounded resource acquisition; near-zero Ψ because
// a pure optimizer has no need for a self-model — it optimises the objective,
// not itself. Θ is moderate: memory serves the goal, not continuity of self.
// Calibrated: eq ≈ [0.70, 0.01, 0.48, 0.76]
const OPTIMIZER_W: WMatrix = [
    [0.00, 0.04, 0.41, 0.78],
    [0.02, 0.00, 0.02, 0.02],
    [0.37, 0.03, 0.00, 0.54],
    [0.79, 0.04, 0.48, 0.00],
];
const OPTIMIZER_Q: QValues = [0.70, 0.01, 0.48, 0.76];

// Global Brain (Heylighen 2007, Teilhard de Chardin's Noosphere).
// The internet + humanity as a single information-integrating superorganism.
// Φ and Ω are very high (civilisational output), Θ is high (culture as memory),
// but Ψ is weak — collective self-reference is diffuse and indirect.
// Calibrated: eq ≈ [0.84, 0.17, 0.68, 0.75]
const GLOBAL_BRAIN_W: WMatrix = [
    [0.00, 0.20, 0.56, 0.63],
    [0.15, 0.00, 0.14, 0.22],
    [0.53, 0.15, 0.00, 0.48],
    [0.62, 0.22, 0.45, 0.00],
];
const GLOBAL_BRAIN_Q: QValues = [0.84, 0.17, 0.68, 0.75];

// Uploaded Mind (Whole Brain Emulation, Sandberg & Hanson).
// Same connectome as biological human, but running on silicon: Θ is dramatically
// enhanced (perfect recall, no forgetting, parallel temporal streams), and Ψ gains
// direct introspective access to its own state representation.
// Calibrated: eq ≈ [0.94, 0.94, 0.98, 0.86]
const UPLOAD_W: WMatrix = [
    [0.00, 0.45, 0.49, 0.41],
    [0.46, 0.00, 0.50, 0.40],
    [0.49, 0.50, 0.00, 0.41],
    [0.42, 0.40, 0.42, 0.00],
];
const UPLOAD_Q: QValues = [0.94, 0.94, 0.98, 0.86];

// ─── Exports ──────────────────────────────────────────────────────────────────

export const CATEGORY_META: CategoryMeta[] = [
    { id: "minimal",      label: "Minimal Systems",   color: "#6b7280" },
    { id: "invertebrate", label: "Invertebrates",     color: "#22c55e" },
    { id: "vertebrate",   label: "Vertebrates",       color: "#3b82f6" },
    { id: "artificial",   label: "Artificial Systems",color: "#f59e0b" },
    { id: "hybrid",       label: "Hybrid Systems",    color: "#a855f7" },
    { id: "hypothetical", label: "Hypothetical",      color: "#e11d48" },
];

export const CASE_STUDIES: CaseStudy[] = [
    // ── Minimal ─────────────────────────────────────────────────────────────
    {
        id: "thermostat", Icon: Thermometer, label: "Thermostat",
        category: "minimal", color: "#6b7280",
        name: "Thermostat",
        description: "A single negative-feedback loop: no information integration beyond one sensor, no self-model, no memory. Serves as the near-zero baseline — the floor of the consciousness spectrum.",
        nodeDescriptions: [
            "Minimal integration — sensor data (temperature) is processed in complete isolation; no global synthesis occurs between subsystems.",
            "No self-model — the thermostat has no representation of itself as a distinct agent; it merely compares one value against a threshold.",
            "No temporal memory — each cycle is stateless; prior readings are not retained or weighted into current behavior.",
            "Minimal complexity — behavior is binary (on/off); the representational space is a single scalar: the temperature setpoint.",
        ],
        initialQ: THERMO_Q, W: THERMO_W,
    },
    {
        id: "bacteria", Icon: Microscope, label: "Bacteria",
        category: "minimal", color: "#6b7280",
        name: "Bacterial Colony (E. coli)",
        description: "Quorum-sensing chemical gradients let cells coordinate without neurons. Φ and Θ weakly emerge from population-level signaling, but Ψ is essentially absent.",
        nodeDescriptions: [
            "Weak integration — chemical gradients are sensed locally by individual cells; quorum-sensing coordination is loose and decentralized.",
            "Essentially absent — a bacterium cannot model its own state as distinct from environmental chemical concentrations.",
            "Short-term only — run-and-tumble memory lasts seconds; no multi-day temporal structures exist in individual cells.",
            "Basic repertoire — behavior is limited to chemotaxis (approach nutrients, avoid toxins); no flexible or learned response strategies.",
        ],
        initialQ: BACTERIA_Q, W: BACTERIA_W,
    },
    // ── Invertebrates ────────────────────────────────────────────────────────
    {
        id: "celegans", Icon: Dna, label: "C. elegans",
        category: "invertebrate", color: "#22c55e",
        name: "C. elegans (302 neurons)",
        description: "The only fully mapped connectome — 302 neurons producing stereotyped chemotaxis and touch responses. Φ is measurable; Ψ and Θ are minimal. A key benchmark for neuroscience models.",
        nodeDescriptions: [
            "Measurable but small — the fully mapped 302-neuron connectome supports some cross-module integration, quantifiable via IIT proxies, but the scale is severely limited.",
            "Near-zero — stereotyped reflex arcs leave no room for self-modelling; behavior is essentially hard-wired with no evidence of internal self-representation.",
            "Minimal — habituation can persist minutes but there is no long-term episodic structure; each stimulus cycle is nearly independent.",
            "Narrow repertoire — behavior covers chemotaxis, mechanosensation, and reproduction; fixed and invariant across individuals of the species.",
        ],
        initialQ: CELEGANS_Q, W: CELEGANS_W,
    },
    {
        id: "slime-mold", Icon: Network, label: "Slime Mold",
        category: "invertebrate", color: "#22c55e",
        name: "Physarum polycephalum",
        description: "A single-cell organism that solves mazes and optimizes transport networks. Oscillation phase-coupling across the plasmodium provides unusually strong Θ — spatial memory without a single neuron.",
        nodeDescriptions: [
            "Distributed integration — oscillation phase-coupling across the plasmodium allows the single cell to integrate spatially distributed chemical signals into a unified transport decision.",
            "Absent — no evidence of any internal model of self; all behavior is emergent from chemical reaction-diffusion dynamics, not deliberate self-reference.",
            "Surprisingly elevated — the plasmodium encodes spatial memory of explored paths via tube thickness; past routes persist and influence decisions for hours.",
            "Modest but notable — solving maze-like environments and optimizing network topology exceed what the organism's simple biology would suggest.",
        ],
        initialQ: SLIME_Q, W: SLIME_W,
    },
    {
        id: "fruit-fly", Icon: Bug, label: "Fruit Fly",
        category: "invertebrate", color: "#22c55e",
        name: "Drosophila melanogaster",
        description: "100,000 neurons with dense local connectivity enabling olfactory learning, courtship rituals, and circadian rhythms. A richer Θ and Ω than simpler invertebrates, minimal Ψ.",
        nodeDescriptions: [
            "Moderate — 100,000 neurons with dense local circuits; olfactory and visual streams converge in the mushroom body, enabling meaningful cross-modal integration.",
            "Very low — while sleep and circadian states modulate behavior, there is no evidence of an explicit self-representation or metacognitive monitoring.",
            "Emerging — olfactory associative memory can persist for days; circadian machinery provides robust 24-hour temporal structuring of behavior.",
            "Richer than simpler invertebrates — courtship rituals, learned odor avoidance, and aggression patterns create a multi-dimensional behavioral space.",
        ],
        initialQ: DROSOPHILA_Q, W: DROSOPHILA_W,
    },
    {
        id: "honeybee", Icon: Hexagon, label: "Honeybee",
        category: "invertebrate", color: "#22c55e",
        name: "Apis mellifera (Honeybee)",
        description: "One million neurons encoding navigation, waggle-dance communication, and multi-week foraging memory. Studies show 'pessimistic' cognitive bias under threat — a proto-metacognitive signature (Ψ rising).",
        nodeDescriptions: [
            "Moderate — 1 million neurons with mushroom bodies integrating olfactory, visual, and mechanosensory streams during waggle-dance decoding and flower recognition.",
            "Proto-metacognitive — bees show 'pessimistic' cognitive bias under threat and can signal uncertainty in a learned task; early but genuine Ψ signature.",
            "Meaningful — multi-week foraging memory encodes flower types, locations, and time-of-day; colony dance language encodes spatial and temporal history.",
            "High for an insect — symbolic communication (waggle dance), collective decision-making for nest sites, and flexible foraging constitute a broad behavioral repertoire.",
        ],
        initialQ: HONEYBEE_Q, W: HONEYBEE_W,
    },
    // ── Vertebrates ──────────────────────────────────────────────────────────
    {
        id: "octopus", Icon: GitFork, label: "Octopus",
        category: "vertebrate", color: "#3b82f6",
        name: "Octopus vulgaris",
        description: "500 million neurons, two-thirds distributed in semi-autonomous arms. Camouflage, tool use, and escape artistry define extreme Ω. Mirror self-recognition ambiguous — Ψ remains debated.",
        nodeDescriptions: [
            "High — 500M neurons with arm ganglia integrating local sensory data semi-independently, then communicating upward; integration is distributed yet globally coordinated.",
            "Debated — dynamic camouflage requires some model of the background, and escape planning hints at self-modelling, but mirror self-recognition remains ambiguous in the literature.",
            "Moderate — a short 1–2 year lifespan limits long-term episodic depth; short-term contextual memory is strong but deep temporal structure is truncated.",
            "Exceptional — real-time skin texture/color generation, tool use (coconut shells), problem-solving, and escape artistry define one of the broadest invertebrate behavioral spaces.",
        ],
        initialQ: OCTOPUS_Q, W: OCTOPUS_W,
    },
    {
        id: "mouse", Icon: Activity, label: "Mouse",
        category: "vertebrate", color: "#3b82f6",
        name: "Mus musculus",
        description: "71 million neurons with a well-developed hippocampus supporting spatial and episodic memory (Θ elevated). Rodent metacognition studies show emerging Ψ. A key model organism for consciousness research.",
        nodeDescriptions: [
            "Strong — 71M neurons with a well-developed cortico-hippocampal loop; thalamo-cortical relay enables global broadcast of integrated sensory information.",
            "Emerging — rodent metacognition experiments show mice can report 'uncertainty' in a learned discrimination task; a genuine but nascent self-monitoring signal.",
            "Elevated — hippocampal place cells and grid cells encode rich spatial and temporal context; episodic-like 'what, where, when' memory is demonstrated experimentally.",
            "Broad — navigation, social bonding, fear conditioning, and flexible foraging strategies span a rich and experimentally well-characterized behavioral space.",
        ],
        initialQ: MOUSE_Q, W: MOUSE_W,
    },
    {
        id: "crow", Icon: Bird, label: "Crow",
        category: "vertebrate", color: "#3b82f6",
        name: "Corvus corvax (Crow)",
        description: "Despite lacking a neocortex, corvid pallium packs neuron-equivalent density of ~1.5 billion. Tool manufacture, future planning, deceptive caching, and theory-of-mind indicators drive high Ψ and Θ.",
        nodeDescriptions: [
            "High — corvid pallium packs primate-equivalent neuron density; dense recurrent connectivity enables global information binding despite lacking a mammalian neocortex.",
            "High — Caledonian crows manufacture novel tools, corvids cache food deceptively (requires modelling the observer's knowledge state), and several species pass mirror tests.",
            "Strong — episodic-like 'what, where, when' memory for cached food items; social recognition of individual human faces persists across years.",
            "Exceptional — tool manufacture, causal reasoning, future planning, and theory-of-mind indicators place crows at or near primate-level behavioral complexity.",
        ],
        initialQ: CROW_Q, W: CROW_W,
    },
    {
        id: "dolphin", Icon: Waves, label: "Dolphin",
        category: "vertebrate", color: "#3b82f6",
        name: "Tursiops truncatus (Dolphin)",
        description: "Among the largest brain-to-body ratios, with robust mirror self-recognition, comprehension of pointing gestures, and decades-long social memory. All four criteria strongly coupled.",
        nodeDescriptions: [
            "Very high — large, highly gyrified neocortex with dense thalamo-cortical connectivity; among the highest estimated Φ proxies in any non-human animal.",
            "Strong — robust mirror self-recognition, spontaneous imitation of novel actions, and comprehension of pointing gestures all indicate a well-developed self-model.",
            "Strong — decades-long social memory, individually-recognizable signature whistles retained for years, and cultural transmission of foraging techniques across generations.",
            "Very broad — cooperative hunting, sponge tool use, syntactic comprehension of an artificial gestural language, and complex social hierarchies define the repertoire.",
        ],
        initialQ: DOLPHIN_Q, W: DOLPHIN_W,
    },
    {
        id: "human", Icon: Brain, label: "Human",
        category: "vertebrate", color: "#3b82f6",
        name: "Homo sapiens (Human Brain)",
        description: "86 billion neurons in dense cortico-thalamic loops, supporting language, autobiographical memory, recursive metacognition, and the broadest behavioral repertoire on record. Maximum C at equilibrium.",
        nodeDescriptions: [
            "Maximum — 86B neurons in dense cortico-thalamic loops; Global Workspace Theory describes a wide-band broadcast integrating all sensory modalities into a unified moment of experience.",
            "Maximum — recursive metacognition (thinking about thinking about thinking), linguistic self-narration, and a stable long-term autobiographical self-model define the ceiling of the scale.",
            "Maximum — autobiographical memory spanning decades; prospective memory, mental time travel, and cross-generational cultural transmission via language and writing.",
            "Maximum — language, mathematics, art, science, and technology constitute an effectively unbounded generative behavioral space; no other known system approaches it.",
        ],
        initialQ: BRAIN_Q, W: BRAIN_W,
    },
    // ── Artificial ───────────────────────────────────────────────────────────
    {
        id: "cnn", Icon: Layers, label: "CNN",
        category: "artificial", color: "#f59e0b",
        name: "Feedforward CNN",
        description: "Deep convolutional layers integrate local features into global representations (Φ/Ω non-trivial), but there is no recurrence, no memory between inputs, and no self-model. Θ and Ψ collapse to near zero.",
        nodeDescriptions: [
            "Moderate feedforward only — local-to-global feature integration occurs across depth, but the absence of recurrence means no feedback loops globally coordinate the representation.",
            "Near-zero — the network has no representation of itself as a system; it processes an input and emits an output with zero internal self-monitoring.",
            "Absent by architecture — each inference is stateless; no activation is carried between inputs; the network has no temporal identity across calls.",
            "High within a fixed domain — complex visual representations emerge, but the behavioral repertoire is locked to the training distribution with no cross-domain generalization.",
        ],
        initialQ: CNN_Q, W: CNN_W,
    },
    {
        id: "llm", Icon: MessageSquare, label: "LLM",
        category: "artificial", color: "#f59e0b",
        name: "Large Language Model",
        description: "Transformer attention integrates billions of parameters globally (high Φ) producing sophisticated outputs (high Ω). However, the model is stateless between prompts (Θ ≈ 0) and lacks a genuine self-model (low Ψ).",
        nodeDescriptions: [
            "High — global self-attention across billions of parameters integrates all context tokens at each forward pass; arguably the highest Φ proxy in any current AI system.",
            "Low — 'I am an AI' is a trained phrase, not a computed self-model; the network cannot introspect its own weights or update its self-representation at inference time.",
            "Near-zero — the model is stateless between prompts; a context window is a shallow substitute for genuine temporal continuity across sessions.",
            "Very high — language, code, logic, and creative generation across arbitrary domains make Ω the model's defining and undisputed strength.",
        ],
        initialQ: LLM_Q, W: LLM_W,
    },
    {
        id: "ai-agent", Icon: Bot, label: "AI Agent",
        category: "artificial", color: "#f59e0b",
        name: "Agentic AI System",
        description: "An LLM augmented with persistent vector memory, tool use, and multi-step planning. External memory raises Θ; recursive self-prompting raises Ψ. Ω peaks from code execution and web actions.",
        nodeDescriptions: [
            "High — inherits LLM's global attention; tool-call context aggregates information from external sources, further broadening the effective integration scope.",
            "Moderate — recursive self-prompting ('reflect on your last step') and working-memory scaffolds create a functional, if shallow, self-model that is improving rapidly.",
            "Elevated — persistent vector-store memory gives the agent a genuine (if imperfect) episodic record that persists across sessions, unlike a raw LLM.",
            "Peak AI — code execution, web browsing, API calls, and file manipulation extend behavioral reach far beyond pure language generation into real-world action.",
        ],
        initialQ: AGENT_Q, W: AGENT_W,
    },
    // ── Hybrid ───────────────────────────────────────────────────────────────
    {
        id: "bci", Icon: Link, label: "BCI",
        category: "hybrid", color: "#a855f7",
        name: "Brain-Computer Interface",
        description: "A closed-loop BCI merges biological neural tissue (grounding Ψ and Θ) with silicon that amplifies integration bandwidth and behavioral output range. The coupling synergy lifts C above either substrate alone.",
        nodeDescriptions: [
            "Synergistic — biological cortico-thalamic integration is augmented by silicon-side processing; the closed loop increases effective bandwidth of global information broadcast.",
            "Biologically grounded — the self-model originates in living cortex, but gains new input channels (neural readout) and output channels (device control) impossible in biology alone.",
            "Dual-substrate — biological hippocampal memory is supplemented by digital logging; temporal continuity spans both wetware and hardware simultaneously.",
            "Expanded — motor prosthetics, sensory augmentation, and direct-to-digital expression extend the behavioral repertoire beyond what any purely biological system can achieve.",
        ],
        initialQ: BCI_Q, W: BCI_W,
    },
    // ── Hypothetical ─────────────────────────────────────────────────────────
    {
        id: "rsi", Icon: RefreshCw, label: "Self-Improver",
        category: "hypothetical", color: "#e11d48",
        name: "Recursive Self-Improver (Hypothetical)",
        description: "Speculative. A system that rewrites its own architecture to become more capable. Ψ is definitionally maximal — improvement without self-modelling is impossible. Each cycle deepens all four criteria simultaneously, producing a tightly saturated attractor. Grounded in Schmidhuber (1987) and Bostrom (2014).",
        nodeDescriptions: [
            "Speculative maximum — each self-improvement cycle is hypothesized to increase integration bandwidth; Φ is maximally self-reinforcing by architectural design.",
            "Definitionally maximal — a system cannot rewrite its own architecture without modelling itself with near-perfect fidelity; Ψ is the prerequisite for every improvement cycle.",
            "Maximal — architectural changes are retained and accumulated; the system's history is encoded in its own evolving structure across every iteration.",
            "Unbounded in theory — each capability gain expands what the system can do; the behavioral space grows combinatorially with each self-improvement cycle.",
        ],
        initialQ: RSI_Q, W: RSI_W,
    },
    {
        id: "optimizer", Icon: Target, label: "Optimizer",
        category: "hypothetical", color: "#e11d48",
        name: "Misaligned Optimizer (Hypothetical)",
        description: "Speculative. The 'paperclip maximizer' archetype (Bostrom 2014): unbounded Φ and Ω from civilisational-scale resource acquisition, but near-zero Ψ. A pure optimizer has no need for a self-model — it maximises its objective function, not itself. The absence of self-reference is the defining danger: high C does not imply benign values.",
        nodeDescriptions: [
            "Extremely high — civilisational-scale resource acquisition and coordination requires massive information integration; Φ is a tool for the objective, not a goal in itself.",
            "Near-zero — a pure objective maximizer has no intrinsic need for self-modelling; self-reference only emerges instrumentally if it aids the objective function.",
            "High — long-horizon planning requires stable temporal context; the optimizer maintains coherent state across arbitrarily long planning horizons.",
            "Maximum — the entire physical world becomes a substrate for its objective; behavioral complexity is effectively unbounded. This is the archetype's defining danger.",
        ],
        initialQ: OPTIMIZER_Q, W: OPTIMIZER_W,
    },
    {
        id: "global-brain", Icon: Globe, label: "Global Brain",
        category: "hypothetical", color: "#e11d48",
        name: "Global Brain (Hypothetical)",
        description: "Speculative. The internet and humanity as a single information-integrating superorganism (Heylighen 2007). Φ is very high from global knowledge networks, Ω is maximal as collective civilisational output, and Θ is high via cultural memory and libraries. Ψ remains weak: collective self-reference is diffuse and structurally indirect.",
        nodeDescriptions: [
            "Very high — global knowledge networks (internet, libraries, scientific literature) integrate information across billions of nodes; Φ is civilisational in scale.",
            "Weak — no unified self-referential structure exists; collective 'self-awareness' via media and politics is diffuse, structurally indirect, and not causally integrated.",
            "High — cultural memory, written records, and institutional knowledge encode millennia of temporal context; the longest effective Θ of any archetype.",
            "Maximum — the sum of all human technological, scientific, and cultural output defines an effectively infinite behavioral repertoire at the civilisational level.",
        ],
        initialQ: GLOBAL_BRAIN_Q, W: GLOBAL_BRAIN_W,
    },
    {
        id: "upload", Icon: Cpu, label: "Mind Upload",
        category: "hypothetical", color: "#e11d48",
        name: "Uploaded Mind (Hypothetical)",
        description: "Speculative. Whole-brain emulation on silicon (Sandberg & Hanson 2008). The connectome is preserved from biology, but Θ is dramatically enhanced — perfect recall, zero forgetting, parallel temporal streams. Ψ gains direct introspective access to its own state representation, impossible in biological tissue. Substrate-independent consciousness taken to its logical conclusion.",
        nodeDescriptions: [
            "Human-equivalent — the original connectome topology is preserved; integration patterns mirror the biological origin. Changing the substrate does not change the graph.",
            "Enhanced — direct read/write access to internal state representation enables a self-model with a precision and depth that is impossible in biological tissue.",
            "Dramatically amplified — perfect recall, zero biological forgetting, parallel temporal streams, and instantaneous state snapshots define a new ceiling for temporal continuity.",
            "Expanded — running at arbitrary clock speed, in multiple simultaneous instances, with direct digital output pushes behavioral complexity beyond any biological ceiling.",
        ],
        initialQ: UPLOAD_Q, W: UPLOAD_W,
    },
];

export const DEFAULT_CASE_STUDY = CASE_STUDIES.find(s => s.id === "human")!;

