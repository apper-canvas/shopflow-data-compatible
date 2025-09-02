import React from "react"
import ProductCard from "@/components/molecules/ProductCard"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"

const ProductGrid = ({ 
  products = [], 
  loading = false, 
  error = null, 
  onAddToCart, 
  onRetry,
  emptyMessage = "No products found",
  emptyDescription = "Try adjusting your search or browse our categories."
}) => {
  if (loading) {
    return <Loading type="grid" />
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={onRetry}
      />
    )
  }

  if (products.length === 0) {
    return (
      <Empty 
        title={emptyMessage}
        description={emptyDescription}
        icon="Package"
      />
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
{products.map((product) => (
        <ProductCard
          key={product.Id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  )
}

export default ProductGrid