"use client";

import dynamic from "next/dynamic";

const QualiaSimulator = dynamic(() => import("@/components/QualiaSimulator"), {
    ssr: false,
});

export default function Home() {
    return <QualiaSimulator />;
}

