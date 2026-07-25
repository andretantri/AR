import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-violet-100 text-violet-800",
        secondary: "bg-amber-100 text-amber-800",
        destructive: "bg-red-100 text-red-800",
        success: "bg-emerald-100 text-emerald-800",
        cyan: "bg-cyan-100 text-cyan-800",
        outline: "border border-current",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
