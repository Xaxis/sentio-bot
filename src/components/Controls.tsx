"use client";

import { useState } from "react";
import { SlidersHorizontal, Play, Pause, RotateCcw, Tag } from "lucide-react";
import { MinimizablePanel } from "./ui/MinimizablePanel";
import { CRITERIA } from "@/lib/simulation";
import { CASE_STUDIES, CATEGORY_META } from "@/lib/presets";
import { QValues, SimParams, WMatrix, CaseStudy } from "@/lib/types";

interface ControlsProps {
    Q: QValues;
    W: WMatrix;
    params: SimParams;
    isPlaying: boolean;
    displayC: number;
    activePresetId: string;
    showLabels: boolean;
    atEquilibrium: boolean;
    onQChange: (index: number, value: number) => void;
    onQDragStart: () => void;
    onQDragEnd: () => void;
    onParamsChange: (params: SimParams) => void;
    onPlayPause: () => void;
    onReset: () => void;
    onPresetChange: (study: CaseStudy) => void;
    onToggleLabels: () => void;
}

interface SliderRowProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    color?: string;
    onChange: (v: number) => void;
    onDragStart?: () => void;
    onDragEnd?: () => void;
}

function SliderRow({ label, value, min, max, step, color, onChange, onDragStart, onDragEnd }: SliderRowProps) {
    return (
        <div className="mb-3.5">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-slate-400 uppercase tracking-wide">{label}</span>
                <span className="text-xs font-mono text-slate-200">{value.toFixed(2)}</span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(parseFloat(e.target.value))}
                onPointerDown={onDragStart}
                onPointerUp={onDragEnd}
                onPointerCancel={onDragEnd}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                style={{ accentColor: color ?? "#3b82f6" }}
            />
        </div>
    );
}

export function Controls({
    Q, W, params, isPlaying, displayC, activePresetId,
    showLabels, atEquilibrium,
    onQChange, onQDragStart, onQDragEnd,
    onParamsChange, onPlayPause, onReset, onPresetChange, onToggleLabels,
}: ControlsProps) {
    const [isMinimized, setIsMinimized] = useState(true);

    const cPercent = Math.round(displayC * 100);
    const cColor = displayC > 0.65 ? "#3b82f6" : displayC > 0.38 ? "#f59e0b" : "#6b7280";

    return (
        <MinimizablePanel
            title="Controls"
            icon={SlidersHorizontal}
            isMinimized={isMinimized}
            onToggleMinimize={() => setIsMinimized(v => !v)}
            position="top-right"
            fullHeight
            width="w-80"
        >
            <div className="p-4 space-y-5">
                {/* ── Case Study Selector ── */}
                <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-2.5">System Archetype</div>
                    <div className="space-y-3">
                        {CATEGORY_META.map(cat => {
                            const studies = CASE_STUDIES.filter(s => s.category === cat.id);
                            return (
                                <div key={cat.id}>
                                    <div
                                        className="text-[9px] uppercase tracking-widest font-semibold mb-1.5 flex items-center gap-1"
                                        style={{ color: cat.color }}
                                    >
                                        <span
                                            className="inline-block w-1.5 h-1.5 rounded-full"
                                            style={{ backgroundColor: cat.color }}
                                        />
                                        {cat.label}
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {studies.map(study => {
                                            const active = activePresetId === study.id;
                                            return (
                                                <button
                                                    key={study.id}
                                                    onClick={() => onPresetChange(study)}
                                                    title={study.name}
                                                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all border ${
                                                        active
                                                            ? "text-white border-transparent"
                                                            : "border-slate-700/60 bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                                                    }`}
                                                    style={active ? { backgroundColor: cat.color + "33", borderColor: cat.color + "80", color: cat.color } : {}}
                                                >
                                                    <study.Icon size={12} />
                                                    <span>{study.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── C Score ── */}
                <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/40">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="text-xs uppercase tracking-wider text-slate-500">Consciousness Score</div>
                        {atEquilibrium && (
                            <span className="text-[9px] uppercase tracking-widest text-emerald-500/80 font-semibold">✦ converged</span>
                        )}
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold font-mono" style={{ color: cColor }}>
                            {displayC.toFixed(3)}
                        </span>
                        <span className="text-sm text-slate-500">C</span>
                    </div>
                    <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${cPercent}%`, backgroundColor: cColor }}
                        />
                    </div>
                    <div className="text-xs text-slate-600 mt-1">{cPercent}% of theoretical maximum</div>
                </div>

                {/* ── Playback ── */}
                <div className="flex gap-2">
                    <button
                        onClick={onPlayPause}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors"
                    >
                        {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                        {isPlaying ? "Pause" : "Play"}
                    </button>
                    <button
                        onClick={onReset}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors"
                    >
                        <RotateCcw size={14} /> Reset
                    </button>
                </div>
                {/* Labels toggle */}
                <button
                    onClick={onToggleLabels}
                    className={`w-full flex items-center justify-center gap-2 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors border ${
                        showLabels
                            ? "border-blue-500/40 bg-blue-900/20 text-blue-300"
                            : "border-slate-700/50 bg-slate-800/40 text-slate-500"
                    }`}
                >
                    <Tag size={12} />
                    {showLabels ? "Labels On" : "Labels Off"}
                </button>

                {/* ── Qualia Values ── */}
                <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-2.5">Qualia Values Q_i</div>
                    {CRITERIA.map((c, i) => (
                        <SliderRow
                            key={i}
                            label={`${c.symbol} — ${c.shortName}`}
                            value={Q[i]}
                            min={0} max={1} step={0.01}
                            color={c.color}
                            onChange={v => onQChange(i, v)}
                            onDragStart={onQDragStart}
                            onDragEnd={onQDragEnd}
                        />
                    ))}
                </div>

                {/* ── Simulation Parameters ── */}
                <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-2.5">Dynamics Parameters</div>
                    <SliderRow label="Decay λ" value={params.lambda} min={0.01} max={0.5} step={0.01} onChange={v => onParamsChange({ ...params, lambda: v })} />
                    <SliderRow label="Steepness k" value={params.k} min={1} max={15} step={0.5} onChange={v => onParamsChange({ ...params, k: v })} />
                    <SliderRow label="Threshold α" value={params.alpha} min={0} max={0.8} step={0.01} onChange={v => onParamsChange({ ...params, alpha: v })} />
                    <SliderRow label="Speed" value={params.speed} min={0.1} max={5} step={0.1} onChange={v => onParamsChange({ ...params, speed: v })} />
                </div>

                {/* W matrix summary — read-only mini heatmap */}
                <div>
                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Interaction Matrix W</div>
                    <div className="grid grid-cols-4 gap-0.5">
                        {W.map((row, i) =>
                            row.map((w, j) => (
                                <div
                                    key={`${i}-${j}`}
                                    title={`W[${CRITERIA[i].symbol}→${CRITERIA[j].symbol}] = ${w.toFixed(2)}`}
                                    className="h-5 rounded-sm flex items-center justify-center"
                                    style={{
                                        backgroundColor: i === j ? "#1e293b" : `rgba(59,130,246,${w * 0.9})`,
                                    }}
                                >
                                    <span className="text-[8px] text-white/60 font-mono">
                                        {i === j ? "·" : w.toFixed(1)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="text-xs text-slate-600 mt-1.5">Hover cell for details</div>
                </div>
            </div>
        </MinimizablePanel>
    );
}

