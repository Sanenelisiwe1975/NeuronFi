import React from "react";
import { cn } from "../../lib/utils";
import { Loader2 } from "lucide-react";



interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hover?: boolean;
  noPad?: boolean;
}

export function Card({ className, glow, hover, noPad, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl",
        !noPad && "p-4",
        glow && "glow-cyan",
        hover && "bg-card-hover cursor-pointer transition-all",
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

// ---- Card Header with optional action ------------------------

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action, icon }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon && <span className="text-[var(--cyan)]">{icon}</span>}
        <div>
          <h3 className="font-display font-bold text-sm text-[var(--text-primary)] uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-muted mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="text-xs">{action}</div>}
    </div>
  );
}

// ---- Badge ---------------------------------------------------

type BadgeVariant = "active" | "warning" | "error" | "neutral" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  active: "badge-active",
  warning: "badge-warning",
  error: "badge-error",
  neutral: "badge-neutral",
  info: "bg-blue-900/20 text-blue-400 border border-blue-800/30",
};

export function Badge({ variant = "neutral", dot, children, className }: BadgeProps) {
  return (
    <span className={cn("status-badge", badgeVariants[variant], className)}>
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full", {
            "bg-green-profit": variant === "active",
            "bg-amber-500": variant === "warning",
            "bg-red-500": variant === "error",
            "bg-[var(--cyan)]": variant === "neutral",
          })}
        />
      )}
      {children}
    </span>
  );
}

// ---- Button --------------------------------------------------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-[var(--cyan)] text-[var(--bg-primary)] font-semibold hover:brightness-110 shadow-cyan-sm",
  secondary: "bg-navy-700 text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-navy-600",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-navy-700/50",
  danger: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20",
  outline: "bg-transparent border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--border-hover)]",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg",
  md: "px-4 py-2 text-sm rounded-xl",
  lg: "px-6 py-3 text-sm rounded-xl",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  icon,
  iconRight,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : icon}
      {children}
      {iconRight && !loading && iconRight}
    </button>
  );
}


export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px bg-[var(--border)]", className)} />;
}


export function Spinner({ size = 16 }: { size?: number }) {
  return <Loader2 size={size} className="animate-spin text-[var(--cyan)]" />;
}



interface StatTileProps {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
  icon?: React.ReactNode;
}

export function StatTile({ label, value, sub, positive, negative, icon }: StatTileProps) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted uppercase tracking-wider font-mono">{label}</span>
      <div className="flex items-baseline gap-1.5">
        {icon && <span>{icon}</span>}
        <span
          className={cn(
            "text-xl font-display font-bold",
            positive && "text-profit",
            negative && "text-loss",
            !positive && !negative && "text-[var(--text-primary)]"
          )}
        >
          {value}
        </span>
      </div>
      {sub && (
        <span className={cn("text-xs font-mono", positive ? "text-profit" : negative ? "text-loss" : "text-secondary")}>
          {sub}
        </span>
      )}
    </div>
  );
}

// ---- Risk bar ------------------------------------------------

interface RiskBarProps {
  value: number; // 0-1
  label?: string;
  showValue?: boolean;
}

export function RiskBar({ value, label, showValue }: RiskBarProps) {
  const pct = Math.min(100, value * 100);
  const color = value < 0.3 ? "bg-green-500" : value < 0.6 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-muted w-8 shrink-0">{label}</span>}
      <div className="flex-1 h-1 bg-navy-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className={cn("text-xs font-mono w-8 text-right", color.replace("bg-", "text-"))}>
          {value.toFixed(2)}
        </span>
      )}
    </div>
  );
}


interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label?: string;
}

export function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  return (
    <label className={cn("flex items-center gap-2 cursor-pointer", disabled && "opacity-50 cursor-not-allowed")}>
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative w-10 h-5 rounded-full transition-colors duration-200",
          checked ? "bg-[var(--cyan)]" : "bg-navy-600 border border-[var(--border)]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
      {label && <span className="text-xs text-secondary">{label}</span>}
    </label>
  );
}



interface SliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  label?: string;
  format?: (v: number) => string;
}

export function Slider({ min, max, step, value, onChange, label, format }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-1.5">
      {(label || format) && (
        <div className="flex justify-between text-xs">
          {label && <span className="text-secondary">{label}</span>}
          {format && <span className="text-[var(--cyan)] font-mono">{format(value)}</span>}
        </div>
      )}
      <div className="relative h-4 flex items-center">
        <div className="w-full h-1 bg-navy-700 rounded-full relative">
          <div
            className="absolute left-0 h-full bg-[var(--cyan)] rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-3 h-3 rounded-full bg-[var(--cyan)] border-2 border-white shadow-cyan-sm pointer-events-none"
          style={{ left: `calc(${pct}% - 6px)` }}
        />
      </div>
    </div>
  );
}


interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export function Input({ label, hint, icon, className, ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs text-secondary">{label}</label>}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">{icon}</span>
        )}
        <input
          className={cn(
            "w-full bg-navy-800 border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]",
            "placeholder:text-muted focus:outline-none focus:border-[var(--cyan)] transition-colors",
            icon && "pl-9",
            className
          )}
          {...rest}
        />
      </div>
      {hint && <span className="text-[10px] text-muted">{hint}</span>}
    </div>
  );
}


export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-muted text-sm">{message}</div>
  );
}
