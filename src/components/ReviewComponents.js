import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { BASE_URL } from "../../config";

// Review Modal Component
const ReviewModal = ({
  visible,
  onClose,
  userId,
  menuItemId,
  orderId,
  productId,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [scaleAnims] = useState(
    [1, 2, 3, 4, 5].map(() => new Animated.Value(1))
  );

  const animateStar = (index) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert(
        "Rating Required",
        "Please select a rating before submitting."
      );
      return;
    }

    if (!comment.trim()) {
      Alert.alert("Review Required", "Please write a review comment.");
      return;
    }

    if (comment.trim().length < 10) {
      Alert.alert("Review Too Short", "Please write at least 10 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BASE_URL}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          menuItemId,
          orderId: orderId || null,
          rating,
          comment: comment.trim(),
          productId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          "Success! 🎉",
          "Your review has been submitted successfully!"
        );
        setRating(0);
        setComment("");
        onReviewSubmitted && onReviewSubmitted();
        onClose();
      } else {
        Alert.alert("Error", data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Review submission error:", error);
      Alert.alert(
        "Error",
        "Failed to submit review. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const getRatingLabel = (stars) => {
    const labels = {
      1: "😞 Poor",
      2: "😐 Fair",
      3: "👍 Good",
      4: "😊 Great",
      5: "⭐ Amazing!",
    };
    return labels[stars] || "";
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl h-[90%]">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-6 pb-4 border-b border-slate-200">
              <Text className="text-slate-900 text-2xl font-bold">
                Write a Review
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
              >
                <Icon name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
            >
              {/* Rating Section */}
              <View className="py-8">
                <Text className="text-slate-900 text-xl font-bold mb-2">
                  How would you rate this product?
                </Text>
                <Text className="text-slate-500 text-sm mb-6">
                  Tap a star to rate
                </Text>
                <View className="flex-row justify-center mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => {
                        setRating(star);
                        animateStar(star - 1);
                      }}
                      className="mx-2"
                    >
                      <Animated.View
                        style={{
                          transform: [{ scale: scaleAnims[star - 1] }],
                        }}
                      >
                        <Icon
                          name={star <= rating ? "star" : "star-outline"}
                          size={48}
                          color={star <= rating ? "#F59E0B" : "#CBD5E1"}
                        />
                      </Animated.View>
                    </TouchableOpacity>
                  ))}
                </View>
                {rating > 0 && (
                  <View className="items-center">
                    <LinearGradient
                      colors={["#F59E0B", "#F97316"]}
                      className="px-6 py-3 rounded-full"
                    >
                      <Text className="text-white text-lg font-bold">
                        {getRatingLabel(rating)}
                      </Text>
                    </LinearGradient>
                  </View>
                )}
              </View>

              {/* Comment Section */}
              <View className="pb-6">
                <Text className="text-slate-900 text-xl font-bold mb-2">
                  Share your experience
                </Text>
                <Text className="text-slate-500 text-sm mb-4">
                  Tell us what you loved or what could be improved
                </Text>
                <View className="bg-slate-50 rounded-2xl border-2 border-slate-200 p-4">
                  <TextInput
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Share your thoughts about this product..."
                    placeholderTextColor="#94a3b8"
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                    className="text-slate-900 text-base leading-6"
                    style={{ minHeight: 150 }}
                    maxLength={500}
                  />
                </View>
                <View className="flex-row justify-between items-center mt-2">
                  <Text className="text-slate-500 text-sm">
                    {comment.length}/500 characters
                  </Text>
                  {comment.trim().length > 0 && comment.trim().length < 10 && (
                    <Text className="text-red-500 text-sm">
                      Minimum 10 characters
                    </Text>
                  )}
                </View>
              </View>

              {/* Guidelines */}
              <View className="bg-purple-50 rounded-2xl p-4 mb-6 border border-purple-200">
                <View className="flex-row items-center mb-2">
                  <Icon name="bulb" size={20} color="#8B5CF6" />
                  <Text className="text-purple-900 text-base font-semibold ml-2">
                    Review Guidelines
                  </Text>
                </View>
                <Text className="text-purple-700 text-sm leading-6">
                  • Be honest and constructive{"\n"}• Share specific details
                  about your experience{"\n"}• Keep it respectful and helpful
                  for others{"\n"}• Avoid personal information
                </Text>
              </View>
            </ScrollView>

            {/* Submit Button */}
            <View className="px-6 py-4 border-t border-slate-200 bg-white">
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading || rating === 0 || comment.trim().length < 10}
                className="rounded-2xl overflow-hidden"
              >
                <LinearGradient
                  colors={
                    loading || rating === 0 || comment.trim().length < 10
                      ? ["#94a3b8", "#64748b"]
                      : ["#8B5CF6", "#A855F7"]
                  }
                  className="py-4 items-center flex-row justify-center"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Icon name="checkmark-circle" size={24} color="#fff" />
                      <Text className="text-white text-lg font-bold ml-2">
                        Submit Review
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Reviews List Component
const ReviewsList = ({ reviews, onUpvote, loading }) => {
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

  if (loading) {
    return (
      <View className="py-12 items-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="text-slate-500 text-base mt-4">
          Loading reviews...
        </Text>
      </View>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <View className="bg-slate-100 rounded-2xl p-8 items-center">
        <Icon name="chatbubble-outline" size={64} color="#94a3b8" />
        <Text className="text-slate-700 text-xl font-bold mt-4 mb-2">
          No Reviews Yet
        </Text>
        <Text className="text-slate-500 text-center text-base">
          Be the first to share your experience!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {reviews.map((review) => (
        <View
          key={review.id}
          className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-slate-100"
        >
          {/* User Info */}
          <View className="flex-row items-start justify-between mb-3">
            <View className="flex-row items-start flex-1">
              <LinearGradient
                colors={["#8B5CF6", "#A855F7"]}
                className="w-12 h-12 rounded-full items-center justify-center mr-3"
              >
                {review.User?.profile_picture ? (
                  <Text className="text-2xl">
                    {review.User.profile_picture}
                  </Text>
                ) : (
                  <Text className="text-white text-lg font-bold">
                    {review.User?.firstName?.[0] || "U"}
                  </Text>
                )}
              </LinearGradient>
              <View className="flex-1">
                <View className="flex-row items-center flex-wrap mb-1">
                  <Text className="text-slate-900 text-base font-bold mr-2">
                    {review.User?.firstName} {review.User?.surName}
                  </Text>
                  {review.isVerifiedPurchase && (
                    <View className="bg-green-100 px-2 py-1 rounded-full flex-row items-center">
                      <Icon name="checkmark-circle" size={12} color="#10B981" />
                      <Text className="text-green-700 text-xs font-bold ml-1">
                        Verified
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-center">
                  <View className="flex-row mr-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name={star <= review.rating ? "star" : "star-outline"}
                        size={14}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                  <Text className="text-slate-500 text-xs">
                    {formatDate(review.createdAt)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Review Comment */}
          <Text className="text-slate-700 text-base leading-6 mb-3">
            {review.comment}
          </Text>

          {/* Actions */}
          <View className="flex-row items-center pt-3 border-t border-slate-100">
            <TouchableOpacity
              onPress={() => onUpvote(review.id)}
              className="flex-row items-center"
            >
              <LinearGradient
                colors={["#8B5CF6", "#A855F7"]}
                className="w-8 h-8 rounded-full items-center justify-center"
              >
                <Icon name="thumbs-up" size={16} color="#fff" />
              </LinearGradient>
              <Text className="text-slate-600 text-sm font-medium ml-2">
                Helpful ({review.helpfulVotes || 0})
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

// Enhanced Reviews Tab Component
export const EnhancedReviewsTab = ({
  item,
  reviews = [],
  userId,
  orderId,
  onReviewsUpdate,
}) => {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [localReviews, setLocalReviews] = useState(reviews);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [item.id]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/reviews/product/${item.id}`);
      const data = await response.json();
      if (data.success) {
        setLocalReviews(data.data);
        onReviewsUpdate && onReviewsUpdate(data.data);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
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
    } catch (error) {
      console.error("Error upvoting review:", error);
      Alert.alert("Error", "Failed to upvote review. Please try again.");
    }
  };

  const averageRating =
    localReviews.length > 0
      ? (
          localReviews.reduce((sum, r) => sum + r.rating, 0) /
          localReviews.length
        ).toFixed(1)
      : item.rating || 0;

  return (
    <View className="px-6 py-4">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-slate-900 text-2xl font-bold mb-3">
          ⭐ Customer Reviews
        </Text>

        {/* Rating Summary */}
        <LinearGradient
          colors={["#F59E0B", "#F97316"]}
          className="rounded-2xl p-6 mb-6 shadow-lg"
        >
          <View className="items-center">
            <Text className="text-white text-6xl font-bold mb-2">
              {averageRating}
            </Text>
            <View className="flex-row mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name={
                    star <= Math.floor(parseFloat(averageRating))
                      ? "star"
                      : "star-outline"
                  }
                  size={24}
                  color="#FCD34D"
                />
              ))}
            </View>
            <Text className="text-white text-lg font-medium opacity-90">
              Based on {localReviews.length}{" "}
              {localReviews.length === 1 ? "review" : "reviews"}
            </Text>
          </View>
        </LinearGradient>

        {/* Rating Distribution */}
        {localReviews.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm">
            <Text className="text-slate-900 text-lg font-bold mb-4">
              Rating Breakdown
            </Text>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = localReviews.filter(
                (r) => r.rating === stars
              ).length;
              const percentage =
                localReviews.length > 0
                  ? (count / localReviews.length) * 100
                  : 0;
              return (
                <View key={stars} className="flex-row items-center mb-3">
                  <Text className="text-slate-700 font-medium w-12">
                    {stars} ⭐
                  </Text>
                  <View className="flex-1 bg-slate-200 rounded-full h-3 mx-3 overflow-hidden">
                    <LinearGradient
                      colors={["#F59E0B", "#F97316"]}
                      className="h-full rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </View>
                  <Text className="text-slate-600 text-sm w-12 text-right">
                    {count}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Write Review Button */}
      <TouchableOpacity
        onPress={() => setShowReviewModal(true)}
        className="mb-6 rounded-2xl overflow-hidden shadow-lg"
      >
        <LinearGradient
          colors={["#8B5CF6", "#A855F7"]}
          className="py-4 items-center flex-row justify-center"
        >
          <Icon name="create" size={24} color="#fff" />
          <Text className="text-white text-lg font-bold ml-2">
            Write a Review
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Reviews List */}
      <ReviewsList
        reviews={localReviews}
        onUpvote={handleUpvote}
        loading={loading}
      />

      {/* Review Modal */}
      <ReviewModal
        visible={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        userId={userId}
        menuItemId={item.id}
        orderId={orderId}
        productId={productId}
        onReviewSubmitted={fetchReviews}
      />
    </View>
  );
};

export { ReviewModal, ReviewsList };
