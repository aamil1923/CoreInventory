import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva(
  "inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium font-mono tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default:     "border-border bg-secondary text-secondary-foreground",
        secondary:   "border-border bg-muted text-muted-foreground",
        destructive: "border-destructive/30 bg-destructive/10 text-destructive",
        outline:     "border-border text-foreground",
        success:     "border-success/30 bg-success/10 text-success",
        warning:     "border-warning/30 bg-warning/10 text-warning",
        info:        "border-info/30 bg-info/10 text-info",
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
