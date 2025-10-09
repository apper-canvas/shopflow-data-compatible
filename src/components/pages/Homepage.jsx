import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import ProductGrid from "@/components/organisms/ProductGrid";
import { productService } from "@/services/api/productService";

const Homepage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useOutletContext();

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const featuredProducts = await productService.getFeatured(12);
      setProducts(featuredProducts);
    } catch (err) {
      setError("Failed to load featured products. Please try again.");
      console.error("Error loading featured products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary via-accent to-primary text-surface py-16 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Welcome to ShopFlow
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed">
            Discover amazing products with seamless shopping experience
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-white">
            <span className="font-medium">Featured Products Below</span>
            <div className="animate-bounce">↓</div>
          </div>
        </div>
      </section>
      {/* Featured Products */}
      <section className="py-8">
        <div className="px-6 mb-6">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Featured Products
          </h2>
          <p className="text-secondary">Discover our most popular items</p>
        </div>

        <ProductGrid
          products={products}
          loading={loading}
          error={error}
          onAddToCart={addToCart}
          onRetry={loadFeaturedProducts}
          emptyMessage="No featured products available"
          emptyDescription="Check back later for our latest featured items."
        />
      </section>
    </div>
  );
};

export default Homepage;
