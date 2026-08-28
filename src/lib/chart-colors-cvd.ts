/**
 * CVD-safe color palettes for charts
 * Issue #422: Ensure chart colors are distinguishable for common color-vision deficiency cases
 * 
 * References:
 * - Deuteranopia (red-green, ~1% of males): Difficulty distinguishing red/green
 * - Protanopia (red-green, ~0.5% of males): Similar to deuteranopia
 * - Tritanopia (blue-yellow, ~0.001%): Difficulty distinguishing blue/yellow
 * 
 * Strategy: Use sky/orange/magenta/neutral palette with pattern redundancy where possible
 * All colors tested against WCAG AA contrast requirements (4.5:1 for text, 3:1 for graphics)
 */

export type CvdMode = "protanopia" | "deuteranopia" | "tritanopia";
type ChartPatternKey = "solid" | "dash" | "dot" | "longDash";

export const CVD_PALETTES = {
    // Primary palette: Sky/Orange/Magenta/Neutral.
    // Each color passes WCAG AA graphics contrast on dark chart surfaces and
    // light backgrounds, then gets checked for CVD simulated distance.
    primary: {
        sky: "#0284c7",       // Sky 600
        orange: "#d55e00",    // CVD-safe orange
        magenta: "#cc79a7",   // CVD-safe reddish purple
        neutral: "#64748b",   // Slate 500
    },

    // Accessible palette: High contrast, CVD-safe
    accessible: {
        color1: "#0284c7",    // Sky
        color2: "#d55e00",    // Orange
        color3: "#cc79a7",    // Magenta
        color4: "#64748b",    // Neutral
        color5: "#dc2626",    // Red (status/emphasis only, pair with pattern)
    },

    // Neutral/supporting colors
    neutral: {
        strong: "#64748b",    // Slate-500
        soft: "#94a3b8",      // Slate-400
        lighter: "#cbd5e1",   // Slate-300
    },
} as const;

const CVD_PATTERNS: Record<ChartPatternKey, string> = {
    solid: "0",
    dash: "6 4",
    dot: "1 5",
    longDash: "10 4",
} as const;

export const CHART_TONE_PATTERNS = {
    primary: CVD_PATTERNS.solid,
    accent: CVD_PATTERNS.dash,
    warning: CVD_PATTERNS.dot,
    "neutral-strong": CVD_PATTERNS.longDash,
    "neutral-soft": CVD_PATTERNS.longDash,
} as const;

function hexToRgb(hex: string): [number, number, number] {
    const normalized = hex.replace("#", "");
    if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
        throw new Error(`Invalid hex color: ${hex}`);
    }

    const rgb = parseInt(normalized, 16);
    return [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff];
}

/**
 * Verify color contrast ratio (WCAG)
 * Returns true if contrast >= 4.5:1 (AA standard for text)
 */
function getContrastRatio(color1: string, color2: string): number {
    const getLuminance = (hex: string): number => {
        const [r, g, b] = hexToRgb(hex);
        const [rs, gs, bs] = [r, g, b].map((c) => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color pair meets WCAG AA standard (4.5:1 for text, 3:1 for graphics)
 */
export function meetsWCAGAA(color1: string, color2: string, isText = true): boolean {
    const ratio = getContrastRatio(color1, color2);
    return ratio >= (isText ? 4.5 : 3);
}

const CVD_SIMULATION_MATRICES: Record<CvdMode, [number, number, number][]> = {
    protanopia: [
        [0.152286, 1.052583, -0.204868],
        [0.114503, 0.786281, 0.099216],
        [-0.003882, -0.048116, 1.051998],
    ],
    deuteranopia: [
        [0.367322, 0.860646, -0.227968],
        [0.280085, 0.672501, 0.047413],
        [-0.01182, 0.04294, 0.968881],
    ],
    tritanopia: [
        [1.255528, -0.076749, -0.178779],
        [-0.078411, 0.930809, 0.147602],
        [0.004733, 0.691367, 0.3039],
    ],
};

function clampRgbChannel(value: number): number {
    return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Simulate a color under a common full-severity CVD mode.
 * The output is RGB so tests can compare pairwise visual distance.
 */
function simulateColorVisionDeficiency(
    hex: string,
    mode: CvdMode,
): [number, number, number] {
    const [r, g, b] = hexToRgb(hex).map((channel) => channel / 255);
    const matrix = CVD_SIMULATION_MATRICES[mode];

    return matrix.map(([mr, mg, mb]) =>
        clampRgbChannel((mr * r + mg * g + mb * b) * 255),
    ) as [number, number, number];
}

function getRgbDistance(
    color1: [number, number, number],
    color2: [number, number, number],
): number {
    return Math.hypot(
        color1[0] - color2[0],
        color1[1] - color2[1],
        color1[2] - color2[2],
    );
}

export function getCvdPairDistance(
    color1: string,
    color2: string,
    mode: CvdMode,
): number {
    return getRgbDistance(
        simulateColorVisionDeficiency(color1, mode),
        simulateColorVisionDeficiency(color2, mode),
    );
}
