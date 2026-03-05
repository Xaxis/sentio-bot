"use client";

import { ReactNode } from "react";
import { LucideIcon, Minimize2 } from "lucide-react";

export type PanelPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface MinimizablePanelProps {
    title: string;
    icon: LucideIcon;
    isMinimized: boolean;
    onToggleMinimize: () => void;
    children: ReactNode;
    position?: PanelPosition;
    fullHeight?: boolean;
    width?: string;
}

const POSITION_CLASSES: Record<PanelPosition, string> = {
    "top-left": "absolute top-4 left-4",
    "top-right": "absolute top-4 right-4",
    "bottom-left": "absolute bottom-4 left-4",
    "bottom-right": "absolute bottom-4 right-4",
};

export function MinimizablePanel({
    title,
    icon: Icon,
    isMinimized,
    onToggleMinimize,
    children,
    position = "top-right",
    fullHeight = false,
    width = "w-80",
}: MinimizablePanelProps) {
    const posClass = POSITION_CLASSES[position];

    if (isMinimized) {
        return (
            <button
                onClick={onToggleMinimize}
                className={`${posClass} flex items-center gap-2 px-4 py-2.5 bg-slate-900/95 hover:bg-slate-800 text-white rounded-xl shadow-lg transition-colors backdrop-blur-md z-10 border border-slate-700/50`}
            >
                <Icon size={16} className="text-blue-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">{title}</span>
            </button>
        );
    }

    return (
        <div
            className={`${posClass} ${width} bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl z-10 border border-slate-700/50 transition-all duration-300`}
        >
            {/* Header */}
            <button
                onClick={onToggleMinimize}
                className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-slate-800/50 transition-colors rounded-t-xl border-b border-slate-700/50"
            >
                <div className="flex items-center gap-2.5">
                    <Icon size={16} className="text-blue-400" />
                    <span className="text-white text-xs font-semibold uppercase tracking-wider">{title}</span>
                </div>
                <Minimize2 size={14} className="text-slate-500" />
            </button>

            {/* Content */}
            <div className={fullHeight ? "max-h-[calc(100vh-8rem)] overflow-y-auto" : ""}>{children}</div>
        </div>
    );
}

