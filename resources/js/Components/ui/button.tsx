import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-violet-600 text-white shadow hover:bg-violet-700 hover:shadow-lg hover:shadow-violet-500/30",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600",
        outline: "border-2 border-violet-300 bg-transparent text-violet-700 hover:bg-violet-50",
        secondary: "bg-amber-400 text-white shadow-sm hover:bg-amber-500",
        ghost: "hover:bg-violet-50 hover:text-violet-700",
        link: "text-violet-600 underline-offset-4 hover:underline",
        success: "bg-emerald-500 text-white shadow hover:bg-emerald-600",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
