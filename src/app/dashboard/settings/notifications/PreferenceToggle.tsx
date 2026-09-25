"use client";

import React from "react";
import { Switch } from "@/components/ui/Switch";

export function PreferenceToggle({
  id,
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
}) {
  return (
    <div
      className={`flex items-start justify-between gap-4 rounded-xl border border-slate-700/50 bg-slate-950/35 p-4 transition ${
        disabled ? "opacity-65" : "hover:border-slate-600"
      }`}
    >
      {/*
        A plain clickable div, not a second <label htmlFor={id}>: a sibling
        <label> for the same input would work for clicking, but its text
        also gets concatenated into the input's accessible name alongside
        Switch's own label, producing a duplicated/verbose name. Switch's
        hidden label (below) is the single source of the accessible name;
        this div only restores the "click title/description to toggle"
        behavior.
      */}
      <div
        onClick={() => {
          if (!disabled) onChange();
        }}
        className={disabled ? "cursor-not-allowed" : "cursor-pointer"}
      >
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p>
      </div>
      <Switch
        id={id}
        label={title}
        hideLabel
        checked={checked}
        disabled={disabled}
        onChange={() => onChange()}
      />
    </div>
  );
}
