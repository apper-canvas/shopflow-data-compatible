import React from "react"
import { cn } from "@/utils/cn"

const Badge = React.forwardRef(({ 
  className, 
  variant = "default", 
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
  
  const variants = {
    default: "bg-error text-surface",
    secondary: "bg-gray-100 text-secondary",
    outline: "border border-primary text-primary bg-transparent"
  }

  return (
    <div
      className={cn(baseStyles, variants[variant], className)}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
})

Badge.displayName = "Badge"

export default Badge