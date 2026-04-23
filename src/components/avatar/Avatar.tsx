"use client";

import React from "react";

export type AvatarSize = 24 | 32 | 40 | 64;
export type AvatarVariant = "image" | "initials" | "placeholder";

export interface AvatarProps {
  size?: AvatarSize;
  src?: string;
  name?: string;          // used to derive initials
  alt?: string;
  variant?: AvatarVariant;
  className?: string;
  onClick?: () => void;
}

const COLOR_MAP: Record<string, string> = {
  A: "#6366f1", B: "#8b5cf6", C: "#ec4899", D: "#14b8a6",
  E: "#f59e0b", F: "#10b981", G: "#3b82f6", H: "#f97316",
  I: "#6366f1", J: "#8b5cf6", K: "#ec4899", L: "#14b8a6",
  M: "#f59e0b", N: "#10b981", O: "#3b82f6", P: "#f97316",
  Q: "#6366f1", R: "#8b5cf6", S: "#ec4899", T: "#14b8a6",
  U: "#f59e0b", V: "#10b981", W: "#3b82f6", X: "#f97316",
  Y: "#6366f1", Z: "#8b5cf6",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getColor(name: string): string {
  const first = name.trim()[0]?.toUpperCase() ?? "A";
  return COLOR_MAP[first] ?? "#6366f1";
}

const FONT_SIZE: Record<AvatarSize, number> = { 24: 9, 32: 12, 40: 14, 64: 22 };

const PlaceholderIcon = ({ size }: { size: number }) => (
  <svg
    width={size * 0.55}
    height={size * 0.55}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default function Avatar({
  size = 40,
  src,
  name,
  alt,
  variant,
  className = "",
  onClick,
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  // Resolve effective variant
  const effectiveVariant: AvatarVariant =
    variant ??
    (src && !imgError ? "image" : name ? "initials" : "placeholder");

  const initials = name ? getInitials(name) : "";
  const bgColor = name ? getColor(name) : "#374151";
  const fontSize = FONT_SIZE[size];

  const baseStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    cursor: onClick ? "pointer" : "default",
    userSelect: "none",
    border: "1.5px solid rgba(255,255,255,0.08)",
    position: "relative",
    transition: "opacity 0.15s",
  };

  if (effectiveVariant === "image" && src) {
    return (
      <span
        style={baseStyle}
        className={className}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <img
          src={src}
          alt={alt ?? name ?? "avatar"}
          onError={() => setImgError(true)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </span>
    );
  }

  if (effectiveVariant === "initials" && initials) {
    return (
      <span
        style={{ ...baseStyle, background: bgColor }}
        className={className}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={name}
      >
        <span style={{ fontSize, fontWeight: 500, color: "#fff", lineHeight: 1 }}>
          {initials}
        </span>
      </span>
    );
  }

  // Placeholder
  return (
    <span
      style={{ ...baseStyle, background: "#1f2937", color: "#6b7280" }}
      className={className}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label="No avatar"
    >
      <PlaceholderIcon size={size} />
    </span>
  );
}