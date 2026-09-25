import React from "react";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  /**
   * Keep `label` in the accessibility tree (as the switch's accessible name)
   * without rendering it visibly. Used where a visible title already exists
   * elsewhere in the layout, so the label text isn't shown twice.
   */
  hideLabel?: boolean;
  disabled?: boolean;
  id?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  hideLabel = false,
  disabled = false,
  id,
}: SwitchProps) {
  return (
    <label
      htmlFor={id}
      className={`flex items-center justify-between gap-4 group min-h-[44px] ${
        disabled ? "cursor-not-allowed" : "cursor-pointer"
      }`}
    >
      {label && (
        <span
          className={
            hideLabel
              ? "sr-only"
              : "text-sm font-medium text-slate-300 group-hover:text-white transition-colors"
          }
        >
          {label}
        </span>
      )}
      <div className="relative inline-flex items-center group">
        <input
          id={id}
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`
            w-11 h-6 bg-slate-700 rounded-full peer 
            peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-sky-500
            peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white
            dark:peer-focus-visible:ring-offset-slate-900
            peer-checked:after:translate-x-full peer-checked:after:border-white 
            after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
            after:bg-white after:border-gray-300 after:border after:rounded-full 
            after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500
            ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        ></div>
      </div>
    </label>
  );
}
