import { toast } from "react-toastify";
import { getApperClient } from '@/services/apperClient';

class ReviewService {
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
          { "field": { "Name": "product_id_c" } },
          { "field": { "Name": "rating_c" } },
          { "field": { "Name": "review_text_c" } },
          { "field": { "Name": "reviewer_name_c" } },
          { "field": { "Name": "review_date_c" } },
          { "field": { "Name": "helpful_count_c" } },
          { "field": { "Name": "not_helpful_count_c" } }
        ],
        orderBy: [{ "fieldName": "review_date_c", "sorttype": "DESC" }],
        pagingInfo: { "limit": 100, "offset": 0 }
      };

      const response = await client.fetchRecords("product_review_c", params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(review => ({
        Id: review.Id,
        product_id_c: review.product_id_c,
        rating_c: parseInt(review.rating_c || 0),
        review_text_c: review.review_text_c,
        reviewer_name_c: review.reviewer_name_c,
        review_date_c: review.review_date_c,
        helpful_count: parseInt(review.helpful_count_c || 0),
        not_helpful_count: parseInt(review.not_helpful_count_c || 0)
      }));
    } catch (error) {
      console.error("Error fetching reviews:", error?.response?.data?.message || error);
      return [];
    }
  }

  async getById(id) {
    try {
      const client = await this.apperClient();

      const params = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "product_id_c" } },
          { "field": { "Name": "rating_c" } },
          { "field": { "Name": "review_text_c" } },
          { "field": { "Name": "reviewer_name_c" } },
          { "field": { "Name": "review_date_c" } },
          { "field": { "Name": "helpful_count_c" } },
          { "field": { "Name": "not_helpful_count_c" } }
        ]
      };

      const response = await client.getRecordById("product_review_c", parseInt(id), params);

      if (!response?.data) {
        return null;
      }

      const review = response.data;
      return {
        Id: review.Id,
        product_id_c: review.product_id_c,
        rating_c: parseInt(review.rating_c || 0),
        review_text_c: review.review_text_c,
        reviewer_name_c: review.reviewer_name_c,
        review_date_c: review.review_date_c,
        helpful_count: parseInt(review.helpful_count_c || 0),
        not_helpful_count: parseInt(review.not_helpful_count_c || 0)
      };
    } catch (error) {
      console.error(`Error fetching review ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  }

  async getByProductId(productId, sortBy = "recent") {
    try {
      const client = await this.apperClient();

      let orderBy = [{ "fieldName": "review_date_c", "sorttype": "DESC" }];

      switch (sortBy) {
        case "helpful":
          orderBy = [{ "fieldName": "helpful_count_c", "sorttype": "DESC" }];
          break;
        case "rating_high":
          orderBy = [{ "fieldName": "rating_c", "sorttype": "DESC" }];
          break;
        case "rating_low":
          orderBy = [{ "fieldName": "rating_c", "sorttype": "ASC" }];
          break;
        default:
          orderBy = [{ "fieldName": "review_date_c", "sorttype": "DESC" }];
      }

      const params = {
        fields: [
          { "field": { "Name": "Id" } },
          { "field": { "Name": "product_id_c" } },
          { "field": { "Name": "rating_c" } },
          { "field": { "Name": "review_text_c" } },
          { "field": { "Name": "reviewer_name_c" } },
          { "field": { "Name": "review_date_c" } },
          { "field": { "Name": "helpful_count_c" } },
          { "field": { "Name": "not_helpful_count_c" } }
        ],
        where: [{ "FieldName": "product_id_c", "Operator": "EqualTo", "Values": [parseInt(productId)] }],
        orderBy: orderBy,
        pagingInfo: { "limit": 50, "offset": 0 }
      };

      const response = await client.fetchRecords("product_review_c", params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map(review => ({
        Id: review.Id,
        product_id_c: review.product_id_c,
        rating_c: parseInt(review.rating_c || 0),
        review_text_c: review.review_text_c,
        reviewer_name_c: review.reviewer_name_c,
        review_date_c: review.review_date_c,
        helpful_count: parseInt(review.helpful_count_c || 0),
        not_helpful_count: parseInt(review.not_helpful_count_c || 0)
      }));
    } catch (error) {
      console.error(`Error fetching reviews for product ${productId}:`, error?.response?.data?.message || error);
      return [];
    }
  }

  async getReviewStats(productId) {
    try {
      const client = await this.apperClient();

      const params = {
        fields: [
          { "field": { "Name": "rating_c" } }
        ],
        where: [{ "FieldName": "product_id_c", "Operator": "EqualTo", "Values": [parseInt(productId)] }],
        pagingInfo: { "limit": 1000, "offset": 0 }
      };

      const response = await client.fetchRecords("product_review_c", params);

      if (!response?.data?.length) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        };
      }

      const ratings = response.data.map(review => parseInt(review.rating_c || 0));
      const totalReviews = ratings.length;
      const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / totalReviews;

      const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      ratings.forEach(rating => {
        if (rating >= 1 && rating <= 5) {
          ratingBreakdown[rating]++;
        }
      });

      return {
        totalReviews,
        averageRating,
        ratingBreakdown
      };
    } catch (error) {
      console.error(`Error getting review stats for product ${productId}:`, error?.response?.data?.message || error);
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      };
    }
  }

  async create(reviewData) {
    try {
      const client = await this.apperClient();

      const params = {
        records: [
          {
            product_id_c: parseInt(reviewData.product_id_c),
            rating_c: parseInt(reviewData.rating_c),
            review_text_c: reviewData.review_text_c,
            reviewer_name_c: reviewData.reviewer_name_c,
            review_date_c: reviewData.review_date_c,
            helpful_count_c: 0,
            not_helpful_count_c: 0
          }
        ]
      };

      const response = await client.createRecord("product_review_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} reviews:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return successful.length > 0 ? successful[0].data : null;
      }
      return null;
    } catch (error) {
      console.error("Error creating review:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, reviewData) {
    try {
      const client = await this.apperClient();

      const params = {
        records: [
          {
            Id: parseInt(id),
            ...reviewData
          }
        ]
      };

      const response = await client.updateRecord("product_review_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} reviews:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return successful.length > 0 ? successful[0].data : null;
      }
      return null;
    } catch (error) {
      console.error("Error updating review:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const client = await this.apperClient();

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await client.deleteRecord("product_review_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} reviews:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return successful.length === 1;
      }
      return false;
    } catch (error) {
      console.error("Error deleting review:", error?.response?.data?.message || error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();