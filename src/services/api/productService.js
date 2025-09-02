class ProductService {
  constructor() {
    this.apperClient = null;
  }

initializeClient() {
    // Initialize client logic here
  }

  async getFeatured(limit = 12) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock featured products data
      const allProducts = [
        {
          Id: 1,
          title: "Premium Wireless Headphones",
          description: "High-quality wireless headphones with noise cancellation and premium sound quality.",
          price: 299.99,
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
          inStock: true,
          averageRating: 4.5,
          reviewCount: 128,
          category: "Electronics"
        },
        {
          Id: 2,
          title: "Smart Fitness Watch",
          description: "Advanced fitness tracking with heart rate monitor, GPS, and smartphone connectivity.",
          price: 249.99,
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
          inStock: true,
          averageRating: 4.2,
          reviewCount: 89,
          category: "Electronics"
        },
        {
          Id: 3,
          title: "Ergonomic Office Chair",
          description: "Comfortable ergonomic chair designed for long work sessions with lumbar support.",
          price: 399.99,
          image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400",
          inStock: true,
          averageRating: 4.7,
          reviewCount: 156,
          category: "Furniture"
        },
        {
          Id: 4,
          title: "Professional Coffee Maker",
          description: "Barista-quality coffee maker with programmable settings and thermal carafe.",
          price: 179.99,
          image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
          inStock: true,
          averageRating: 4.4,
          reviewCount: 203,
          category: "Kitchen"
        },
        {
          Id: 5,
          title: "Ultra-Portable Laptop",
          description: "Lightweight laptop with powerful performance for professionals on the go.",
          price: 1299.99,
          image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
          inStock: true,
          averageRating: 4.6,
          reviewCount: 94,
          category: "Electronics"
        },
        {
          Id: 6,
          title: "Designer Sunglasses",
          description: "Stylish sunglasses with UV protection and premium frame materials.",
          price: 129.99,
          image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400",
          inStock: true,
          averageRating: 4.3,
          reviewCount: 67,
          category: "Fashion"
        },
        {
          Id: 7,
          title: "Wireless Smartphone Charger",
          description: "Fast wireless charging pad compatible with all Qi-enabled devices.",
          price: 49.99,
          image: "https://images.unsplash.com/photo-1609592853767-cb1b3ad89f12?w=400",
          inStock: true,
          averageRating: 4.1,
          reviewCount: 145,
          category: "Electronics"
        },
        {
          Id: 8,
          title: "Premium Kitchen Knife Set",
          description: "Professional-grade knife set with wooden block and honing steel.",
          price: 199.99,
          image: "https://images.unsplash.com/photo-1594736797933-d0d4159fdc78?w=400",
          inStock: false,
          averageRating: 4.8,
          reviewCount: 78,
          category: "Kitchen"
        },
        {
          Id: 9,
          title: "Smart Home Security Camera",
          description: "WiFi-enabled security camera with night vision and mobile app control.",
          price: 89.99,
          image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400",
          inStock: true,
          averageRating: 4.2,
          reviewCount: 112,
          category: "Electronics"
        },
        {
          Id: 10,
          title: "Organic Cotton Bed Sheets",
          description: "Luxuriously soft organic cotton sheets with deep pockets and fade resistance.",
          price: 89.99,
          image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400",
          inStock: true,
          averageRating: 4.5,
          reviewCount: 234,
          category: "Home"
        },
        {
          Id: 11,
          title: "Bluetooth Speaker",
          description: "Portable Bluetooth speaker with 360-degree sound and waterproof design.",
          price: 79.99,
          image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
          inStock: true,
          averageRating: 4.0,
          reviewCount: 87,
          category: "Electronics"
        },
        {
          Id: 12,
          title: "Yoga Mat Premium",
          description: "Non-slip yoga mat made from eco-friendly materials with alignment lines.",
          price: 59.99,
          image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400",
          inStock: true,
          averageRating: 4.6,
          reviewCount: 156,
          category: "Fitness"
        }
      ]
      
      // Return limited number of products
      return allProducts.slice(0, limit)
      
    } catch (error) {
      console.error("Error fetching featured products:", error)
      throw new Error("Failed to load featured products")
    }
  }

  async getReviewStatsForProducts(productIds) {
    try {
      if (!this.apperClient) this.initializeClient();
      if (!productIds?.length) return {};
      
      const params = {
        fields: [
          {"field": {"Name": "product_id_c"}},
          {"field": {"Name": "rating_c"}}
        ],
        where: [{"FieldName": "product_id_c", "Operator": "ExactMatch", "Values": productIds}],
        pagingInfo: {"limit": 1000, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords("product_review_c", params);
      
      const stats = {};
      
      if (response?.data) {
        // Group reviews by product ID
        const reviewsByProduct = {};
        response.data.forEach(review => {
          const productId = review.product_id_c;
          if (!reviewsByProduct[productId]) {
            reviewsByProduct[productId] = [];
          }
          reviewsByProduct[productId].push(parseInt(review.rating_c || 0));
        });

        // Calculate stats for each product
        Object.keys(reviewsByProduct).forEach(productId => {
          const ratings = reviewsByProduct[productId];
          const reviewCount = ratings.length;
          const averageRating = reviewCount > 0 
            ? ratings.reduce((sum, rating) => sum + rating, 0) / reviewCount
            : 0;
          
          stats[productId] = {
            averageRating,
            reviewCount
          };
        });
      }

      // Ensure all requested product IDs have stats (even if 0)
      productIds.forEach(id => {
        if (!stats[id]) {
          stats[id] = { averageRating: 0, reviewCount: 0 };
        }
      });

      return stats;
    } catch (error) {
      console.error("Error getting review stats for products:", error?.response?.data?.message || error);
      return {};
    }
  }

  getCategories() {
    return [
      "Electronics",
      "Clothing", 
      "Home & Kitchen",
      "Sports",
      "Books",
      "Beauty",
      "Accessories"
    ];
  }
}

export const productService = new ProductService();
export default productService;