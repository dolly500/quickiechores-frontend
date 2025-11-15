import { useState } from 'react';
import baseUrl from '../../../server.js';

const ReviewForm = ({ bookingId }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    console.log({ bookingId, rating, review });

    try {
      const response = await fetch(`${baseUrl}/api/booking/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          review,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setMessage(result.message);
        setRating(0);
        setReview('');
      } else {
        setMessage('Failed to submit review. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Submit Your Review</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.ratingContainer}>
          <label style={styles.label}>Rating:</label>
          <div style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={rating >= star ? styles.starActive : styles.star}
                onClick={() => setRating(star)}
              >
                ★
              </span>
            ))}
          </div>
        </div>
        <div style={styles.reviewContainer}>
          <label style={styles.label}>Review:</label>
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            style={styles.textarea}
            placeholder="Write your review here..."
            required
          />
        </div>
        <button
          type="submit"
          style={isSubmitting ? styles.buttonDisabled : styles.button}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        {message && <p style={styles.message}>{message}</p>}
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '24px',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  ratingContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  stars: {
    display: 'flex',
    gap: '5px',
    fontSize: '24px',
    cursor: 'pointer',
  },
  star: {
    color: '#ccc',
  },
  starActive: {
    color: '#f5c518',
  },
  reviewContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  textarea: {
    width: '100%',
    minHeight: '100px',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#4ecdc4',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  buttonDisabled: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#ccc',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'not-allowed',
  },
  message: {
    textAlign: 'center',
    color: '#333',
    fontSize: '16px',
    marginTop: '10px',
  },
  '@media (max-width: 600px)': {
    container: {
      padding: '15px',
    },
    title: {
      fontSize: '20px',
    },
    textarea: {
      fontSize: '14px',
    },
    button: {
      fontSize: '14px',
    },
    buttonDisabled: {
      fontSize: '14px',
    },
  },
};

export default ReviewForm;