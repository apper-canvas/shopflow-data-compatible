import { toast } from 'react-toastify';
import { getApperClient } from '@/utils/apperClient';

class ShippingService {
  constructor() {
    this.tableName = 'shipping_information_c';
  }

  get apperClient() {
    const client = getApperClient();
    if (!client) {
      throw new Error('ApperSDK not initialized. Please ensure the SDK is loaded.');
    }
    return client;
  }

  async create(shippingData) {
    try {
      const client = this.apperClient;

      const params = {
        records: [{
          first_name_c: shippingData.firstName,
          last_name_c: shippingData.lastName,
          address_line_1_c: shippingData.addressLine1,
          address_line_2_c: shippingData.addressLine2 || '',
          city_c: shippingData.city,
          state_c: shippingData.state,
          zip_code_c: shippingData.zipCode,
          country_c: shippingData.country,
          phone_number_c: shippingData.phoneNumber || '',
          checkout_session_id_c: shippingData.checkoutSessionId
        }]
      };

      const response = await client.createRecord(this.tableName, params);

      if (!response.success) {
        console.error('Failed to create shipping information:', response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create shipping information: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Shipping information saved successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error creating shipping information:', error?.response?.data?.message || error);
      toast.error('Failed to save shipping information');
      return null;
    }
  }

  async getById(shippingId) {
    try {
      const client = this.apperClient;

      const params = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "first_name_c" } },
          { "field": { "Name": "last_name_c" } },
          { "field": { "Name": "address_line_1_c" } },
          { "field": { "Name": "address_line_2_c" } },
          { "field": { "Name": "city_c" } },
          { "field": { "Name": "state_c" } },
          { "field": { "Name": "zip_code_c" } },
          { "field": { "Name": "country_c" } },
          { "field": { "Name": "phone_number_c" } },
          { "field": { "Name": "checkout_session_id_c" } }
        ]
      };

      const response = await client.getRecordById(this.tableName, shippingId, params);

      if (!response?.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching shipping information:', error?.response?.data?.message || error);
      return null;
    }
  }

  async update(shippingId, updateData) {
    try {
      const client = this.apperClient;

      const params = {
        records: [{
          Id: shippingId,
          ...updateData
        }]
      };

      const response = await client.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error('Failed to update shipping information:', response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update shipping information: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return null;
        }

        if (successful.length > 0) {
          toast.success('Shipping information updated successfully');
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error('Error updating shipping information:', error?.response?.data?.message || error);
      toast.error('Failed to update shipping information');
      return null;
    }
  }

  async delete(shippingId) {
    try {
      const client = this.apperClient;

      const params = {
        RecordIds: [shippingId]
      };

      const response = await client.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error('Failed to delete shipping information:', response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete shipping information: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }

        if (successful.length > 0) {
          toast.success('Shipping information deleted successfully');
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error deleting shipping information:', error?.response?.data?.message || error);
      toast.error('Failed to delete shipping information');
      return false;
    }
  }
}

export const shippingService = new ShippingService();
export default shippingService;