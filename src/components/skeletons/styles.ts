import rawStyles from "../ui/Skeleton.module.css";

/**
 * Scoped class names shared with ui/Skeleton.tsx. CSS Modules rename classes at
 * build time, so skeleton components must reference them through this object
 * instead of bare "skeleton" / "card" strings (which match no stylesheet rule).
 * The Proxy fallback mirrors ui/Skeleton.tsx for environments without CSS modules.
 */
const styles: Record<string, string> =
  rawStyles ||
  new Proxy({}, {
    get: (_target, prop) => (typeof prop === "string" ? prop : ""),
  });

export default styles;
