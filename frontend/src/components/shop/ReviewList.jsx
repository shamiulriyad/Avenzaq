export default function ReviewList({ reviews, loading, error }) {
  if (loading) {
    return <section className="card">Loading reviews...</section>;
  }

  if (error) {
    return <section className="card">{error}</section>;
  }

  if (!reviews.length) {
    return <section className="card">No reviews yet for this shop.</section>;
  }

  return (
    <section className="card">
      <h2>Reviews</h2>
      <div className="shop-review-list">
        {reviews.map((review) => (
          <article key={review.id} className="shop-review-item">
            <div className="shop-review-item__meta">
              <strong>{review.userName}</strong>
              <span>{new Date(review.createdAtUtc).toLocaleDateString()}</span>
            </div>
            <div className="shop-review-item__rating">Rating: {review.rating}/5</div>
            <p>{review.comment}</p>
            <small>Product: {review.productName}</small>
          </article>
        ))}
      </div>
    </section>
  );
}
