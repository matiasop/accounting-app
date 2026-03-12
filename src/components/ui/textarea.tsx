import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-2 border-black placeholder:text-muted-foreground focus-visible:border-ring focus-visible:shadow-brutal focus-visible:ring-0 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-sm bg-white px-3 py-2 text-base shadow-brutal-sm transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
