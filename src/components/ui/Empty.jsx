import React from "react"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const Empty = ({ 
  title = "No items found",
  description = "Try adjusting your search or browse our categories.",
  action,
  actionLabel = "Browse Products",
  icon = "Package"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <ApperIcon name={icon} size={32} className="text-secondary" />
      </div>
      <h3 className="text-lg font-semibold text-primary mb-2">
        {title}
      </h3>
      <p className="text-secondary mb-6 max-w-sm">
        {description}
      </p>
      {action && (
        <Button onClick={action} variant="default">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default Empty