import { useId } from "react";
import { cn } from "@/lib/utils";

interface AnimatedLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
}

export function AnimatedLogo({ size = "md", showText = true, showTagline = false, className }: AnimatedLogoProps) {
  const uid = useId().replace(/:/g, "");

  const iconSize = {
    sm: "w-9 h-9",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  }[size];

  const textSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-4xl",
  }[size];

  const taglineSize = {
    sm: "text-[10px]",
    md: "text-xs",
    lg: "text-sm",
    xl: "text-base",
  }[size];

  const g1 = `lg1_${uid}`;
  const g2 = `lg2_${uid}`;
  const glow = `lglow_${uid}`;

  return (
    <div className={cn("flex items-center gap-3", className)} data-testid="animated-logo">
      <div className={cn("relative shrink-0", iconSize)}>
        <svg viewBox="0 0 100 100" className="w-full h-full animate-logo-float" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id={g1} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0a2463">
                <animate attributeName="stop-color" values="#0a2463;#1e3a8a;#0a2463" dur="3s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#00b4d8">
                <animate attributeName="stop-color" values="#00b4d8;#48cae4;#00b4d8" dur="3s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            <linearGradient id={g2} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#48cae4">
                <animate attributeName="stop-color" values="#48cae4;#00b4d8;#48cae4" dur="4s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#0077b6">
                <animate attributeName="stop-color" values="#0077b6;#023e8a;#0077b6" dur="4s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            <filter id={glow}>
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <circle cx="18" cy="78" r="9" fill={`url(#${g1})`} className="animate-logo-dot-1" />
          <circle cx="40" cy="55" r="7" fill={`url(#${g2})`} className="animate-logo-dot-2" />
          <circle cx="60" cy="35" r="8" fill={`url(#${g1})`} className="animate-logo-dot-3" />

          <path d="M25 72 L35 59" stroke={`url(#${g2})`} strokeWidth="3.5" strokeLinecap="round" className="animate-logo-path" />
          <path d="M45 50 L55 40" stroke={`url(#${g1})`} strokeWidth="3.5" strokeLinecap="round" className="animate-logo-path" />

          <path d="M65 30 L85 8" stroke={`url(#${g2})`} strokeWidth="5" strokeLinecap="round" filter={`url(#${glow})`} className="animate-logo-arrow" />
          <path d="M77 6 L87 6 L87 16" stroke={`url(#${g2})`} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" filter={`url(#${glow})`} className="animate-logo-arrow" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold tracking-tight leading-tight whitespace-nowrap", textSize)}>
            <span className="text-[#0a2463] dark:text-[#e0e7ff]">My</span>
            <span className="text-[#0a2463] dark:text-[#e0e7ff]">User</span>
            <span className="bg-gradient-to-r from-[#0077b6] to-[#00b4d8] dark:from-[#38bdf8] dark:to-[#67e8f9] bg-clip-text text-transparent animate-logo-shimmer">Journey</span>
          </span>
          {showTagline && (
            <span className={cn("text-muted-foreground tracking-wide", taglineSize)}>
              AI-Powered User Journey Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
}
