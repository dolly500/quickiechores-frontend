import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../../../src/assets/frontend_assets/Quickie_Chores-removebg-preview.png"
import baseUrl from "../../../server.js";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [view, setView] = useState("login"); // login, forgot, reset
  const [resetEmail, setResetEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${baseUrl}/api/auth/login-service`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (data.success) {
        setSuccess("Login successful!");
        
        localStorage.setItem("providerToken", data.token); 
        localStorage.setItem("providerId", data.provider.id);
        
        const providerData = {
          ...data.provider,
          role: data.provider.role || "serviceProvider"
        };
        localStorage.setItem("provider", JSON.stringify(providerData));
        
        navigate("/provider/dashboard", { replace: true });
        
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("OTP sent successfully to your email");
        setTimeout(() => {
          setView("reset");
          setSuccess("");
        }, 2000);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error("Forgot password error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: resetEmail,
          otp: otp,
          newPassword: newPassword
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          setView("login");
          setResetEmail("");
          setOtp("");
          setNewPassword("");
          setConfirmPassword("");
          setSuccess("");
        }, 2000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Something went wrong. Try again.");
      console.error("Reset password error:", err);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    },
    formWrapper: {
      borderRadius: '20px',
      padding: '40px',
      minWidth: '400px',
      maxWidth: '500px',
      width: '100%',
      position: 'relative',
      overflow: 'hidden'
    },
    title: {
      fontSize: '28px',
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: '30px',
      color: '#2d3748',
      letterSpacing: '-0.02em'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    inputGroup: {
      position: 'relative'
    },
    input: {
      width: '100%',
      padding: '16px 20px',
      fontSize: '16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      outline: 'none',
      transition: 'all 0.3s ease',
      backgroundColor: '#f8fafc',
      color: 'black',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: 'black',
      backgroundColor: '#ffffff',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
      transform: 'translateY(-2px)'
    },
    button: {
      width: '100%',
      padding: '8px',
      fontSize: '16px',
      fontWeight: '600',
      color: 'white',
      background: loading ? '#a0aec0' : 'rgb(78, 205, 196)',
      border: 'none',
      borderRadius: '12px',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '10px',
      position: 'relative',
      overflow: 'hidden'
    },
    buttonHover: {
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 25px rgba(102, 126, 234, 0.3)'
    },
    linkButton: {
      background: 'none',
      border: 'none',
      color: '#667eea',
      fontSize: '14px',
      cursor: 'pointer',
      textAlign: 'center',
      padding: '8px',
      textDecoration: 'none',
      marginTop: '5px'
    },
    backButton: {
      background: 'none',
      border: 'none',
      color: '#718096',
      fontSize: '14px',
      cursor: 'pointer',
      textAlign: 'center',
      padding: '8px',
      marginTop: '10px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px'
    },
    errorMsg: {
      padding: '12px 16px',
      backgroundColor: '#fed7d7',
      color: '#c53030',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid #feb2b2',
      textAlign: 'center'
    },
    successMsg: {
      padding: '12px 16px',
      backgroundColor: '#c6f6d5',
      color: '#22543d',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      border: '1px solid #9ae6b4',
      textAlign: 'center'
    },
    loadingSpinner: {
      display: 'inline-block',
      width: '20px',
      height: '20px',
      border: '2px solid #ffffff',
      borderRadius: '50%',
      borderTopColor: 'transparent',
      animation: 'spin 1s ease-in-out infinite',
      marginRight: '8px'
    }
  };

  const [focusedInput, setFocusedInput] = useState(null);
  const [isButtonHovered, setIsButtonHovered] = useState(false);

  return (
    <>
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={styles.container}>
        <div style={styles.formWrapper}>
          
          {view === "login" && (
            <form style={styles.form} onSubmit={handleSubmit}>
              <div style={{display: 'flex', margin: '0 auto'}}>
                <img src={Logo} alt="" width="185vw"/>
              </div>
              <h2 style={styles.title}>Quickie Helper Login</h2>

              {error && <div style={styles.errorMsg}>{error}</div>}
              {success && <div style={styles.successMsg}>{success}</div>}

              <div style={styles.inputGroup}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'email' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'password' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                style={{
                  ...styles.button,
                  ...(isButtonHovered && !loading ? styles.buttonHover : {})
                }}
              >
                {loading && <span style={styles.loadingSpinner}></span>}
                {loading ? "Signing In..." : "Sign In"}
              </button>

              <button
                type="button"
                onClick={() => setView("forgot")}
                style={styles.linkButton}
              >
                Forgot Password?
              </button>
            </form>
          )}

          {view === "forgot" && (
            <form style={styles.form} onSubmit={handleForgotPassword}>
              <div style={{display: 'flex', margin: '0 auto'}}>
                <img src={Logo} alt="" width="185vw"/>
              </div>
              <h2 style={styles.title}>Forgot Password</h2>
              <p style={{textAlign: 'center', color: '#718096', fontSize: '14px', marginTop: '-15px'}}>
                Enter your email to receive an OTP
              </p>

              {error && <div style={styles.errorMsg}>{error}</div>}
              {success && <div style={styles.successMsg}>{success}</div>}

              <div style={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  onFocus={() => setFocusedInput('resetEmail')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'resetEmail' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                style={{
                  ...styles.button,
                  ...(isButtonHovered && !loading ? styles.buttonHover : {})
                }}
              >
                {loading && <span style={styles.loadingSpinner}></span>}
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setError("");
                  setSuccess("");
                }}
                style={styles.backButton}
              >
                ← Back to Login
              </button>
            </form>
          )}

          {view === "reset" && (
            <form style={styles.form} onSubmit={handleResetPassword}>
              <div style={{display: 'flex', margin: '0 auto'}}>
                <img src={Logo} alt="" width="185vw"/>
              </div>
              <h2 style={styles.title}>Reset Password</h2>
              <p style={{textAlign: 'center', color: '#718096', fontSize: '14px', marginTop: '-15px'}}>
                Enter the OTP sent to {resetEmail}
              </p>

              {error && <div style={styles.errorMsg}>{error}</div>}
              {success && <div style={styles.successMsg}>{success}</div>}

              <div style={styles.inputGroup}>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  onFocus={() => setFocusedInput('otp')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'otp' ? styles.inputFocus : {})
                  }}
                  maxLength="6"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  onFocus={() => setFocusedInput('newPassword')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'newPassword' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <div style={styles.inputGroup}>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                  style={{
                    ...styles.input,
                    ...(focusedInput === 'confirmPassword' ? styles.inputFocus : {})
                  }}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                onMouseEnter={() => setIsButtonHovered(true)}
                onMouseLeave={() => setIsButtonHovered(false)}
                style={{
                  ...styles.button,
                  ...(isButtonHovered && !loading ? styles.buttonHover : {})
                }}
              >
                {loading && <span style={styles.loadingSpinner}></span>}
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setView("forgot");
                  setOtp("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setError("");
                  setSuccess("");
                }}
                style={styles.backButton}
              >
                ← Resend OTP
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default LoginPage;