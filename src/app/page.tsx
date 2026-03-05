"use client";

import dynamic from "next/dynamic";

const SentioSimulator = dynamic(() => import("@/components/SentioSimulator"), {
    ssr: false,
});

export default function Home() {
    return <SentioSimulator />;
}

