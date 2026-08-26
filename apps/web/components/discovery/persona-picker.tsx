"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type Persona = "saas" | "dropship" | "beauty" | "b2b";

interface PersonaOption {
  value: Persona;
  label: string;
  description: string;
}

const PERSONAS: PersonaOption[] = [
  {
    value: "saas",
    label: "SaaS",
    description: "Trial signups from founder-led and feature-led angles.",
  },
  {
    value: "dropship",
    label: "Dropshipping",
    description: "Direct-response product ads built around offer and proof.",
  },
  {
    value: "beauty",
    label: "Beauty",
    description: "UGC-style hooks, before/after framing, routine content.",
  },
  {
    value: "b2b",
    label: "B2B services",
    description: "Outbound-flavored creative that books calls, not clicks.",
  },
];

interface PersonaPickerProps {
  value: Persona | null;
  onChange: (persona: Persona) => void;
  className?: string;
}

/**
 * Selects the ad-account persona used to bias discovery scoring.
 * Radio-group semantics so arrow keys and screen readers work.
 */
export function PersonaPicker({ value, onChange, className }: PersonaPickerProps) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="font-display text-sm font-semibold tracking-tight text-foreground">
        Pick your business type
      </legend>
      <p className="mt-1 text-sm text-muted-foreground">
        Discovery ranks winners against this playbook.
      </p>
      <div
        role="radiogroup"
        aria-label="Business type"
        className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {PERSONAS.map((persona) => {
          const selected = value === persona.value;
          return (
            <label
              key={persona.value}
              className={cn(
                "group relative flex cursor-pointer select-none flex-col rounded-lg border p-4 transition-[background-color,border-color,box-shadow] duration-150 ease-out active:scale-[0.98]",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-accent/50 hover:border-border",
                "focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500/50"
              )}
            >
              <input
                type="radio"
                name="persona"
                value={persona.value}
                checked={selected}
                onChange={() => onChange(persona.value)}
                className="peer absolute h-px w-px opacity-0"
              />
              <span className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-sm font-medium transition-colors duration-150",
                    selected ? "text-foreground" : "text-foreground"
                  )}
                >
                  {persona.label}
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 shrink-0 rounded-full border transition-[border-color,background-color,box-shadow] duration-150 ease-out",
                    selected
                      ? "border-primary bg-primary shadow-[inset_0_0_0_3px_white]"
                      : "border-input group-hover:border-primary/50"
                  )}
                />
              </span>
              <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {persona.description}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
