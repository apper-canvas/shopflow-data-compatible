import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import HeartButton from "@/components/molecules/HeartButton"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import { useCart } from "@/hooks/useCart"
import { useWishlist } from "@/hooks/useWishlist"
import { productService } from "@/services/api/productService"
import { reviewService } from "@/services/api/reviewService"
import { helpfulnessVoteService } from "@/services/api/helpfulnessVoteService"
const StarRating = ({ rating, maxStars = 5, size = 16, className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(maxStars)].map((_, index) => (
        <ApperIcon
          key={index}
          name="Star"
          size={size}
          className={`${
            index < Math.floor(rating)
              ? "text-warning fill-warning"
              : index < rating
              ? "text-warning fill-warning opacity-50"
              : "text-gray-300"
          }`}
        />
      ))}
    </div>
  )
}

const ReviewItem = ({ review, onHelpfulnessVote, currentUserId }) => {
  const [votingLoading, setVotingLoading] = useState(false)

  const handleHelpfulnessVote = async (isHelpful) => {
    if (!currentUserId) {
      toast.error("Please login to vote on reviews")
      return
    }

    setVotingLoading(true)
    try {
      await onHelpfulnessVote(review.Id, isHelpful)
    } finally {
      setVotingLoading(false)
    }
  }

  return (
    <div className="bg-surface border border-gray-200 rounded-lg p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center mb-2">
            <h4 className="font-semibold text-primary mr-3">
              {review.reviewer_name_c || "Anonymous"}
            </h4>
            <StarRating rating={review.rating_c} size={14} />
          </div>
          <p className="text-sm text-secondary">
            {new Date(review.review_date_c).toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {review.review_text_c && (
        <p className="text-primary mb-4 leading-relaxed">
          {review.review_text_c}
        </p>
      )}
      
      <div className="flex items-center gap-4 text-sm">
        <span className="text-secondary">
          Was this helpful?
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleHelpfulnessVote(true)}
            disabled={votingLoading}
            className="text-secondary hover:text-success"
          >
            <ApperIcon name="ThumbsUp" size={14} className="mr-1" />
            Yes ({review.helpful_count || 0})
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleHelpfulnessVote(false)}
            disabled={votingLoading}
            className="text-secondary hover:text-error"
          >
            <ApperIcon name="ThumbsDown" size={14} className="mr-1" />
            No ({review.not_helpful_count || 0})
          </Button>
        </div>
      </div>
    </div>
  )
}

const ReviewForm = ({ productId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { user, isAuthenticated } = useSelector((state) => state.user)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isAuthenticated) {
      toast.error("Please login to write a review")
      return
    }

    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }

    if (!reviewText.trim()) {
      toast.error("Please write a review")
      return
    }

    setSubmitting(true)
    try {
      await reviewService.create({
        product_id_c: parseInt(productId),
        rating_c: rating,
        review_text_c: reviewText.trim(),
        reviewer_name_c: user.firstName + " " + user.lastName || "Anonymous",
        review_date_c: new Date().toISOString().split('T')[0]
      })

      toast.success("Review submitted successfully!")
      setRating(0)
      setReviewText("")
      onReviewSubmitted()
    } catch (error) {
      toast.error("Failed to submit review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="bg-surface border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-secondary mb-4">Please login to write a review</p>
        <Button onClick={() => window.location.href = "/login"}>
          Login to Review
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-primary mb-4">Write a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Rating *
          </label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="p-1 hover:scale-110 transition-transform"
              >
                <ApperIcon
                  name="Star"
                  size={24}
                  className={`${
                    star <= rating
                      ? "text-warning fill-warning"
                      : "text-gray-300 hover:text-warning"
                  }`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-secondary">
              {rating > 0 && `${rating} star${rating > 1 ? 's' : ''}`}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-2">
            Your Review *
          </label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Share your experience with this product..."
            disabled={submitting}
          />
        </div>

        <Button
          type="submit"
          disabled={submitting || rating === 0 || !reviewText.trim()}
          className="w-full"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Submitting Review...
            </>
          ) : (
            "Submit Review"
          )}
        </Button>
      </form>
    </div>
  )
}

const ReviewsSection = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortBy, setSortBy] = useState("recent")
  const { user } = useSelector((state) => state.user)

  const loadReviews = async () => {
    setLoading(true)
    setError(null)
    try {
      const [reviewsData, statsData] = await Promise.all([
        reviewService.getByProductId(parseInt(productId), sortBy),
        reviewService.getReviewStats(parseInt(productId))
      ])
      setReviews(reviewsData)
      setReviewStats(statsData)
    } catch (err) {
      setError("Failed to load reviews")
      console.error("Error loading reviews:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReviews()
  }, [productId, sortBy])

  const handleHelpfulnessVote = async (reviewId, isHelpful) => {
    try {
      await helpfulnessVoteService.vote(reviewId, isHelpful)
      toast.success("Thank you for your feedback!")
      await loadReviews() // Refresh to show updated counts
    } catch (error) {
      toast.error("Failed to record your vote")
    }
  }

  const handleReviewSubmitted = () => {
    loadReviews() // Refresh reviews after submission
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return <Error message={error} onRetry={loadReviews} />
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {reviewStats && (
        <div className="bg-surface border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary">Customer Reviews</h2>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <StarRating rating={reviewStats.averageRating} size={20} />
                <span className="text-lg font-semibold text-primary">
                  {reviewStats.averageRating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-secondary">
                Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Rating Breakdown */}
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviewStats.ratingBreakdown[stars] || 0
              const percentage = reviewStats.totalReviews > 0 
                ? (count / reviewStats.totalReviews) * 100 
                : 0
              
              return (
                <div key={stars} className="flex items-center gap-3 text-sm">
                  <span className="text-secondary w-12">
                    {stars} star{stars > 1 ? 's' : ''}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-warning h-2 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-secondary w-12 text-right">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sort Options */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-primary">Reviews</h3>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="rating_high">Highest Rating</option>
            <option value="rating_low">Lowest Rating</option>
          </select>
        </div>
      )}

      {/* Review Form */}
      <ReviewForm productId={productId} onReviewSubmitted={handleReviewSubmitted} />

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewItem
              key={review.Id}
              review={review}
              onHelpfulnessVote={handleHelpfulnessVote}
              currentUserId={user?.userId}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <ApperIcon name="MessageSquare" size={48} className="text-gray-300 mx-auto mb-4" />
          <p className="text-secondary">No reviews yet. Be the first to review this product!</p>
        </div>
      )}
    </div>
  )
}

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
const { addToCart } = useCart()
  const { isInWishlist, toggleWishlist, wishlistItems } = useWishlist()

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true)
      setError(null)
      try {
        const productData = await productService.getById(parseInt(id))
        setProduct(productData)
      } catch (err) {
        setError("Failed to load product details")
        console.error("Error loading product:", err)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProduct()
    }
  }, [id])

const handleAddToCart = () => {
    if (product && product.inStock) {
      addToCart(product)
    }
  }

  const handleWishlistToggle = () => {
    if (product) {
      toggleWishlist(product)
    }
  }

  const getWishlistSaveCount = () => {
    return wishlistItems.filter(item => item.Id === product?.Id).length > 0 ? 1 : 0
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Loading />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Error 
          message={error || "Product not found"} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
        Back
      </Button>

      {/* Product Info */}
      <div className="bg-surface rounded-lg shadow-card overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Product Image */}
          <div className="relative">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-96 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
            <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center hidden">
              <div className="text-center">
                <ApperIcon name="ImageOff" size={48} className="text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Image not available</p>
              </div>
            </div>
            {!product.inStock && (
              <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center">
                <span className="bg-surface text-primary px-4 py-2 rounded-full font-medium">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">
                {product.title}
              </h1>
              {product.averageRating > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <StarRating rating={product.averageRating} size={20} />
                  <span className="text-lg font-semibold text-primary">
                    {product.averageRating.toFixed(1)}
                  </span>
                  <span className="text-secondary">
                    ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                  </span>
                </div>
              )}
            </div>

            <div className="text-3xl font-bold text-primary">
              ${product.price.toFixed(2)}
            </div>

            <p className="text-secondary leading-relaxed">
              {product.description}
            </p>

<div className="flex items-center gap-2">
              <span className="font-medium text-primary">Category:</span>
              <span className="text-secondary">{product.category}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium text-primary">Availability:</span>
              <span className={`${product.inStock ? 'text-success' : 'text-error'}`}>
                {product.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1"
                size="lg"
              >
                <ApperIcon name="ShoppingCart" size={20} className="mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </Button>

              <HeartButton
                isInWishlist={isInWishlist(product.Id)}
                onClick={handleWishlistToggle}
                size={24}
                variant="outline"
                showCount={true}
                count={getWishlistSaveCount()}
                className="px-4 py-3 h-12"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewsSection productId={id} />
    </div>
  )
}

export default ProductDetail