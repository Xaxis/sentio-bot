import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Sentio — Modelling Consciousness",
    description:
        "Interactive 3D simulation of the Modelling Consciousness framework. Visualize how information integration, self-referential processing, temporal continuity, and behavioral complexity interact to produce emergent consciousness scores across biological, artificial, and hybrid system archetypes.",
    keywords: ["consciousness", "sentio", "IIT", "integrated information theory", "AI consciousness", "simulation", "3D", "modelling consciousness"],
    authors: [{ name: "Wil Neeley" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
                suppressHydrationWarning
            >
                {children}
                <Script
                    src="https://overlook.technology/s.js"
                    data-site="ws_gf327ftqih"
                    strategy="afterInteractive"
                />
            </body>
        </html>
    );
}

