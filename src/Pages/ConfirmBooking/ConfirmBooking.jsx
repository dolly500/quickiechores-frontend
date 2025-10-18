// ConfirmBooking.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { StoreContext } from "../../Components/context/storeContext";

const ConfirmBooking = () => {
  const { bookingId } = useParams();
  const { token, url } = useContext(StoreContext);
  const navigate = useNavigate();
  const [message, setMessage] = useState("Confirming...");

  useEffect(() => {
    const confirm = async () => {
      try {
        const res = await fetch(`${url}/api/booking/provider/bookings/confirm`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookingId }),
        });
        const data = await res.json();
        if (data.success) {
          setMessage("Booking confirmed successfully!");
          setTimeout(() => navigate("/booking-history"), 2000);
        } else {
          setMessage(data.message || "Failed to confirm booking");
        }
      } catch (err) {
        setMessage("Error confirming booking");
      }
    };
    confirm();
  }, [bookingId, token, url, navigate]);

  return <div style={{ textAlign: "center", marginTop: "2rem" }}>{message}</div>;
};

export default ConfirmBooking;
