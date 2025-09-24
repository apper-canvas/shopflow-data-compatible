import { toast } from 'react-toastify';
import { getApperClient } from '@/services/apperClient';

class PromotionService {
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

  async getAll() {
    try {
      const client = await this.apperClient();

      const params = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "name_c" } },
          { "field": { "Name": "description_c" } },
          { "field": { "Name": "discount_percentage_c" } },
          { "field": { "Name": "start_date_c" } },
          { "field": { "Name": "end_date_c" } },
          { "field": { "Name": "is_active_c" } },
          { "field": { "Name": "product_ids_c" } },
          { "field": { "Name": "promotion_type_c" } }
        ],
        orderBy: [{ "fieldName": "start_date_c", "sorttype": "DESC" }]
      };

      const response = await client.fetchRecords('promotion_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching promotions:", error?.response?.data?.message || error);
      toast.error("Failed to load promotions");
      return [];
    }
  }

  async getActivePromotions() {
    try {
      const client = await this.apperClient();

      const currentDate = new Date().toISOString().split('T')[0];

      const params = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "name_c" } },
          { "field": { "Name": "description_c" } },
          { "field": { "Name": "discount_percentage_c" } },
          { "field": { "Name": "start_date_c" } },
          { "field": { "Name": "end_date_c" } },
          { "field": { "Name": "is_active_c" } },
          { "field": { "Name": "product_ids_c" } },
          { "field": { "Name": "promotion_type_c" } }
        ],
        where: [
          { "FieldName": "is_active_c", "Operator": "EqualTo", "Values": [true] },
          { "FieldName": "start_date_c", "Operator": "LessThanOrEqualTo", "Values": [currentDate] },
          { "FieldName": "end_date_c", "Operator": "GreaterThanOrEqualTo", "Values": [currentDate] }
        ],
        orderBy: [{ "fieldName": "start_date_c", "sorttype": "DESC" }]
      };

      const response = await client.fetchRecords('promotion_c', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching active promotions:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getProductPromotions(productId) {
    try {
      const client = await this.apperClient();

      const currentDate = new Date().toISOString().split('T')[0];

      const params = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "name_c" } },
          { "field": { "Name": "discount_percentage_c" } },
          { "field": { "Name": "start_date_c" } },
          { "field": { "Name": "end_date_c" } },
          { "field": { "Name": "promotion_type_c" } }
        ],
        where: [
          { "FieldName": "is_active_c", "Operator": "EqualTo", "Values": [true] },
          { "FieldName": "start_date_c", "Operator": "LessThanOrEqualTo", "Values": [currentDate] },
          { "FieldName": "end_date_c", "Operator": "GreaterThanOrEqualTo", "Values": [currentDate] },
          { "FieldName": "product_ids_c", "Operator": "Contains", "Values": [productId.toString()] }
        ],
        orderBy: [{ "fieldName": "discount_percentage_c", "sorttype": "DESC" }]
      };

      const response = await client.fetchRecords('promotion_c', params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching product promotions:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const client = await this.apperClient();

      const params = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "name_c" } },
          { "field": { "Name": "description_c" } },
          { "field": { "Name": "discount_percentage_c" } },
          { "field": { "Name": "start_date_c" } },
          { "field": { "Name": "end_date_c" } },
          { "field": { "Name": "is_active_c" } },
          { "field": { "Name": "product_ids_c" } },
          { "field": { "Name": "promotion_type_c" } }
        ]
      };

      const response = await client.getRecordById('promotion_c', id, params);

      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching promotion ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(promotionData) {
    try {
      const client = await this.apperClient();

      const params = {
        records: [{
          name_c: promotionData.name_c,
          description_c: promotionData.description_c,
          discount_percentage_c: promotionData.discount_percentage_c,
          start_date_c: promotionData.start_date_c,
          end_date_c: promotionData.end_date_c,
          is_active_c: promotionData.is_active_c || true,
          product_ids_c: promotionData.product_ids_c || "",
          promotion_type_c: promotionData.promotion_type_c || "percentage"
        }]
      };

      const response = await client.createRecord('promotion_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create promotion:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        toast.success("Promotion created successfully");
        return successful[0]?.data || null;
      }
    } catch (error) {
      console.error("Error creating promotion:", error?.response?.data?.message || error);
      toast.error("Failed to create promotion");
      return null;
    }
  }

  async update(id, promotionData) {
    try {
      const client = await this.apperClient();

      const params = {
        records: [{
          Id: id,
          name_c: promotionData.name_c,
          description_c: promotionData.description_c,
          discount_percentage_c: promotionData.discount_percentage_c,
          start_date_c: promotionData.start_date_c,
          end_date_c: promotionData.end_date_c,
          is_active_c: promotionData.is_active_c,
          product_ids_c: promotionData.product_ids_c,
          promotion_type_c: promotionData.promotion_type_c
        }]
      };

      const response = await client.updateRecord('promotion_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update promotion:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        toast.success("Promotion updated successfully");
        return successful[0]?.data || null;
      }
    } catch (error) {
      console.error("Error updating promotion:", error?.response?.data?.message || error);
      toast.error("Failed to update promotion");
      return null;
    }
  }

  async delete(id) {
    try {
      const client = await this.apperClient();

      const params = {
        RecordIds: [id]
      };

      const response = await client.deleteRecord('promotion_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete promotion:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }

        toast.success("Promotion deleted successfully");
        return true;
      }
    } catch (error) {
      console.error("Error deleting promotion:", error?.response?.data?.message || error);
      toast.error("Failed to delete promotion");
      return false;
    }
  }

  calculatePromotionalPrice(originalPrice, discountPercentage) {
    if (!discountPercentage || discountPercentage <= 0) {
      return originalPrice;
    }

    const discountAmount = (originalPrice * discountPercentage) / 100;
    return originalPrice - discountAmount;
  }

  formatPromotionalDisplay(originalPrice, promotionalPrice, discountPercentage) {
    return {
      originalPrice: originalPrice.toFixed(2),
      promotionalPrice: promotionalPrice.toFixed(2),
      discountPercentage: Math.round(discountPercentage),
      savings: (originalPrice - promotionalPrice).toFixed(2)
    };
  }
}

export const promotionService = new PromotionService();