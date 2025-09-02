import React from "react"
import { cn } from "@/utils/cn"

const Button = React.forwardRef(({ 
  className, 
  variant = "default", 
  size = "default",
  children, 
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
  
  const variants = {
    default: "bg-accent text-surface hover:bg-primary shadow-sm hover:shadow-md transform hover:scale-[0.98] active:scale-[0.96]",
    outline: "border border-primary bg-transparent text-primary hover:bg-primary hover:text-surface",
    ghost: "text-primary hover:bg-gray-100 hover:text-accent",
    secondary: "bg-secondary text-surface hover:bg-primary"
  }
  
  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-8 px-3 py-1.5 text-xs",
    lg: "h-12 px-6 py-3 text-base",
    icon: "h-10 w-10"
  }

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  )
})

Button.displayName = "Button"

export default Button