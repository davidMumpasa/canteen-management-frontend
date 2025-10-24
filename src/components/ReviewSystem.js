import React, { useState, useEffect } from "react";
import {
  Star,
  ThumbsUp,
  User,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { BASE_URL } from "../../config";

const ReviewSystem = () => {
  const [reviews, setReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Replace these with actual values from your app
  const userId = 1;
  const menuItemId = 1;
  const orderId = 1;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${BASE_URL}/reviews/product/${menuItemId}`);
      const data = await response.json();
      if (data.success) {
        setReviews(data.data);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (rating === 0) {
      setError("Please select a rating");
      setLoading(false);
      return;
    }

    if (!comment.trim()) {
      setError("Please write a review comment");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          menuItemId,
          orderId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Review submitted successfully!");
        setRating(0);
        setComment("");
        setShowReviewForm(false);
        fetchReviews();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to submit review");
      }
    } catch (err) {
      setError("Error submitting review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (reviewId) => {
    try {
      const response = await fetch(`${BASE_URL}/reviews/${reviewId}/upvote`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        fetchReviews();
      }
    } catch (err) {
      console.error("Error upvoting review:", err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const StarRating = ({ value, onHover, onClick, interactive = false }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={interactive ? 32 : 20}
            className={`${
              star <= (interactive ? hoverRating || value : value)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-300"
            } ${
              interactive ? "cursor-pointer transition-all hover:scale-110" : ""
            }`}
            onMouseEnter={() => interactive && onHover && onHover(star)}
            onMouseLeave={() => interactive && onHover && onHover(0)}
            onClick={() => interactive && onClick && onClick(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-3xl shadow-xl p-8 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
              Customer Reviews
            </h1>
            <p className="text-gray-600">
              Share your experience with this product
            </p>
          </div>
          <button
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
          >
            {showReviewForm ? "Cancel" : "Write Review"}
          </button>
        </div>

        {/* Average Rating Display */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-amber-600">
                {averageRating}
              </div>
              <StarRating value={Math.round(averageRating)} />
              <p className="text-gray-600 mt-2">{reviews.length} reviews</p>
            </div>
            <div className="flex-1">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter((r) => r.rating === stars).length;
                const percentage =
                  reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-medium w-12">
                      {stars} star
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-400 to-orange-400 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <CheckCircle className="text-green-600" size={24} />
          <p className="text-green-800 font-medium">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={24} />
          <p className="text-red-800 font-medium">{error}</p>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border-2 border-purple-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Write Your Review
          </h2>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Rate this product
              </label>
              <StarRating
                value={rating}
                onHover={setHoverRating}
                onClick={setRating}
                interactive={true}
              />
              {rating > 0 && (
                <p className="mt-2 text-gray-600 font-medium">
                  {rating === 5 && "⭐ Amazing!"}
                  {rating === 4 && "😊 Great!"}
                  {rating === 3 && "👍 Good"}
                  {rating === 2 && "😐 Fair"}
                  {rating === 1 && "😞 Poor"}
                </p>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-lg font-semibold text-gray-700 mb-3">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors resize-none"
                rows="6"
                placeholder="Share your thoughts about this product..."
              />
              <p className="text-sm text-gray-500 mt-2">
                {comment.length} characters
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
            <Star className="mx-auto mb-4 text-gray-300" size={64} />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              No reviews yet
            </h3>
            <p className="text-gray-600">
              Be the first to review this product!
            </p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-shadow p-6 border-2 border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {review.User?.profile_picture ||
                      review.User?.firstName?.[0] ||
                      "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {review.User?.firstName} {review.User?.surName}
                      </h3>
                      {review.isVerifiedPurchase && (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle size={14} />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <StarRating value={review.rating} />
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(review.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                {review.comment}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleUpvote(review.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors font-medium"
                >
                  <ThumbsUp size={18} />
                  <span>Helpful ({review.helpfulVotes || 0})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSystem;
