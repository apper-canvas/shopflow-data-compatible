import React, { useState, useEffect } from 'react';
import { promotionService } from '@/services/api/promotionService';
import ApperIcon from '@/components/ApperIcon';
import { cn } from '@/utils/cn';

const PromotionBanner = ({ className }) => {
  const [currentPromotion, setCurrentPromotion] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadActivePromotion = async () => {
    try {
      setLoading(true);
      const activePromotions = await promotionService.getActivePromotions();
      
      if (activePromotions.length > 0) {
        // Get the promotion with the highest discount or most recent
        const featuredPromotion = activePromotions.reduce((featured, current) => {
          const featuredDiscount = featured.discount_percentage_c || 0;
          const currentDiscount = current.discount_percentage_c || 0;
          
          if (currentDiscount > featuredDiscount) return current;
          if (currentDiscount === featuredDiscount) {
            return new Date(current.start_date_c) > new Date(featured.start_date_c) ? current : featured;
          }
          return featured;
        });
        
        setCurrentPromotion(featuredPromotion);
      }
    } catch (error) {
      console.error("Error loading promotion banner:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivePromotion();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Store dismissal in localStorage to remember user preference
    if (currentPromotion) {
      localStorage.setItem(`promotion-banner-dismissed-${currentPromotion.Id}`, 'true');
    }
  };

  const handleClick = () => {
    window.location.href = '/deals';
  };

  // Don't render if loading, no promotion, or user dismissed it
  if (loading || !currentPromotion || !isVisible) {
    return null;
  }

  // Check if user previously dismissed this promotion
  const isDismissed = localStorage.getItem(`promotion-banner-dismissed-${currentPromotion.Id}`) === 'true';
  if (isDismissed) {
    return null;
  }

  return (
    <div className={cn(
      "bg-gradient-to-r from-error to-warning text-white relative overflow-hidden cursor-pointer",
      className
    )}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
      </div>
      
      {/* Content */}
      <div 
        onClick={handleClick}
        className="relative z-10 px-4 py-3 flex items-center justify-center gap-3 hover:bg-black/10 transition-colors"
      >
        <ApperIcon name="Zap" size={16} className="animate-pulse" />
        <span className="font-medium text-sm sm:text-base text-center">
          <span className="hidden sm:inline">{currentPromotion.name_c} - </span>
          <span className="font-bold">{Math.round(currentPromotion.discount_percentage_c)}% OFF</span>
          <span className="hidden md:inline"> - {currentPromotion.description_c}</span>
          <span className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
            Click to Shop
          </span>
        </span>
        <ApperIcon name="ArrowRight" size={14} className="hidden sm:block" />
      </div>

      {/* Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}
        className="absolute top-1 right-1 p-2 hover:bg-black/20 rounded-full transition-colors z-20"
        aria-label="Close promotion banner"
      >
        <ApperIcon name="X" size={14} />
      </button>
    </div>
  );
};

export default PromotionBanner;