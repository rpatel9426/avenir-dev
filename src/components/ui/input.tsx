import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        /* Fields are 50px pills: muted at rest, raised with an accent hairline
           when focused — selection is one of the two jobs green is allowed. */
        "flex h-[50px] w-full rounded-full border border-transparent bg-muted px-[18px] py-2 text-[13.5px] text-foreground transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:bg-card focus-visible:border-[1.5px] focus-visible:border-accent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        className
      )}
      {...props}
    />
  );
}

export { Input };
