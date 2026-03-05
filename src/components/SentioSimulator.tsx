"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Scene3D } from "./scene/Scene3D";
import { Controls } from "./Controls";
import { InfoPanel } from "./InfoPanel";
import { SimState, QValues, SimParams, WMatrix, CaseStudy } from "@/lib/types";
import { rk4Step, computeC, DEFAULT_PARAMS, CRITERIA } from "@/lib/simulation";
import { DEFAULT_CASE_STUDY } from "@/lib/presets";

const EQUILIBRIUM_THRESHOLD = 0.0003; // |ΔQ_i/frame| below which we call it converged

export default function SentioSimulator() {
    const [activeStudy, setActiveStudy] = useState<CaseStudy>(DEFAULT_CASE_STUDY);

    // ── Authoritative simulation state (updated every RAF frame) ────────────
    const simRef = useRef<SimState>({
        Q: [...DEFAULT_CASE_STUDY.initialQ] as QValues,
        W: DEFAULT_CASE_STUDY.W,
        params: { ...DEFAULT_PARAMS },
        t: 0,
        isPlaying: true,
    });

    // ── React display state (throttled to ~10 fps for UI) ───────────────────
    const [displayQ, setDisplayQ]         = useState<QValues>([...DEFAULT_CASE_STUDY.initialQ] as QValues);
    const [displayC, setDisplayC]         = useState(0);
    const [displayParams, setDisplayParams] = useState<SimParams>({ ...DEFAULT_PARAMS });
    const [displayW, setDisplayW]         = useState<WMatrix>(DEFAULT_CASE_STUDY.W);
    const [isPlaying, setIsPlaying]       = useState(true);
    const [showLabels, setShowLabels]     = useState(true);
    const [atEquilibrium, setAtEquilibrium] = useState(false);

    const rafRef         = useRef<number>(0);
    const lastUIUpdate   = useRef<number>(0);
    const prevQRef       = useRef<QValues>([...DEFAULT_CASE_STUDY.initialQ] as QValues);
    // True while the user is actively dragging a Q slider.
    // Pauses ODE integration and freezes displayQ so the slider can't fight itself.
    const isDraggingQ    = useRef<boolean>(false);

    // ── Simulation loop ──────────────────────────────────────────────────────
    useEffect(() => {
        let lastTime = performance.now();

        const loop = (now: number) => {
            const wallDelta = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;

            // Only advance ODE when playing AND user is not holding a Q slider.
            if (simRef.current.isPlaying && !isDraggingQ.current) {
                const { params } = simRef.current;
                const dt = Math.min(wallDelta * params.speed, 0.08);
                simRef.current.Q = rk4Step(simRef.current.Q, simRef.current.W, params, dt);
                simRef.current.t += dt;
            }

            // Throttle UI updates to ~10 fps
            if (now - lastUIUpdate.current > 100) {
                const { Q, W, params } = simRef.current;

                // While the user is dragging, don't overwrite their slider position.
                if (!isDraggingQ.current) {
                    const maxDelta = Q.reduce((m, q, i) => Math.max(m, Math.abs(q - prevQRef.current[i])), 0);
                    setAtEquilibrium(maxDelta < EQUILIBRIUM_THRESHOLD && simRef.current.isPlaying);
                    prevQRef.current = [...Q] as QValues;

                    setDisplayQ([...Q] as QValues);
                    setDisplayC(computeC(Q, W, params));
                }
                lastUIUpdate.current = now;
            }

            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handlePlayPause = useCallback(() => {
        simRef.current.isPlaying = !simRef.current.isPlaying;
        setIsPlaying(v => !v);
        setAtEquilibrium(false);
    }, []);

    const handleReset = useCallback(() => {
        const q = [...activeStudy.initialQ] as QValues;
        simRef.current.Q = q;
        simRef.current.t = 0;
        setDisplayQ(q);
        setAtEquilibrium(false);
    }, [activeStudy]);

    const handlePresetChange = useCallback((study: CaseStudy) => {
        setActiveStudy(study);
        const q = [...study.initialQ] as QValues;
        simRef.current.Q = q;
        simRef.current.W = study.W;
        simRef.current.t = 0;
        setDisplayQ(q);
        setDisplayW(study.W);
        setAtEquilibrium(false);
    }, []);

    const handleQDragStart = useCallback(() => {
        isDraggingQ.current = true;
        setAtEquilibrium(false);
    }, []);

    const handleQDragEnd = useCallback(() => {
        isDraggingQ.current = false;
        prevQRef.current = [...simRef.current.Q] as QValues;
    }, []);

    const handleQChange = useCallback((index: number, value: number) => {
        const newQ = [...simRef.current.Q] as QValues;
        newQ[index] = value;
        simRef.current.Q = newQ;
        setDisplayQ([...newQ]);
        setDisplayC(computeC(newQ, simRef.current.W, simRef.current.params));
        setAtEquilibrium(false);
    }, []);

    const handleParamsChange = useCallback((params: SimParams) => {
        simRef.current.params = params;
        setDisplayParams({ ...params });
    }, []);

    const cColor = displayC > 0.65 ? "#3b82f6" : displayC > 0.38 ? "#f59e0b" : "#475569";

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-black">
            {/* ── Full-screen 3D canvas ── */}
            <div className="absolute inset-0">
                <Scene3D simRef={simRef} showLabels={showLabels} nodeDescriptions={activeStudy.nodeDescriptions} />
            </div>

            {/* ── Top HUD ── */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 pointer-events-none z-20">
                {/* Left spacer — mirrors right, keeps center truly centered */}
                <div className="w-36" />

                {/* Centre: app identity + active archetype + C score */}
                <div className="flex flex-col items-center gap-0">
                    {/* App name */}
                    <span className="text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-600">
                        Sentio
                    </span>

                    {/* Active archetype chip */}
                    <div className="flex items-center gap-1.5 mt-1">
                        <activeStudy.Icon size={14} style={{ color: activeStudy.color }} />
                        <span
                            className="text-[11px] font-semibold uppercase tracking-widest transition-colors duration-500"
                            style={{ color: activeStudy.color }}
                        >
                            {activeStudy.label}
                        </span>
                    </div>

                    {/* C score */}
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                        <span
                            className="text-2xl font-bold font-mono tabular-nums transition-colors duration-500"
                            style={{ color: cColor }}
                        >
                            {displayC.toFixed(3)}
                        </span>
                        <span className="text-xs text-slate-600 font-mono">C</span>
                    </div>

                    {/* Equilibrium indicator */}
                    {atEquilibrium && (
                        <span className="text-[9px] uppercase tracking-widest text-emerald-500/70 font-semibold mt-0.5">
                            ✦ equilibrium
                        </span>
                    )}
                </div>

                {/* Right spacer — keeps center balanced */}
                <div className="w-36" />
            </div>

            {/* ── Bottom Q-value bar ── */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-end gap-5 pointer-events-none z-20">
                {CRITERIA.map((c, i) => (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                        <span className="text-[10px] font-mono tabular-nums" style={{ color: c.color }}>
                            {displayQ[i].toFixed(2)}
                        </span>
                        {/* Vertical bar */}
                        <div className="relative w-1 h-10 bg-slate-800/80 rounded-full overflow-hidden">
                            <div
                                className="absolute bottom-0 left-0 right-0 rounded-full transition-all duration-300"
                                style={{ height: `${displayQ[i] * 100}%`, backgroundColor: c.color }}
                            />
                        </div>
                        <span className="text-sm font-bold leading-none" style={{ color: c.color }}>{c.symbol}</span>
                    </div>
                ))}
            </div>

            {/* ── Floating panels ── */}
            <InfoPanel />
            <Controls
                Q={displayQ}
                W={displayW}
                params={displayParams}
                isPlaying={isPlaying}
                displayC={displayC}
                activePresetId={activeStudy.id}
                showLabels={showLabels}
                atEquilibrium={atEquilibrium}
                onQChange={handleQChange}
                onQDragStart={handleQDragStart}
                onQDragEnd={handleQDragEnd}
                onParamsChange={handleParamsChange}
                onPlayPause={handlePlayPause}
                onReset={handleReset}
                onPresetChange={handlePresetChange}
                onToggleLabels={() => setShowLabels(v => !v)}
            />
        </div>
    );
}

