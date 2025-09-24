import { toast } from 'react-toastify';
import { getApperClient } from '@/utils/apperClient';

class CheckoutService {
  constructor() {
    this.tableName = 'checkout_session_c';
  }

  get apperClient() {
    const client = getApperClient();
    if (!client) {
      throw new Error('ApperSDK not initialized. Please ensure the SDK is loaded.');
    }
    return client;
  }

  async createSession(sessionData) {
    try {
      const client = this.apperClient;

      const params = {
        records: [{
          user_id_c: sessionData.userId,
          cart_data_c: JSON.stringify(sessionData.cartData),
          subtotal_c: sessionData.subtotal,
          discount_amount_c: sessionData.discountAmount || 0,
          discount_code_c: sessionData.discountCode || '',
          total_amount_c: sessionData.totalAmount || sessionData.subtotal,
          status_c: sessionData.status || 'cart_review',
          created_date_c: new Date().toISOString()
        }]
      };

      const response = await client.createRecord(this.tableName, params);

      if (!response.success) {
        console.error('Failed to create checkout session:', response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create checkout session: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Checkout session created successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error creating checkout session:', error?.response?.data?.message || error);
      toast.error('Failed to create checkout session');
      return null;
    }
  }

  async getSession(sessionId) {
    try {
      const client = this.apperClient;

      const params = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "user_id_c" } },
          { "field": { "Name": "cart_data_c" } },
          { "field": { "Name": "subtotal_c" } },
          { "field": { "Name": "discount_amount_c" } },
          { "field": { "Name": "discount_code_c" } },
          { "field": { "Name": "total_amount_c" } },
          { "field": { "Name": "status_c" } },
          { "field": { "Name": "created_date_c" } }
        ]
      };

      const response = await client.getRecordById(this.tableName, sessionId, params);

      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching checkout session:', error?.response?.data?.message || error);
      return null;
    }
  }

  async updateSession(sessionId, updateData) {
    try {
      const client = this.apperClient;

      const params = {
        records: [{
          Id: sessionId,
          ...updateData,
          total_amount_c: updateData.totalAmount || updateData.subtotal
        }]
      };

      const response = await client.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error('Failed to update checkout session:', response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update checkout session: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Checkout session updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating checkout session:', error?.response?.data?.message || error);
      toast.error('Failed to update checkout session');
      return null;
    }
  }
}

export const checkoutService = new CheckoutService();
export default checkoutService;