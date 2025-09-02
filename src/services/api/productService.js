import { toast } from "react-toastify";

class ProductService {
  constructor() {
    this.tableName = 'product_c';
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "image_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "in_stock_c"}}
        ],
        orderBy: [{"fieldName": "Id", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching products:", response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform database fields to match UI expectations
      return response.data.map(product => ({
        Id: product.Id,
        title: product.title_c,
        price: parseFloat(product.price_c || 0),
        image: product.image_c,
        description: product.description_c,
        category: product.category_c,
        inStock: product.in_stock_c
      }));
    } catch (error) {
      console.error("Error fetching products:", error?.response?.data?.message || error);
      toast.error("Failed to load products");
      return [];
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "image_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "in_stock_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);
      
      if (!response?.data) {
        return null;
      }

      // Transform database fields to match UI expectations
      const product = response.data;
      return {
        Id: product.Id,
        title: product.title_c,
        price: parseFloat(product.price_c || 0),
        image: product.image_c,
        description: product.description_c,
        category: product.category_c,
        inStock: product.in_stock_c
      };
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async getByCategory(category) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "image_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "in_stock_c"}}
        ],
        where: [{"FieldName": "category_c", "Operator": "EqualTo", "Values": [category]}],
        orderBy: [{"fieldName": "Id", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching products by category:", response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform database fields to match UI expectations
      return response.data.map(product => ({
        Id: product.Id,
        title: product.title_c,
        price: parseFloat(product.price_c || 0),
        image: product.image_c,
        description: product.description_c,
        category: product.category_c,
        inStock: product.in_stock_c
      }));
    } catch (error) {
      console.error("Error fetching products by category:", error?.response?.data?.message || error);
      toast.error("Failed to load category products");
      return [];
    }
  }

  async getFeatured(limit = 12) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "image_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "in_stock_c"}}
        ],
        orderBy: [{"fieldName": "Id", "sorttype": "ASC"}],
        pagingInfo: {"limit": limit, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error fetching featured products:", response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform database fields to match UI expectations
      return response.data.map(product => ({
        Id: product.Id,
        title: product.title_c,
        price: parseFloat(product.price_c || 0),
        image: product.image_c,
        description: product.description_c,
        category: product.category_c,
        inStock: product.in_stock_c
      }));
    } catch (error) {
      console.error("Error fetching featured products:", error?.response?.data?.message || error);
      toast.error("Failed to load featured products");
      return [];
    }
  }

  async search(query) {
    try {
      const searchTerm = query.toLowerCase();
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "title_c"}},
          {"field": {"Name": "price_c"}},
          {"field": {"Name": "image_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "category_c"}},
          {"field": {"Name": "in_stock_c"}}
        ],
        whereGroups: [{
          "operator": "OR",
          "subGroups": [
            {
              "conditions": [
                {"fieldName": "title_c", "operator": "Contains", "values": [searchTerm]},
                {"fieldName": "description_c", "operator": "Contains", "values": [searchTerm]},
                {"fieldName": "category_c", "operator": "Contains", "values": [searchTerm]}
              ],
              "operator": "OR"
            }
          ]
        }],
        orderBy: [{"fieldName": "Id", "sorttype": "ASC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error("Error searching products:", response.message);
        toast.error(response.message);
        return [];
      }

      if (!response.data || response.data.length === 0) {
        return [];
      }

      // Transform database fields to match UI expectations
      return response.data.map(product => ({
        Id: product.Id,
        title: product.title_c,
        price: parseFloat(product.price_c || 0),
        image: product.image_c,
        description: product.description_c,
        category: product.category_c,
        inStock: product.in_stock_c
      }));
    } catch (error) {
      console.error("Error searching products:", error?.response?.data?.message || error);
      toast.error("Failed to search products");
      return [];
    }
  }

  getCategories() {
    // Static categories based on database picklist values
    return ["Electronics", "Clothing", "Home & Kitchen", "Sports", "Accessories"];
  }
}

export default new ProductService();