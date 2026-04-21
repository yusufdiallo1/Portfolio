import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const accentButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-[color,background-color,box-shadow,border-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black active:scale-[0.97]",
  {
    variants: {
      variant: {
        filled:
          "border border-white bg-white text-black hover:bg-black hover:text-white hover:shadow-[0_0_32px_rgba(255,255,255,0.18)]",
        ghost:
          "border border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-primary)] backdrop-blur-md hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg-hover)]",
        code: "font-label border border-[var(--glass-border)] bg-black py-2.5 pl-4 pr-5 text-left text-[var(--text-primary)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
);

export type AccentButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof accentButtonVariants> & {
    /** Left border color for `code` variant (CSS color / var) */
    codeBorderColor?: string;
  };

export function AccentButton({
  className,
  variant,
  size,
  codeBorderColor = "var(--react)",
  style,
  type = "button",
  ...props
}: AccentButtonProps) {
  const mergedStyle: React.CSSProperties =
    variant === "code"
      ? {
          borderLeftWidth: 4,
          borderLeftColor: codeBorderColor,
          ...style,
        }
      : { ...style };

  return (
    <button
      type={type}
      className={cn(accentButtonVariants({ variant, size }), className)}
      style={mergedStyle}
      {...props}
    />
  );
}
