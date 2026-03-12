import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm text-sm font-bold transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none border-2 border-black focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-brutal hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-brutal-sm active:translate-y-[2px] active:translate-x-[2px] active:shadow-none",
        destructive:
          "bg-destructive text-white shadow-brutal hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-brutal-sm active:translate-y-[2px] active:translate-x-[2px] active:shadow-none",
        outline:
          "bg-background shadow-brutal-sm hover:bg-accent hover:text-accent-foreground hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none active:translate-y-[1px] active:translate-x-[1px] active:shadow-none",
        secondary:
          "bg-secondary text-secondary-foreground shadow-brutal-sm hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none",
        ghost:
          "border-transparent hover:bg-accent hover:text-accent-foreground hover:border-black hover:shadow-brutal-sm",
        link: "text-primary underline-offset-4 hover:underline border-transparent",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-sm px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 rounded-sm gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-sm px-6 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
