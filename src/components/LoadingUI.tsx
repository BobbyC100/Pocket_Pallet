import React from "react";
import { motion } from "framer-motion";

const cx = (...c: (string | boolean | undefined)[]) => c.filter(Boolean).join(" ");

// Banyan-aligned class utilities
const classes = {
  surface: "bg-banyan-bg-surface",
  canvas: "bg-banyan-bg-base",
  text: "text-banyan-text-default",
  subtle: "text-banyan-text-subtle",
  border: "border-banyan-border-default",
  focus: "ring-banyan-focus",
  primaryBtn: "btn-banyan-primary",
  ghostBtn: "btn-banyan-ghost",
  card: "rounded-xl border border-banyan-border-default shadow-banyan-mid text-center",
};

interface SpinnerProps {
  size?: number;
}

export function Spinner({ size = 20 }: SpinnerProps) {
  return (
    <motion.span
      aria-hidden="true"
      className="inline-block align-middle rounded-full border-2 border-banyan-text-default border-t-transparent"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
    />
  );
}

interface ProgressBarProps {
  value?: number; // 0-100, or undefined for indeterminate
}

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className={cx("h-2 w-full overflow-hidden rounded-full", classes.canvas)}>
      {typeof value === "number" ? (
        <div
          className="h-full bg-banyan-text-default transition-[width] duration-300"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      ) : (
        <div className="relative h-full">
          <div className="absolute inset-y-0 left-0 w-2/5 bg-banyan-text-default animate-[banyan-bar_1.4s_ease-in-out_infinite]" />
        </div>
      )}
    </div>
  );
}

interface InlineLoaderProps {
  title?: string;
  hint?: string;
}

export function InlineLoader({ title = "Working…", hint }: InlineLoaderProps) {
  return (
    <div 
      className={cx("p-6 space-y-3", classes.card, classes.surface)} 
      role="status" 
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3">
        <Spinner size={24} />
        <div>
          <p className={cx("text-sm font-medium", classes.text)}>{title}</p>
          {hint && <p className={cx("text-xs mt-1", classes.subtle)}>{hint}</p>}
        </div>
      </div>
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={cx("animate-pulse rounded", classes.canvas, className)} />;
}

interface LoadingBannerProps {
  title: string;
  hint?: string;
  value?: number; // 0-100, or undefined for indeterminate
  onDismiss?: () => void;
  onCancel?: () => void;
}

export function LoadingBanner({ title, hint, value, onDismiss, onCancel }: LoadingBannerProps) {
  return (
    <motion.div 
      className={cx("p-6", classes.card, classes.surface)}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <p className={cx("text-sm font-medium", classes.text)}>{title}</p>
          {hint && <p className={cx("text-xs mt-1", classes.subtle)}>{hint}</p>}
        </div>
        <div className="w-full max-w-xs">
          <ProgressBar value={value} />
        </div>
        {(onCancel || onDismiss) && (
          <div className="flex gap-2 mt-2">
            {onCancel && (
              <button className={classes.ghostBtn} onClick={onCancel}>
                Cancel
              </button>
            )}
            {onDismiss && (
              <button className={classes.ghostBtn} onClick={onDismiss}>
                Hide
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Add the animation to globals.css or include it inline
export const LoadingUIStyles = `
  @keyframes banyan-bar {
    0% { transform: translateX(-100%); }
    50% { transform: translateX(150%); }
    100% { transform: translateX(150%); }
  }
`;

