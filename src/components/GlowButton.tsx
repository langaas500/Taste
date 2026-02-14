"use client";

interface GlowButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  fullWidth?: boolean;
}

const variants = {
  primary:
    "bg-[var(--accent)] text-white hover:shadow-[0_0_24px_var(--accent-glow-strong)] hover:brightness-110",
  ghost:
    "bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]",
  danger:
    "bg-[var(--red-glow)] text-[var(--red)] border border-[rgba(248,113,113,0.1)] hover:bg-[rgba(248,113,113,0.2)]",
  success:
    "bg-[var(--green-glow)] text-[var(--green)] border border-[rgba(52,211,153,0.1)] hover:bg-[rgba(52,211,153,0.2)]",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-sm",
};

export default function GlowButton({
  children,
  onClick,
  disabled,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  fullWidth = false,
}: GlowButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-press rounded-[var(--radius-md)] font-medium transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {children}
    </button>
  );
}
