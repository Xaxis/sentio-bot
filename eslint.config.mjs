// ESLint 9 flat config — avoids FlatCompat to sidestep the known
// circular-reference bug in @eslint/eslintrc when eslint-plugin-react@8+
// flat-config objects are serialised.  TypeScript checking is handled by
// `npm run typecheck` (tsc --noEmit).
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default [
    ...tseslint.configs.recommended,
    {
        files: ["src/**/*.{ts,tsx}"],
        plugins: {
            "@next/next": nextPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs["core-web-vitals"].rules,
            // Three.js / R3F contexts use `any` legitimately
            "@typescript-eslint/no-explicit-any": "off",
            // Allow ref callbacks and useFrame patterns
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
        },
        settings: {
            next: { rootDir: "." },
        },
    },
];


