import { useEffect, useState, useCallback } from "react";
import { getSellerReviews, replyToReview } from "../../services/reviewService";

export default function SellerReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [filterRating, setFilterRating] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    totalReviews: 0,
    avgRating: 0,
    ratingDistribution: [0, 0, 0, 0, 0]
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replying, setReplying] = useState(false);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSellerReviews({
        rating: filterRating !== "all" ? parseInt(filterRating) : undefined,
        status: filterStatus !== "all" ? filterStatus : undefined
      });
      setReviews(data.reviews || []);
      setStats(data.stats || {});
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [filterRating, filterStatus]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      alert("Please enter a reply");
      return;
    }

    setReplying(true);
    try {
      await replyToReview(reviewId, replyText);
      setReplyingTo(null);
      setReplyText("");
      await loadReviews();
    } catch (error) {
      console.error("Failed to post reply:", error);
      alert("Failed to post reply");
    } finally {
      setReplying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{ fontSize: "24px", color: "#666" }}>Loading...</div>
      </div>
    );
  }

  const renderStars = (rating) => {
    return (
      <span style={{ fontSize: "14px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} style={{ color: i < rating ? "#f59e0b" : "#d1d5db" }}>
            ★
          </span>
        ))}
      </span>
    );
  };

  const statCardStyle = {
    padding: "16px",
    background: "white",
    borderRadius: "8px",
    border: "1px solid #e5e7eb",
    textAlign: "center"
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "30px 20px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "30px", color: "#111827" }}>
        ⭐ Customer Reviews
      </h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "30px" }}>
        <div style={statCardStyle}>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Average Rating</div>
          <div style={{ fontSize: "28px", fontWeight: "600", color: "#111827" }}>
            {stats.avgRating?.toFixed(1) || "0.0"}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
            {stats.totalReviews} reviews
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "8px" }}>Total Reviews</div>
          <div style={{ fontSize: "28px", fontWeight: "600", color: "#111827" }}>
            {stats.totalReviews || 0}
          </div>
        </div>

        {[5, 4, 3, 2, 1].map((rating) => (
          <div key={rating} style={statCardStyle}>
            <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "6px" }}>
              {rating} ★
            </div>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>
              {stats.ratingDistribution?.[rating - 1] || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        <div>
          <label style={{ fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "6px" }}>
            Filter by Rating
          </label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: "13px", fontWeight: "500", display: "block", marginBottom: "6px" }}>
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #e5e7eb",
              borderRadius: "6px",
              fontSize: "14px"
            }}
          >
            <option value="all">All</option>
            <option value="pending">Pending Reply</option>
            <option value="replied">Replied</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: "grid", gap: "16px" }}>
        {reviews.length === 0 ? (
          <div style={{
            padding: "40px 20px",
            textAlign: "center",
            background: "white",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            color: "#6b7280"
          }}>
            No reviews yet
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "20px"
              }}
            >
              {/* Review Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
                    {review.customerName}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                    {new Date(review.date).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  {renderStars(review.rating)}
                  <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                    {review.productName}
                  </div>
                </div>
              </div>

              {/* Review Body */}
              <div style={{ marginBottom: "16px", lineHeight: "1.6", color: "#374151", fontSize: "14px" }}>
                {review.comment}
              </div>

              {/* Reply Section */}
              {review.reply ? (
                <div style={{
                  background: "#eff6ff",
                  borderLeft: "3px solid #1a56db",
                  padding: "12px",
                  borderRadius: "4px",
                  fontSize: "13px"
                }}>
                  <div style={{ fontWeight: "500", color: "#1a56db", marginBottom: "4px" }}>Your Reply:</div>
                  <div style={{ color: "#374151" }}>{review.reply}</div>
                </div>
              ) : (
                <div>
                  {replyingTo === review.id ? (
                    <div style={{ display: "grid", gap: "12px" }}>
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        style={{
                          width: "100%",
                          padding: "10px 12px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "6px",
                          fontSize: "14px",
                          minHeight: "80px",
                          resize: "vertical",
                          fontFamily: "'DM Sans', sans-serif"
                        }}
                      />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText("");
                          }}
                          style={{
                            padding: "8px 16px",
                            background: "#f3f4f6",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "500",
                            cursor: "pointer"
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReply(review.id)}
                          disabled={replying}
                          style={{
                            padding: "8px 16px",
                            background: replying ? "#9ca3af" : "#1a56db",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "13px",
                            fontWeight: "500",
                            cursor: replying ? "default" : "pointer"
                          }}
                        >
                          {replying ? "Posting..." : "Post Reply"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingTo(review.id)}
                      style={{
                        padding: "6px 12px",
                        background: "transparent",
                        color: "#1a56db",
                        border: "1px solid #1a56db",
                        borderRadius: "4px",
                        fontSize: "13px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      💬 Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
