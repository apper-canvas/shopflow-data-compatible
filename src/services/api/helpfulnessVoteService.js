import { toast } from "react-toastify";

class HelpfulnessVoteService {
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

  async vote(reviewId, isHelpful) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // First, check if user already voted on this review
      const existingVoteParams = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "review_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "is_helpful_c"}}
        ],
        where: [
          {"FieldName": "review_id_c", "Operator": "EqualTo", "Values": [parseInt(reviewId)]}
        ],
        pagingInfo: {"limit": 1, "offset": 0}
      };

      const existingVotes = await this.apperClient.fetchRecords("review_helpfulness_vote_c", existingVoteParams);
      
      let voteResult;
      if (existingVotes?.data?.length > 0) {
        // Update existing vote
        const voteId = existingVotes.data[0].Id;
        const updateParams = {
          records: [{
            Id: voteId,
            is_helpful_c: isHelpful
          }]
        };
        voteResult = await this.apperClient.updateRecord("review_helpfulness_vote_c", updateParams);
      } else {
        // Create new vote
        const createParams = {
          records: [{
            review_id_c: parseInt(reviewId),
            user_id_c: "user_placeholder", // In real app, use actual user ID
            is_helpful_c: isHelpful,
            vote_date_c: new Date().toISOString().split('T')[0]
          }]
        };
        voteResult = await this.apperClient.createRecord("review_helpfulness_vote_c", createParams);
      }

      if (!voteResult.success) {
        throw new Error(voteResult.message);
      }

      // Update the review's helpful counts
      await this.updateReviewHelpfulnessCounts(reviewId);
      
      return true;
    } catch (error) {
      console.error("Error voting on review helpfulness:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async updateReviewHelpfulnessCounts(reviewId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      // Get all votes for this review
      const votesParams = {
        fields: [
          {"field": {"Name": "is_helpful_c"}}
        ],
        where: [
          {"FieldName": "review_id_c", "Operator": "EqualTo", "Values": [parseInt(reviewId)]}
        ],
        pagingInfo: {"limit": 1000, "offset": 0}
      };

      const votesResponse = await this.apperClient.fetchRecords("review_helpfulness_vote_c", votesParams);
      
      let helpfulCount = 0;
      let notHelpfulCount = 0;

      if (votesResponse?.data) {
        votesResponse.data.forEach(vote => {
          if (vote.is_helpful_c === true || vote.is_helpful_c === "true") {
            helpfulCount++;
          } else {
            notHelpfulCount++;
          }
        });
      }

      // Update the review with new counts
      const updateReviewParams = {
        records: [{
          Id: parseInt(reviewId),
          helpful_count_c: helpfulCount,
          not_helpful_count_c: notHelpfulCount
        }]
      };

      await this.apperClient.updateRecord("product_review_c", updateReviewParams);
    } catch (error) {
      console.error("Error updating review helpfulness counts:", error?.response?.data?.message || error);
    }
  }

  async getVotesForReview(reviewId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "review_id_c"}},
          {"field": {"Name": "user_id_c"}},
          {"field": {"Name": "is_helpful_c"}},
          {"field": {"Name": "vote_date_c"}}
        ],
        where: [
          {"FieldName": "review_id_c", "Operator": "EqualTo", "Values": [parseInt(reviewId)]}
        ],
        pagingInfo: {"limit": 100, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords("review_helpfulness_vote_c", params);

      if (!response?.data) {
        return [];
      }

      return response.data.map(vote => ({
        Id: vote.Id,
        review_id_c: vote.review_id_c,
        user_id_c: vote.user_id_c,
        is_helpful_c: vote.is_helpful_c,
        vote_date_c: vote.vote_date_c
      }));
    } catch (error) {
      console.error(`Error getting votes for review ${reviewId}:`, error?.response?.data?.message || error);
      return [];
    }
  }

  async getUserVoteForReview(reviewId, userId) {
    try {
      if (!this.apperClient) this.initializeClient();
      
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "is_helpful_c"}}
        ],
        where: [
          {"FieldName": "review_id_c", "Operator": "EqualTo", "Values": [parseInt(reviewId)]},
          {"FieldName": "user_id_c", "Operator": "EqualTo", "Values": [userId]}
        ],
        pagingInfo: {"limit": 1, "offset": 0}
      };

      const response = await this.apperClient.fetchRecords("review_helpfulness_vote_c", params);

      if (!response?.data?.length) {
        return null;
      }

      return {
        Id: response.data[0].Id,
        is_helpful_c: response.data[0].is_helpful_c
      };
    } catch (error) {
      console.error(`Error getting user vote for review ${reviewId}:`, error?.response?.data?.message || error);
      return null;
    }
  }
}

export const helpfulnessVoteService = new HelpfulnessVoteService();