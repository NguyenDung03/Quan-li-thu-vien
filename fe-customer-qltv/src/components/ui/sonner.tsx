import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-5 text-[#18AD5B]" />
        ),
        info: (
          <InfoIcon className="size-5 text-blue-500" />
        ),
        warning: (
          <TriangleAlertIcon className="size-5 text-amber-500" />
        ),
        error: (
          <OctagonXIcon className="size-5 text-red-500" />
        ),
        loading: (
          <Loader2Icon className="size-5 animate-spin text-[#18AD5B]" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--success-bg": "#18AD5B",
          "--success-border": "#18AD5B",
          "--success-text": "white",
          "--error-bg": "#ef4444",
          "--error-border": "#ef4444",
          "--error-text": "white",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          success: "bg-[#18AD5B] text-white border-[#18AD5B]",
          error: "bg-red-500 text-white border-red-500",
          warning: "bg-amber-500 text-white border-amber-500",
          info: "bg-blue-500 text-white border-blue-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
