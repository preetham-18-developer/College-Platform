import React from "react"
import { cn } from "../../lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
  const baseClass = "btn transition-all d-inline-flex align-items-center justify-content-center fw-medium rounded-pill";
  const variantClasses = {
    default: "btn-premium",
    destructive: "btn-danger",
    outline: "btn-premium-outline",
    secondary: "btn-secondary",
    ghost: "btn-light bg-transparent hover-bg-light",
    link: "btn-link text-primary"
  };
  const sizeClasses = {
    default: "px-4 py-2",
    sm: "btn-sm px-3",
    lg: "btn-lg px-5 py-3",
    icon: "p-2"
  };
  
  return (
    <button
      className={cn(baseClass, variantClasses[variant], sizeClasses[size], className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
