"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";
import { MinimizablePanel } from "./ui/MinimizablePanel";
import { CRITERIA } from "@/lib/simulation";
import { CASE_STUDIES } from "@/lib/presets";

export function InfoPanel() {
    const [isMinimized, setIsMinimized] = useState(true);

    return (
        <MinimizablePanel
            title="Framework"
            icon={BookOpen}
            isMinimized={isMinimized}
            onToggleMinimize={() => setIsMinimized(v => !v)}
            position="top-left"
            fullHeight
            width="w-80"
        >
            <div className="p-4 space-y-4 text-sm">
                {/* Overview */}
                <div>
                    <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-2">
                        Modelling Consciousness
                    </h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                        A substrate-agnostic framework quantifying consciousness as an emergent property
                        of four interacting <em className="text-slate-300">sentio criteria</em>. Systems
                        are measured not by individual traits but by how those traits reinforce one another.
                    </p>
                </div>

                {/* Sentio Criteria */}
                <div>
                    <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-2.5">
                        The Four Sentio Criteria
                    </h3>
                    <div className="space-y-2.5">
                        {CRITERIA.map(c => (
                            <div key={c.symbol} className="flex gap-2.5">
                                <span className="text-lg font-bold mt-0.5 shrink-0" style={{ color: c.color }}>
                                    {c.symbol}
                                </span>
                                <div>
                                    <div className="text-xs font-semibold text-slate-200">{c.name}</div>
                                    <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                                        {c.symbol === "Φ" && "Degree to which system components integrate into a unified whole — measurable via IIT's Phi metric."}
                                        {c.symbol === "Ψ" && "Capacity to model and adapt its own internal state — metacognition and recursive self-modeling."}
                                        {c.symbol === "Θ" && "Persistence of cohesive state across time, connecting past, present, and anticipated future."}
                                        {c.symbol === "Ω" && "Range of behaviors from reflexive to deliberative, underpinned by intricate internal representations."}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Math */}
                <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/40">
                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-2">Core Equations</div>
                    <div className="space-y-1.5 text-xs font-mono text-slate-300">
                        <div>f(Qᵢ,Qⱼ) = 1 / (1 + e^{`{`}−k(QᵢQⱼ−α){`}`})</div>
                        <div className="text-slate-500">Sigmoidal interaction — enforces threshold</div>
                        <div className="mt-2">dQᵢ/dt = −λQᵢ + Σⱼ Wᵢⱼ·f(Qᵢ,Qⱼ)</div>
                        <div className="text-slate-500">Coupled ODE — decay vs reinforcement</div>
                        <div className="mt-2">C = ΣΣ Wᵢⱼ·f(Qᵢ,Qⱼ) / 12</div>
                        <div className="text-slate-500">Consciousness score — normalized 0→1</div>
                    </div>
                </div>

                {/* Archetypes overview */}
                <div>
                    <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-2">System Archetypes</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-2.5">
                        15 systems span the consciousness spectrum — from a thermostat (C ≈ 0) to the human brain (C ≈ 1).
                        Select any archetype in the Controls panel to load its scientifically grounded coupling matrix and initial sentio values.
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                        {CASE_STUDIES.map(s => (
                            <div key={s.id} className="flex items-center gap-1.5">
                                <s.Icon size={13} className="text-slate-400 shrink-0" />
                                <span className="text-[11px] text-slate-400">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reading / article link */}
                <div className="border-t border-slate-800 pt-3 space-y-1">
                    <div className="text-xs text-slate-500 leading-relaxed">
                        Based on <em className="text-slate-400">"Modelling Consciousness"</em> — a formal,
                        substrate-agnostic framework for quantifying consciousness across biological,
                        artificial, and hybrid entities.
                    </div>
                    <a
                        href="https://randoblog.me/blog/xaxis-modelling-consciousness/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-slate-600 hover:text-blue-400 transition-colors"
                    >
                        <span>↗</span>
                        <span>Read the original article</span>
                    </a>
                    <div className="text-[11px] text-slate-600 pt-1">
                        Simulation by <span className="text-slate-500">Wil Neeley</span>
                    </div>
                </div>
            </div>
        </MinimizablePanel>
    );
}

