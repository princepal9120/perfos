import React from "react";

// PerfOS Minimalist Compass-Infinity Brand Mark
export function PerfOSLogo({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 50 50 C 38 34, 18 34, 18 50 C 18 66, 38 66, 50 50 Z"
        stroke="#d86f82"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 50 50 C 62 66, 82 66, 82 50 C 82 34, 62 34, 50 50 Z"
        stroke="#ffffff"
        strokeWidth="6.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="50,50 66,12 55,42" fill="#d86f82" />
      <polygon points="50,50 34,88 45,58" fill="#ffffff" />
      <circle cx="50" cy="50" r="5.5" fill="#08080a" stroke="#d86f82" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="2" fill="#ffffff" />
    </svg>
  );
}

// Official Brand Logos
export function MetaLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4.5C7.3 4.5 3.5 8.3 3.5 13c0 2.2.9 4.3 2.4 5.8 1.4-2.1 3.5-3.5 5.9-3.7-.3-.7-.5-1.4-.5-2.2 0-2.6 2.1-4.7 4.7-4.7s4.7 2.1 4.7 4.7c0 .8-.2 1.5-.5 2.2 2.4.2 4.5 1.6 5.9 3.7 1.5-1.5 2.4-3.6 2.4-5.8 0-4.7-3.8-8.5-8.5-8.5zm4 10.3c-1.3 0-2.3-1-2.3-2.3 0-1.3 1-2.3 2.3-2.3s2.3 1 2.3 2.3c0 1.3-1 2.3-2.3 2.3z" />
    </svg>
  );
}

export function GoogleLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
  );
}

export function TikTokLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.89 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.34 0 .66.06.96.17V9.45a6.37 6.37 0 0 0-.96-.07 6.35 6.35 0 0 0-6.34 6.34 6.35 6.35 0 0 0 6.34 6.34 6.35 6.35 0 0 0 6.34-6.34V9.89a8.16 8.16 0 0 0 4.76 1.52V7.96a4.83 4.83 0 0 1-1-.27z" />
    </svg>
  );
}

export function LinkedInLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export function ClaudeLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6L12 2zm6 12l.8 3.2L22 18l-3.2.8L18 22l-.8-3.2L14 18l3.2-.8L18 14zm-12 0l.8 3.2L10 18l-3.2.8L6 22l-.8-3.2L2 18l3.2-.8L6 14z" />
    </svg>
  );
}

export function CursorLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.12 6.4-9-5.18a2 2 0 0 0-2 0l-9 5.18a2 2 0 0 0-1 1.73v10.36a2 2 0 0 0 1 1.73l9 5.18a2 2 0 0 0 2 0l9-5.18a2 2 0 0 0 1-1.73V8.13a2 2 0 0 0-1-1.73z" />
      <path d="M12 22V12" />
      <path d="m3.27 6.96 8.73 5.04 8.73-5.04" />
    </svg>
  );
}

export function ChatGPTLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.28 9.5a5.52 5.52 0 0 0-.48-4.58 5.7 5.7 0 0 0-4.08-2.6 5.63 5.63 0 0 0-5 1.54 5.53 5.53 0 0 0-4.48.56 5.68 5.68 0 0 0-2.82 3.93 5.55 5.55 0 0 0-3.32 3.4 5.67 5.67 0 0 0 .7 4.79 5.52 5.52 0 0 0 .48 4.58 5.7 5.7 0 0 0 4.08 2.6 5.63 5.63 0 0 0 5-1.54 5.53 5.53 0 0 0 4.48-.56 5.68 5.68 0 0 0 2.82-3.93 5.55 5.55 0 0 0 3.32-3.4 5.67 5.67 0 0 0-.7-4.79zm-7.63 11.2a4.2 4.2 0 0 1-2.92-1.18l.14-.08 4.88-2.82a.76.76 0 0 0 .38-.66v-6.9l2.08 1.2a4.2 4.2 0 0 1 2.06 4.3 4.25 4.25 0 0 1-3.08 3.5 4.14 4.14 0 0 1-3.54-2.36z" />
    </svg>
  );
}

export function NotionLogo({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.64c-.466-.373-.746-.466-1.586-.42L3.899 2.06c-.467.047-.56.28-.373.513l.933 1.635zm1.166 4.153v12.457c0 .7.374.933 1.167 1.027l12.842.746c.747.047 1.213-.373 1.213-1.073V8.874c0-.7-.28-1.027-1.027-1.073L6.998 7.334c-.747-.046-1.373.327-1.373 1.027zm10.966 1.866c.093.42 0 .84-.374.886l-.84.14v7.792c0 .653-.28 1.027-1.073 1.027-.56 0-.84-.233-1.307-.793l-4.573-6.533v6.393l1.167.233c.373.093.466.42.373.84-.093.42-.466.467-.933.467H6.559c-.467 0-.747-.14-.653-.56.093-.42.373-.42.747-.467l.84-.14V11.23l-.84-.093c-.374-.047-.56-.373-.467-.793.093-.42.467-.467.933-.467h2.894c.56 0 1.027.28 1.493.933l4.34 6.207V11.09l-1.027-.14c-.373-.047-.466-.373-.373-.793.093-.42.467-.467.933-.467h2.894c.467 0 .747.047.84.467z" />
    </svg>
  );
}

// UI Icons
export function SearchIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function SparklesIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z" />
      <path d="M19 3v4" />
      <path d="M21 5h-4" />
    </svg>
  );
}

export function CloneIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function TerminalIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 17 10 11 4 5" />
      <line x1="12" x2="20" y1="19" y2="19" />
    </svg>
  );
}

export function ChartIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="18" x2="18" y2="20" />
      <line x1="18" y1="10" x2="18" y2="14" />
      <line x1="12" y1="16" x2="12" y2="20" />
      <line x1="12" y1="4" x2="12" y2="12" />
      <line x1="6" y1="14" x2="6" y2="20" />
      <line x1="6" y1="8" x2="6" y2="10" />
    </svg>
  );
}

export function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ZapIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function LayersIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

export function BotIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

export function UserIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function TargetIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function CrossIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
