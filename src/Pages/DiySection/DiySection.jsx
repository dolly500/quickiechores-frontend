
import sec2 from "../../assets/frontend_assets/sec2.webp";

const DIYSection = () => {
  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .diy-container {
              flex-direction: column;
              text-align: center;
              padding: 15px 10px;
            }
            .diy-text-container {
              padding: 7px;
            }
            .diy-title {
              font-size: 22px !important;
            }
            .diy-paragraph {
              font-size: 14px !important;
              line-height: 1.6 !important;
            }
            .diy-image {
              max-width: 90% !important;
            }
          }
        `}
      </style>

      <div className="diy-container" style={styles.container}>
        
        <div className="diy-text-container" style={styles.textContainer}>
          <h2 className="diy-title" style={styles.title}>Empower Your Home Projects</h2>
          <p className="diy-paragraph" style={styles.paragraph}>
            Take control of your space with confidence. Whether you’re assembling furniture, fixing 
            minor repairs, or enhancing your living area, our guides and tools make it simple for anyone 
            to achieve professional results — all on your own time.
          </p>
          <p className="diy-paragraph" style={styles.paragraph}>
            With easy-to-follow instructions and the right equipment, DIY becomes a rewarding experience 
            that brings creativity, independence, and a sense of accomplishment to your everyday life.
          </p>
        </div>
        <div className="diy-image-container" style={styles.imageContainer}>
          <img src={sec2} alt="DIY project" className="diy-image" style={styles.image} />
        </div>
      </div>
    </>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    backgroundColor: "#f7f9fa",
    padding: "40px 20px",
    gap: "20px",
  },
  imageContainer: {
    flex: "1 1 300px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: "100%",
    maxWidth: "500px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  textContainer: {
    flex: "1 1 400px",
    padding: "10px 20px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "500",
    color: "#004d40",
    marginBottom: "15px",
  },
  paragraph: {
    fontSize: "15px",
    lineHeight: "1.7",
    color: "#333",
    marginBottom: "15px",
  },
};

export default DIYSection;
