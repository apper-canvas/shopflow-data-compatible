import React from "react"
import { useParams } from "react-router-dom"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"

const CategoryPage = () => {
  const { category } = useParams()

  const categoryName = category 
    ? category.split("-").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" ")
    : "Category"

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-surface rounded-lg shadow-card p-8 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <ApperIcon name="Grid3X3" size={32} className="text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-primary mb-4">
          {categoryName} Category
        </h1>
        <p className="text-secondary mb-8">
          This page will display all products in the {categoryName.toLowerCase()} category 
          with filtering and sorting options.
        </p>
        <Button onClick={() => window.history.back()}>
          <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  )
}

export default CategoryPage