import { useEffect, useState } from "react";

export default function CustomerReviews() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle screen resize dynamically
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const reviews = [
    {
      name: "Daniel O.",
      rating: 5,
      text: "Emeka arrived right on time and did an amazing job mounting my TV and organizing the cables neatly. The setup looks super clean now — definitely exceeded my expectations!",
      category: "Home Setup",
    },
    {
      name: "Grace A.",
      rating: 4,
      text: "Tola installed my ceiling fan and helped check the electrical connections around the room. She was professional, quick, and very polite throughout. Highly recommended!",
      category: "Electrical Work",
    },
    {
      name: "Michael E.",
      rating: 5,
      text: "Had a leaking kitchen tap that Emeka fixed in under an hour. He explained the issue clearly and even replaced a faulty hose I didn’t know about. Great service overall!",
      category: "Plumbing",
    },
    {
      name: "Ngozi C.",
      rating: 4.5,
      text: "Olu repainted my living room and corridor beautifully. The finish looks so smooth and bright. He cleaned up afterward and was super friendly too. Will definitely call him again!",
      category: "Painting",
    },
    {
      name: "Rebecca T.",
      rating: 5,
      text: "Samuel helped assemble my new wardrobe and dresser. Everything was done neatly and much faster than expected. He even helped move some old furniture. Really satisfied!",
      category: "Furniture Assembly",
    },
  ];

  const Star = () => <span style={styles.star}>★</span>;

  return (
    <div
      style={{
        ...styles.container,
        padding: isMobile ? "40px 15px" : "60px 20px",
      }}
    >
      <h1
        style={{
          ...styles.heading,
          fontSize: isMobile ? "22px" : "30px",
          textAlign: isMobile ? "center" : "left",
        }}
      >
        See what happy customers are saying about QuickieChores
      </h1>

      <div
        style={{
          ...styles.reviewsGrid,
          gridTemplateColumns: isMobile
            ? "1fr"
            : "repeat(auto-fit, minmax(450px, 1fr))",
          gap: isMobile ? "15px" : "20px",
        }}
      >
        {reviews.map((review, index) => (
          <div
            key={index}
            style={{
              ...styles.reviewCard,
              padding: isMobile ? "15px" : "0",
              borderBottom: isMobile ? "1px solid #eaeaea" : "none",
            }}
          >
            <div style={styles.reviewHeader}>
              <h3
                style={{
                  ...styles.reviewerName,
                  fontSize: isMobile ? "14px" : "15px",
                }}
              >
                {review.name}
              </h3>
              <div style={styles.stars}>
                {[...Array(Math.floor(review.rating))].map((_, i) => (
                  <Star key={i} />
                ))}
              </div>
            </div>

            <p
              style={{
                ...styles.reviewText,
                fontSize: isMobile ? "14px" : "16px",
              }}
            >
              {review.text}
            </p>
            <p
              style={{
                ...styles.category,
                fontSize: isMobile ? "14px" : "16px",
              }}
            >
              {review.category}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    backgroundColor: "#fff",
    position: "relative",
    marginTop: "-3rem",
  },
  heading: {
    fontWeight: "500",
    color: "#1a1a1a",
    marginBottom: "30px",
    lineHeight: "1.3",
    maxWidth: "900px",
  },
  reviewsGrid: {
    display: "grid",
    gap: "20px",
    marginBottom: "25px",
  },
  reviewCard: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  reviewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  reviewerName: {
    fontWeight: "600",
    color: "#1a1a1a",
    margin: "0",
  },
  stars: {
    display: "flex",
    gap: "2px",
  },
  star: {
    color: "#ffc107",
    fontSize: "18px",
  },
  reviewText: {
    lineHeight: "1.6",
    color: "#333",
    margin: "0",
  },
  category: {
    fontWeight: "600",
    color: "#118a7e",
    margin: "0",
  },
};
