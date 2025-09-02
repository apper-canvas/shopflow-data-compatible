import { toast } from 'react-toastify';

class DiscountCodeService {
  constructor() {
    this.initializeClient();
  }

  initializeClient() {
    if (typeof window !== 'undefined' && window.ApperSDK) {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    }
  }

  async getAll() {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "code_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "discount_type_c"}},
          {"field": {"Name": "discount_value_c"}},
          {"field": {"Name": "start_date_c"}},
          {"field": {"Name": "end_date_c"}},
          {"field": {"Name": "is_active_c"}},
          {"field": {"Name": "usage_limit_c"}},
          {"field": {"Name": "usage_count_c"}},
          {"field": {"Name": "minimum_order_amount_c"}}
        ],
        orderBy: [{"fieldName": "start_date_c", "sorttype": "DESC"}]
      };

      const response = await this.apperClient.fetchRecords('discount_code_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching discount codes:", error?.response?.data?.message || error);
      toast.error("Failed to load discount codes");
      return [];
    }
  }

  async validateCode(code, orderAmount = 0) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      if (!code || typeof code !== 'string' || code.trim().length === 0) {
        return {
          isValid: false,
          message: "Please enter a discount code",
          discountAmount: 0
        };
      }

      const currentDate = new Date().toISOString().split('T')[0];
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "code_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "discount_type_c"}},
          {"field": {"Name": "discount_value_c"}},
          {"field": {"Name": "start_date_c"}},
          {"field": {"Name": "end_date_c"}},
          {"field": {"Name": "is_active_c"}},
          {"field": {"Name": "usage_limit_c"}},
          {"field": {"Name": "usage_count_c"}},
          {"field": {"Name": "minimum_order_amount_c"}}
        ],
        where: [
          {"FieldName": "code_c", "Operator": "EqualTo", "Values": [code.trim().toUpperCase()]},
          {"FieldName": "is_active_c", "Operator": "EqualTo", "Values": [true]},
          {"FieldName": "start_date_c", "Operator": "LessThanOrEqualTo", "Values": [currentDate]},
          {"FieldName": "end_date_c", "Operator": "GreaterThanOrEqualTo", "Values": [currentDate]}
        ]
      };

      const response = await this.apperClient.fetchRecords('discount_code_c', params);

      if (!response.success) {
        console.error(response.message);
        return {
          isValid: false,
          message: "Error validating discount code",
          discountAmount: 0
        };
      }

      const discountCodes = response.data || [];
      
      if (discountCodes.length === 0) {
        return {
          isValid: false,
          message: "Invalid or expired discount code",
          discountAmount: 0
        };
      }

      const discountCode = discountCodes[0];

      // Check usage limit
      if (discountCode.usage_limit_c && discountCode.usage_count_c >= discountCode.usage_limit_c) {
        return {
          isValid: false,
          message: "This discount code has reached its usage limit",
          discountAmount: 0
        };
      }

      // Check minimum order amount
      if (discountCode.minimum_order_amount_c && orderAmount < discountCode.minimum_order_amount_c) {
        return {
          isValid: false,
          message: `Minimum order amount of $${discountCode.minimum_order_amount_c.toFixed(2)} required`,
          discountAmount: 0
        };
      }

      // Calculate discount amount
      let discountAmount = 0;
      if (discountCode.discount_type_c === 'percentage') {
        discountAmount = (orderAmount * discountCode.discount_value_c) / 100;
      } else if (discountCode.discount_type_c === 'fixed') {
        discountAmount = Math.min(discountCode.discount_value_c, orderAmount);
      }

      return {
        isValid: true,
        message: `${discountCode.name_c} applied successfully!`,
        discountAmount: discountAmount,
        discountCode: discountCode
      };

    } catch (error) {
      console.error("Error validating discount code:", error?.response?.data?.message || error);
      return {
        isValid: false,
        message: "Error validating discount code",
        discountAmount: 0
      };
    }
  }

  async applyDiscount(code) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Find the discount code
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "usage_count_c"}}
        ],
        where: [
          {"FieldName": "code_c", "Operator": "EqualTo", "Values": [code.trim().toUpperCase()]}
        ]
      };

      const response = await this.apperClient.fetchRecords('discount_code_c', params);

      if (!response.success || !response.data || response.data.length === 0) {
        return false;
      }

      const discountCode = response.data[0];
      
      // Increment usage count
      const updateParams = {
        records: [{
          Id: discountCode.Id,
          usage_count_c: (discountCode.usage_count_c || 0) + 1
        }]
      };

      const updateResponse = await this.apperClient.updateRecord('discount_code_c', updateParams);

      if (!updateResponse.success) {
        console.error("Failed to update discount code usage:", updateResponse.message);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error applying discount code:", error?.response?.data?.message || error);
      return false;
    }
  }

  async getById(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "code_c"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "discount_type_c"}},
          {"field": {"Name": "discount_value_c"}},
          {"field": {"Name": "start_date_c"}},
          {"field": {"Name": "end_date_c"}},
          {"field": {"Name": "is_active_c"}},
          {"field": {"Name": "usage_limit_c"}},
          {"field": {"Name": "usage_count_c"}},
          {"field": {"Name": "minimum_order_amount_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById('discount_code_c', id, params);

      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching discount code ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async create(discountCodeData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          code_c: discountCodeData.code_c.toUpperCase(),
          name_c: discountCodeData.name_c,
          description_c: discountCodeData.description_c,
          discount_type_c: discountCodeData.discount_type_c,
          discount_value_c: discountCodeData.discount_value_c,
          start_date_c: discountCodeData.start_date_c,
          end_date_c: discountCodeData.end_date_c,
          is_active_c: discountCodeData.is_active_c || true,
          usage_limit_c: discountCodeData.usage_limit_c || null,
          usage_count_c: 0,
          minimum_order_amount_c: discountCodeData.minimum_order_amount_c || 0
        }]
      };

      const response = await this.apperClient.createRecord('discount_code_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create discount code:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        
        toast.success("Discount code created successfully");
        return successful[0]?.data || null;
      }
    } catch (error) {
      console.error("Error creating discount code:", error?.response?.data?.message || error);
      toast.error("Failed to create discount code");
      return null;
    }
  }

  async update(id, discountCodeData) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        records: [{
          Id: id,
          code_c: discountCodeData.code_c.toUpperCase(),
          name_c: discountCodeData.name_c,
          description_c: discountCodeData.description_c,
          discount_type_c: discountCodeData.discount_type_c,
          discount_value_c: discountCodeData.discount_value_c,
          start_date_c: discountCodeData.start_date_c,
          end_date_c: discountCodeData.end_date_c,
          is_active_c: discountCodeData.is_active_c,
          usage_limit_c: discountCodeData.usage_limit_c,
          minimum_order_amount_c: discountCodeData.minimum_order_amount_c
        }]
      };

      const response = await this.apperClient.updateRecord('discount_code_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update discount code:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }
        
        toast.success("Discount code updated successfully");
        return successful[0]?.data || null;
      }
    } catch (error) {
      console.error("Error updating discount code:", error?.response?.data?.message || error);
      toast.error("Failed to update discount code");
      return null;
    }
  }

  async delete(id) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord('discount_code_c', params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete discount code:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }
        
        toast.success("Discount code deleted successfully");
        return true;
      }
    } catch (error) {
      console.error("Error deleting discount code:", error?.response?.data?.message || error);
      toast.error("Failed to delete discount code");
      return false;
    }
  }
}

export const discountCodeService = new DiscountCodeService();