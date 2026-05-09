"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          borderRadius: "0px",
        },
        classNames: {
          toast:
            "group toast font-sans !rounded-none group-[.toaster]:bg-white dark:group-[.toaster]:bg-black group-[.toaster]:text-black dark:group-[.toaster]:text-white group-[.toaster]:border-black dark:group-[.toaster]:border-white group-[.toaster]:shadow-none border-[1.5px]",
          description: "group-[.toast]:text-muted-foreground font-medium",
          actionButton:
            "group-[.toast]:bg-black dark:group-[.toast]:bg-white group-[.toast]:text-white dark:group-[.toast]:text-black font-bold !rounded-none",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground font-bold !rounded-none",
          // Theming the status states with colored icons and subtle backgrounds
          error: "group-[.toaster]:border-red-500 group-[.toaster]:bg-red-500/5 [&&_svg]:text-red-500",
          success: "group-[.toaster]:border-emerald-500 group-[.toaster]:bg-emerald-500/5 [&&_svg]:text-emerald-500",
          warning: "group-[.toaster]:border-blue-500 group-[.toaster]:bg-blue-500/5 [&&_svg]:text-blue-500",
          info: "group-[.toaster]:border-blue-500 group-[.toaster]:bg-blue-500/5 [&&_svg]:text-blue-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
