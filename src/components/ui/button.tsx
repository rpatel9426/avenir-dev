import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/*
 * Actions are 56–60px tall, always — sweaty thumbs, cold fingers, gloves.
 * Press is 90ms; nothing here bounces. The primary fill is ink on paper and
 * the accent at night, which is why it reads from `--primary` rather than
 * hard-coding green: green as a large fill in light mode reads sporty.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-bold transition-all duration-[90ms] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:brightness-110 disabled:bg-secondary disabled:text-foreground/30",
        secondary:
          "bg-secondary text-secondary-foreground font-semibold hover:brightness-95 dark:hover:brightness-125 disabled:opacity-50",
        outline:
          "border border-border bg-transparent text-foreground font-semibold hover:bg-secondary disabled:opacity-50",
        ghost:
          "bg-transparent hover:bg-secondary text-foreground font-semibold disabled:opacity-50",
        /* Tertiary / text — the one place the accent carries a label. */
        destructive:
          "bg-transparent text-accent font-semibold hover:underline underline-offset-4 disabled:opacity-50",
        link: "text-accent font-semibold underline-offset-4 hover:underline",
      },
      size: {
        default: "h-14 px-8 text-[15px]",
        sm: "h-11 px-5 text-[13px] font-semibold",
        /* 60px — the mid-run size. */
        lg: "h-15 px-8 text-base",
        icon: "size-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
