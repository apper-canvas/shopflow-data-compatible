class ProductService {
  constructor() {
    this.apperClient = null;
  }

  initializeClient() {
    // Initialize client logic here
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