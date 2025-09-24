import { getApperClient } from '@/utils/apperClient';

class ProductService {
  constructor() {
    // No longer need to manage client instance
  }

  async apperClient() {
    const client = await getApperClient();
    if (!client) {
      throw new Error('ApperSDK not initialized. Please ensure the SDK is loaded.');
    }
    return client;
  }

  async getAll(filters = {}) {
    try {
      const client = await this.apperClient();

      const params = {
        fields: [
          { "field": { "Name": "Name" } },
          { "field": { "Name": "title_c" } },
          { "field": { "Name": "price_c" } },
          { "field": { "Name": "image_c" } },
          { "field": { "Name": "description_c" } },
          { "field": { "Name": "category_c" } },
          { "field": { "Name": "in_stock_c" } },
          { "field": { "Name": "discount_percentage_c" } },
          { "field": { "Name": "is_on_sale_c" } },
          { "field": { "Name": "Tags" } },
          { "field": { "Name": "CreatedOn" } }
        ],
        pagingInfo: { limit: filters.limit || 50, offset: filters.offset || 0 }
      };

      if (filters.category) {
        params.where = [{ "FieldName": "category_c", "Operator": "ExactMatch", "Values": [filters.category] }];
      }

      if (filters.search) {
        params.whereGroups = [{
          operator: "OR",
          subGroups: [{
            conditions: [
              { "fieldName": "title_c", "operator": "Contains", "values": [filters.search] },
              { "fieldName": "description_c", "operator": "Contains", "values": [filters.search] }
            ]
          }]
        }];
      }

      if (filters.orderBy) {
        params.orderBy = [{ "fieldName": filters.orderBy, "sorttype": filters.sortDirection || "ASC" }];
      }

      const response = await client.fetchRecords("product_c", params);

      if (!response.success) {
        console.error("Error fetching products:", response.message);
        throw new Error(response.message);
      }

      return (response.data || []).map(item => ({
        Id: item.Id,
        title: item.title_c || item.Name,
        price: parseFloat(item.price_c || 0),
        image: item.image_c,
        description: item.description_c,
        category: item.category_c,
        inStock: Boolean(item.in_stock_c),
        discountPercentage: parseFloat(item.discount_percentage_c || 0),
        isOnSale: Boolean(item.is_on_sale_c),
        tags: item.Tags,
        createdOn: item.CreatedOn
      }));

    } catch (error) {
      console.error("Error fetching products:", error?.response?.data?.message || error);
      throw new Error("Failed to load products");
    }
  }

  async getById(id) {
    try {
      const client = await this.apperClient();

      const params = {
        fields: [
          { "field": { "Name": "Name" } },
          { "field": { "Name": "title_c" } },
          { "field": { "Name": "price_c" } },
          { "field": { "Name": "image_c" } },
          { "field": { "Name": "description_c" } },
          { "field": { "Name": "category_c" } },
          { "field": { "Name": "in_stock_c" } },
          { "field": { "Name": "discount_percentage_c" } },
          { "field": { "Name": "is_on_sale_c" } },
          { "field": { "Name": "Tags" } },
          { "field": { "Name": "CreatedOn" } },
          { "field": { "Name": "ModifiedOn" } }
        ]
      };

      const response = await client.getRecordById("product_c", parseInt(id), params);

      if (!response.success) {
        console.error("Error fetching product:", response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error("Product not found");
      }

      const item = response.data;
      return {
        Id: item.Id,
        title: item.title_c || item.Name,
        price: parseFloat(item.price_c || 0),
        image: item.image_c,
        description: item.description_c,
        category: item.category_c,
        inStock: Boolean(item.in_stock_c),
        discountPercentage: parseFloat(item.discount_percentage_c || 0),
        isOnSale: Boolean(item.is_on_sale_c),
        tags: item.Tags,
        createdOn: item.CreatedOn,
        modifiedOn: item.ModifiedOn
      };

    } catch (error) {
      console.error("Error fetching product:", error?.response?.data?.message || error);
      throw new Error("Failed to load product details");
    }
  }

  async create(productData) {
    try {
      const client = await this.apperClient();

      // Only include Updateable fields
      const params = {
        records: [{
          Name: productData.title || productData.Name,
          title_c: productData.title,
          price_c: parseFloat(productData.price || 0),
          image_c: productData.image,
          description_c: productData.description,
          category_c: productData.category,
          in_stock_c: Boolean(productData.inStock),
          discount_percentage_c: parseFloat(productData.discountPercentage || 0),
          is_on_sale_c: Boolean(productData.isOnSale),
          Tags: productData.tags
        }]
      };

      const response = await client.createRecord("product_c", params);

      if (!response.success) {
        console.error("Error creating product:", response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} products:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      throw new Error("Product creation failed");

    } catch (error) {
      console.error("Error creating product:", error?.response?.data?.message || error);
      throw new Error("Failed to create product");
    }
  }

  async update(id, productData) {
    try {
      const client = await this.apperClient();

      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          Name: productData.title || productData.Name,
          title_c: productData.title,
          price_c: parseFloat(productData.price || 0),
          image_c: productData.image,
          description_c: productData.description,
          category_c: productData.category,
          in_stock_c: Boolean(productData.inStock),
          discount_percentage_c: parseFloat(productData.discountPercentage || 0),
          is_on_sale_c: Boolean(productData.isOnSale),
          Tags: productData.tags
        }]
      };

      const response = await client.updateRecord("product_c", params);

      if (!response.success) {
        console.error("Error updating product:", response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} products:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      throw new Error("Product update failed");

    } catch (error) {
      console.error("Error updating product:", error?.response?.data?.message || error);
      throw new Error("Failed to update product");
    }
  }

  async delete(id) {
    try {
      const client = await this.apperClient();

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await client.deleteRecord("product_c", params);

      if (!response.success) {
        console.error("Error deleting product:", response.message);
        throw new Error(response.message);
      }

      if (response.results && response.results.length > 0) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} products:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
          return false;
        }

        return successful.length > 0;
      }

      return true;

    } catch (error) {
      console.error("Error deleting product:", error?.response?.data?.message || error);
      throw new Error("Failed to delete product");
    }
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
      const client = await this.apperClient();
      if (!productIds?.length) return {};

      const params = {
        fields: [
          { "field": { "Name": "product_id_c" } },
          { "field": { "Name": "rating_c" } }
        ],
        where: [{ "FieldName": "product_id_c", "Operator": "ExactMatch", "Values": productIds }],
        pagingInfo: { "limit": 1000, "offset": 0 }
      };

      const response = await client.fetchRecords("product_review_c", params);

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