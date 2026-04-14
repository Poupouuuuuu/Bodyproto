"use client";
import { forwardRef } from "react";
import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const brandButton = cva(
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-widest transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bs-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bs-bg disabled:opacity-60 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: "bg-bs-primary text-bs-bg hover:-translate-y-0.5 hover:shadow-lg",
        secondary: "bg-bs-surface text-bs-primary border border-bs-primary/15 hover:-translate-y-0.5 hover:shadow-md",
        ghost: "text-bs-primary hover:bg-bs-primary/5",
      },
      size: {
        sm: "px-5 py-2.5 text-xs",
        md: "px-6 py-3 text-[13px]",
        lg: "px-10 py-5 text-sm",
        xl: "px-12 py-6 text-base gap-3",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type BrandButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof brandButton> & {
    href?: string;
  };

export const BrandButton = forwardRef<HTMLButtonElement, BrandButtonProps>(
  function BrandButton({ className, variant, size, href, children, ...rest }, ref) {
    if (href) {
      return (
        <Link href={href} className={cn(brandButton({ variant, size }), className)}>
          {children}
        </Link>
      );
    }
    return (
      <button ref={ref} className={cn(brandButton({ variant, size }), className)} {...rest}>
        {children}
      </button>
    );
  },
);
