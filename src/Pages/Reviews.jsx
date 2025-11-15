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
    name: "James W.",
    rating: 5,
    text: "Oliver arrived promptly and did a fantastic job mounting my TV and tidying up all the cables. The setup looks really neat now — couldn’t be happier with the result!",
    category: "Home Setup",
  },
  {
    name: "Sophie R.",
    rating: 4,
    text: "Amelia installed my ceiling fan and checked the electrical sockets around the room. She was friendly, efficient, and very professional. Would definitely recommend!",
    category: "Electrical Work",
  },
  {
    name: "Thomas B.",
    rating: 5,
    text: "Had a leaking kitchen tap which Jack fixed in no time. He explained everything clearly and even replaced a worn-out washer I hadn’t noticed. Brilliant service!",
    category: "Plumbing",
  },
  {
    name: "Charlotte L.",
    rating: 4.5,
    text: "Harry repainted my lounge and hallway beautifully. The finish is smooth and bright, and he even cleaned up afterwards. Such a lovely bloke — highly recommend!",
    category: "Painting",
  },
  {
    name: "Emily H.",
    rating: 5,
    text: "George helped assemble my new wardrobe and chest of drawers. He was organised, quick, and even helped shift some old furniture. Really pleased with the work!",
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
