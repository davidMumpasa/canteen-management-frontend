import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { BASE_URL } from "../../config";

// View-Only Reviews Component
export const ViewOnlyReviews = ({ item, onReviewsUpdate }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item?.id) {
      fetchReviews();
    }
  }, [item?.id]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/reviews/product/${item.id}`);
      const data = await response.json();
      if (data.success && data.data) {
        setReviews(data.data);
        onReviewsUpdate && onReviewsUpdate(data.data);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
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
    } catch (error) {
      return "Recently";
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
        ).toFixed(1)
      : item.rating || "0.0";

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
              Based on {reviews.length}{" "}
              {reviews.length === 1 ? "review" : "reviews"}
            </Text>
          </View>
        </LinearGradient>

        {/* Rating Distribution */}
        {reviews.length > 0 && (
          <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-slate-100">
            <Text className="text-slate-900 text-lg font-bold mb-4">
              Rating Breakdown
            </Text>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              const percentage =
                reviews.length > 0 ? (count / reviews.length) * 100 : 0;
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

      {/* Reviews List */}
      {loading ? (
        <View className="py-12 items-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-slate-500 text-base mt-4">
            Loading reviews...
          </Text>
        </View>
      ) : reviews.length === 0 ? (
        <View className="bg-slate-100 rounded-2xl p-8 items-center">
          <Icon name="chatbubble-outline" size={64} color="#94a3b8" />
          <Text className="text-slate-700 text-xl font-bold mt-4 mb-2">
            No Reviews Yet
          </Text>
          <Text className="text-slate-500 text-center text-base">
            This product hasn't been reviewed yet.
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {reviews.map((review, index) => (
            <View
              key={review.id || index}
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
                        {review.User?.firstName || "Anonymous"}{" "}
                        {review.User?.surName || ""}
                      </Text>
                      {review.isVerifiedPurchase && (
                        <View className="bg-green-100 px-2 py-1 rounded-full flex-row items-center">
                          <Icon
                            name="checkmark-circle"
                            size={12}
                            color="#10B981"
                          />
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
                            name={
                              star <= (review.rating || 0)
                                ? "star"
                                : "star-outline"
                            }
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
                {review.comment || "No comment provided."}
              </Text>

              {/* Helpful Votes */}
              <View className="flex-row items-center pt-3 border-t border-slate-100">
                <View className="flex-row items-center">
                  <LinearGradient
                    colors={["#E0E7FF", "#C7D2FE"]}
                    className="w-8 h-8 rounded-full items-center justify-center"
                  >
                    <Icon name="thumbs-up" size={16} color="#6366F1" />
                  </LinearGradient>
                  <Text className="text-slate-600 text-sm font-medium ml-2">
                    {review.helpfulVotes || 0} found this helpful
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default ViewOnlyReviews;
