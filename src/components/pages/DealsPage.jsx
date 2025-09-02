import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { promotionService } from '@/services/api/promotionService';
import { productService } from '@/services/api/productService';
import ProductCard from '@/components/molecules/ProductCard';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';

const DealsPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [promotionalProducts, setPromotionalProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [featuredPromotion, setFeaturedPromotion] = useState(null);
  
  const { addToCart } = useOutletContext();

  const loadDeals = async () => {
    try {
      setLoading(true);
      setError("");
      
      // Load active promotions
      const activePromotions = await promotionService.getActivePromotions();
      setPromotions(activePromotions);
      
      // Get featured promotion (highest discount)
      if (activePromotions.length > 0) {
        const featured = activePromotions.reduce((max, current) => 
          (current.discount_percentage_c || 0) > (max.discount_percentage_c || 0) ? current : max
        );
        setFeaturedPromotion(featured);
      }
      
      // Load all products to filter promotional ones
      const allProducts = await productService.getFeatured(50); // Get more products
      const productsWithPromotions = [];
      
      for (const product of allProducts) {
        const productPromotions = await promotionService.getProductPromotions(product.Id);
        if (productPromotions.length > 0) {
          const bestPromotion = productPromotions[0]; // Already sorted by discount percentage
          const promotionalPrice = promotionService.calculatePromotionalPrice(
            product.price, 
            bestPromotion.discount_percentage_c
          );
          
          productsWithPromotions.push({
            ...product,
            promotion: bestPromotion,
            promotionalPrice,
            originalPrice: product.price
          });
        }
      }
      
      setPromotionalProducts(productsWithPromotions);
      
    } catch (err) {
      setError("Failed to load deals. Please try again.");
      console.error("Error loading deals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeals();
  }, []);

  if (loading) {
    return <Loading message="Loading amazing deals..." />;
  }

  if (error) {
    return (
      <Error 
        message={error}
        onRetry={loadDeals}
        actionLabel="Retry Loading Deals"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Banner */}
      {featuredPromotion && (
        <section className="bg-gradient-to-r from-error via-warning to-error text-white py-16 px-6 text-center mb-8">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium mb-6">
              <ApperIcon name="Zap" size={16} />
              <span>Limited Time Offer</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {featuredPromotion.name_c}
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed">
              {featuredPromotion.description_c}
            </p>
            <div className="inline-flex items-center gap-4">
              <div className="text-5xl md:text-7xl font-black">
                {Math.round(featuredPromotion.discount_percentage_c)}%
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold">OFF</div>
                <div className="text-lg text-gray-200">Selected Items</div>
              </div>
            </div>
            <div className="mt-8">
              <Button 
                size="lg" 
                className="bg-white text-error hover:bg-gray-100 font-semibold px-8 py-4"
                onClick={() => document.getElementById('deals-grid')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <ApperIcon name="ShoppingBag" size={20} className="mr-2" />
                Shop Deals Now
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Site-wide Promotion Bar */}
      {promotions.length > 0 && (
        <div className="bg-primary text-white text-center py-3 px-6 mb-8">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <ApperIcon name="Tag" size={16} />
            <span>
              {promotions.length === 1 
                ? `${promotions[0].name_c} - ${promotions[0].description_c}`
                : `${promotions.length} Active Promotions Available!`
              }
            </span>
            <ApperIcon name="Sparkles" size={16} />
          </div>
        </div>
      )}

      {/* Deals Grid */}
      <section className="py-8" id="deals-grid">
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-primary mb-2">
                Special Deals & Offers
              </h2>
              <p className="text-secondary text-lg">
                Save big on our most popular products
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {promotionalProducts.length}
              </div>
              <div className="text-sm text-secondary">
                Items on Sale
              </div>
            </div>
          </div>
        </div>

        {promotionalProducts.length === 0 ? (
          <Empty
            icon="Tag"
            title="No Active Deals"
            description="Check back soon for exciting offers and discounts!"
            actionLabel="Browse All Products"
            onAction={() => window.location.href = '/'}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {promotionalProducts.map((product) => (
              <ProductCard
                key={product.Id}
                product={product}
                onAddToCart={addToCart}
                showPromotion={true}
              />
            ))}
          </div>
        )}
      </section>

      {/* Promotion Details */}
      {promotions.length > 0 && (
        <section className="py-8 px-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-primary mb-6 text-center">
              Current Promotions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {promotions.map((promotion) => (
                <div key={promotion.Id} className="bg-surface rounded-lg border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-xl font-semibold text-primary mb-2">
                        {promotion.name_c}
                      </h4>
                      <p className="text-secondary">
                        {promotion.description_c}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-error">
                        {Math.round(promotion.discount_percentage_c)}%
                      </div>
                      <div className="text-sm text-secondary">OFF</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-secondary">
                    <div className="flex items-center gap-1">
                      <ApperIcon name="Calendar" size={14} />
                      <span>
                        Valid until {new Date(promotion.end_date_c).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ApperIcon name="Package" size={14} />
                      <span>
                        {promotion.promotion_type_c === 'percentage' ? 'Percentage' : 'Fixed'} Discount
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DealsPage;