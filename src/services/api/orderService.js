import { toast } from 'react-toastify';
import { getApperClient } from '@/services/apperClient';

class OrderService {
  constructor() {
    this.orderTableName = 'order_c';
    this.orderItemTableName = 'order_item_c';
  }

  get apperClient() {
    const client = getApperClient();
    if (!client) {
      throw new Error('ApperSDK not initialized. Please ensure the SDK is loaded.');
    }
    return client;
  }

  async getAllForUser(userId) {
    try {
      const client = this.apperClient;

      const params = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "order_number_c" } },
          { "field": { "Name": "order_date_c" } },
          { "field": { "Name": "total_amount_c" } },
          { "field": { "Name": "status_c" } },
          { "field": { "Name": "user_c" } },
          { "field": { "Name": "CreatedOn" } }
        ],
        where: [
          { "FieldName": "user_c", "Operator": "EqualTo", "Values": [parseInt(userId)] }
        ],
        orderBy: [{ "fieldName": "order_date_c", "sorttype": "DESC" }],
        pagingInfo: { "limit": 100, "offset": 0 }
      };

      const response = await client.fetchRecords(this.orderTableName, params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching user orders:', error?.response?.data?.message || error);
      toast.error('Failed to load order history');
      return [];
    }
  }

  async getOrderDetails(orderId) {
    try {
      const client = this.apperClient;

      // Get order details
      const orderParams = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "order_number_c" } },
          { "field": { "Name": "order_date_c" } },
          { "field": { "Name": "total_amount_c" } },
          { "field": { "Name": "status_c" } },
          { "field": { "Name": "user_c" } },
          { "field": { "Name": "CreatedOn" } }
        ]
      };

      const orderResponse = await client.getRecordById(this.orderTableName, orderId, orderParams);

      if (!orderResponse?.data) {
        toast.error('Order not found');
        return null;
      }

      // Get order items with product details
      const itemsParams = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "order_c" } },
          { "field": { "Name": "product_c" } },
          { "field": { "Name": "quantity_c" } }
        ],
        where: [
          { "FieldName": "order_c", "Operator": "EqualTo", "Values": [parseInt(orderId)] }
        ]
      };

      const itemsResponse = await client.fetchRecords(this.orderItemTableName, itemsParams);

      const order = orderResponse.data;
      order.items = itemsResponse?.data || [];

      return order;
    } catch (error) {
      console.error('Error fetching order details:', error?.response?.data?.message || error);
      toast.error('Failed to load order details');
      return null;
    }
  }

  async reorder(orderId, addToCartFunction) {
    try {
      const orderDetails = await this.getOrderDetails(orderId);

      if (!orderDetails?.items?.length) {
        toast.error('No items found in this order');
        return false;
      }

      let successCount = 0;
      let failureCount = 0;

      for (const item of orderDetails.items) {
        try {
          if (item.product_c && item.product_c.Id) {
            const product = {
              Id: item.product_c.Id,
              title: item.product_c.Name,
              price: item.product_c.price_c || 0,
              image: item.product_c.image_c || '',
              category: item.product_c.category_c || '',
              inStock: true // Assume in stock for reorder
            };

            // Add to cart with original quantity
            for (let i = 0; i < (item.quantity_c || 1); i++) {
              addToCartFunction(product);
            }
            successCount++;
          }
        } catch (error) {
          console.error('Error adding item to cart:', error);
          failureCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} item${successCount > 1 ? 's' : ''} to cart`);
        return true;
      } else if (failureCount > 0) {
        toast.error('Failed to add items to cart');
        return false;
      }

      return false;
    } catch (error) {
      console.error('Error reordering:', error?.response?.data?.message || error);
      toast.error('Failed to reorder items');
      return false;
    }
  }

  async searchOrders(userId, searchTerm, dateRange) {
    try {
      const client = this.apperClient;

      const whereConditions = [
        { "FieldName": "user_c", "Operator": "EqualTo", "Values": [parseInt(userId)] }
      ];

      if (searchTerm) {
        whereConditions.push({
          "FieldName": "order_number_c",
          "Operator": "Contains",
          "Values": [searchTerm]
        });
      }

      if (dateRange?.startDate) {
        whereConditions.push({
          "FieldName": "order_date_c",
          "Operator": "GreaterThanOrEqualTo",
          "Values": [dateRange.startDate]
        });
      }

      if (dateRange?.endDate) {
        whereConditions.push({
          "FieldName": "order_date_c",
          "Operator": "LessThanOrEqualTo",
          "Values": [dateRange.endDate]
        });
      }

      const params = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "order_number_c" } },
          { "field": { "Name": "order_date_c" } },
          { "field": { "Name": "total_amount_c" } },
          { "field": { "Name": "status_c" } },
          { "field": { "Name": "user_c" } },
          { "field": { "Name": "CreatedOn" } }
        ],
        where: whereConditions,
        orderBy: [{ "fieldName": "order_date_c", "sorttype": "DESC" }],
        pagingInfo: { "limit": 100, "offset": 0 }
      };

      const response = await client.fetchRecords(this.orderTableName, params);

      return response?.data || [];
    } catch (error) {
      console.error('Error searching orders:', error?.response?.data?.message || error);
      toast.error('Failed to search orders');
      return [];
    }
  }
}

export const orderService = new OrderService();
export default orderService;