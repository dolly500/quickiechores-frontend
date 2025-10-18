import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import baseUrl from "../../server.js";

const ProviderChat = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [providerId, setProviderId] = useState(null);
  const [providerName, setProviderName] = useState("");
  const [isAdminOnline, setIsAdminOnline] = useState(false);
  const [activeChat, setActiveChat] = useState("system");
  const navigate = useNavigate();

  useEffect(() => {
    if (!providerId || loading) return;

    const fetchHistory = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/chat/${providerId}/system`);
        const data = await res.json();
        setMessages(
          data.messages.map(m => ({
            ...m,
            isOwn: m.senderId === providerId
          }))
        );
      } catch (err) {
        console.error("Error loading chat history:", err);
      }
    };

    fetchHistory();
  }, [providerId, loading]);

  const getProviderIdFromToken = (token) => {
    try {
      if (!token || typeof token !== 'string' || !token.includes('.')) {
        throw new Error('Invalid token format');
      }
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const tokenData = JSON.parse(decodedPayload);
      return tokenData.id || tokenData.providerId || tokenData.userId || tokenData.sub;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      return true;
    }
  };

  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem("providerToken");
        const storedProvider = JSON.parse(localStorage.getItem("provider") || '{}');

        if (storedProvider.id && storedProvider.name) {
          setProviderId(storedProvider.id);
          setProviderName(storedProvider.name);
        }

        if (!token || token.split('.').length !== 3) {
          setError("Invalid token. Please login again.");
          localStorage.removeItem("providerToken");
          localStorage.removeItem("providerId");
          localStorage.removeItem("provider");
          navigate('/login', { replace: true });
          return;
        }

        if (isTokenExpired(token)) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("providerToken");
          localStorage.removeItem("providerId");
          localStorage.removeItem("provider");
          navigate('/login', { replace: true });
          return;
        }

        const extractedProviderId = storedProvider.id || localStorage.getItem("providerId") || getProviderIdFromToken(token);
        const extractedProviderName = storedProvider.name || "Provider";

        if (!extractedProviderId) {
          setError("Provider ID not found. Please login again.");
          navigate('/login', { replace: true });
          return;
        }

        setProviderId(extractedProviderId);
        setProviderName(extractedProviderName);
        setLoading(false);
      } catch (err) {
        console.error("Error initializing authentication:", err);
        setError(err.message);
        setLoading(false);
        navigate('/login', { replace: true });
      }
    };

    initializeAuth();
  }, [navigate]);

  useEffect(() => {
    if (!providerId || loading) return;

    const socketConnection = io(baseUrl, {
      auth: {
        token: localStorage.getItem("providerToken")
      }
    });

    setSocket(socketConnection);

    socketConnection.emit("register", { userId: providerId });

    socketConnection.on("receive_message", ({ senderId, text, timestamp }) => {
      setMessages((prev) => [...prev, { 
        sender: senderId, 
        text, 
        timestamp: timestamp || new Date().toISOString(),
        isOwn: false 
      }]);
    });

    socketConnection.on("user_online", ({ userId }) => {
      if (userId === "system") {
        setIsAdminOnline(true);
      }
    });

    socketConnection.on("user_offline", ({ userId }) => {
      if (userId === "system") {
        setIsAdminOnline(false);
      }
    });

    socketConnection.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setError("Failed to connect to chat service");
    });

    socketConnection.on("auth_error", (error) => {
      console.error("Socket auth error:", error);
      setError("Authentication failed. Please login again.");
      localStorage.removeItem("providerToken");
      localStorage.removeItem("providerId");
      localStorage.removeItem("provider");
      navigate('/login', { replace: true });
    });

    return () => {
      if (socketConnection) {
        socketConnection.off("receive_message");
        socketConnection.off("user_online");
        socketConnection.off("user_offline");
        socketConnection.off("connect_error");
        socketConnection.off("auth_error");
        socketConnection.disconnect();
      }
    };
  }, [providerId, loading, navigate]);

  const sendMessage = () => {
    if (!text.trim() || !socket || !providerId) return;

    const messageData = {
      senderId: providerId,
      receiverId: "system",
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    socket.emit("send_message", messageData);
    setMessages((prev) => [...prev, { ...messageData, isOwn: true }]);
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLastMessage = () => {
    return messages[messages.length - 1];
  };

  if (loading) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#f8f9fa"
      }}>
        <div style={{
          width: "2.5rem",
          height: "2.5rem",
          border: "4px solid #e2e8f0",
          borderTop: "4px solid #667eea",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          marginBottom: "1rem"
        }}></div>
        <p style={{ color: "#718096", fontSize: "1rem" }}>Connecting to chat...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        backgroundColor: "#f8f9fa",
        color: "#e53e3e",
        padding: "1rem"
      }}>
        <h2 style={{ marginBottom: "0.5rem", fontSize: "1.5rem" }}>Chat Connection Error</h2>
        <p style={{ marginBottom: "1rem", fontSize: "1rem" }}>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#667eea",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "0.875rem",
            fontWeight: "500"
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      backgroundColor: "#f8f9fa"
    }}>
      <style>
        {`
          :root {
            --primary-color: #667eea;
            --success-color: #38a169;
            --danger-color: #e53e3e;
            --text-color: #2d3748;
            --text-muted: #718096;
            --bg-color: #fff;
            --card-bg: #ffffff;
            --border-color: #e2e8f0;
            --hover-color: #edf2f7;
            --online-color: #38a169;
            --offline-color: #cbd5e0;
          }

          .scrollbar {
            scrollbar-width: thin;
            scrollbar-color: #c1c1c1 #f1f1f1;
          }

          .scrollbar::-webkit-scrollbar {
            width: 6px;
          }

          .scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }

          .scrollbar::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 10px;
          }

          .scrollbar::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .message-enter {
            animation: fadeIn 0.3s ease-out;
          }

          @media (max-width: 768px) {
            .sidebar {
              width: 100% !important;
              border-right: none !important;
              border-bottom: 1px solid var(--border-color);
            }
            .chat-container {
              flex-direction: column !important;
            }
            .chat-area {
              width: 100% !important;
            }
            .message-container {
              max-width: 85% !important;
            }
            .input-container {
              flex-direction: row;
              gap: 0.5rem;
            }
            .message-input {
              flex: 3;
              min-width: 0;
            }
            .send-button {
              flex: 1;
              padding: 0.75rem 1rem !important;
              min-width: 80px;
            }
          }

          @media (max-width: 480px) {
            .sidebar-header h2 {
              font-size: 1.25rem !important;
            }
            .sidebar-header p {
              font-size: 0.75rem !important;
            }
            .admin-contact div {
              font-size: 0.875rem !important;
            }
            .chat-header h3 {
              font-size: 1.25rem !important;
            }
            .chat-header p {
              font-size: 0.875rem !important;
            }
            .message-container {
              padding: 0.75rem 1rem !important;
              font-size: 0.875rem !important;
            }
            .message-timestamp {
              font-size: 0.625rem !important;
            }
            .message-input {
              padding: 0.875rem 1rem !important;
              font-size: 0.9375rem !important;
            }
            .send-button {
              padding: 0.875rem 1rem !important;
              font-size: 0.9375rem !important;
            }
          }
        `}
      </style>

      <div style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        overflow: "hidden"
      }} className="chat-container">
        {/* Sidebar */}
        <div style={{
          width: "300px",
          backgroundColor: "var(--card-bg)",
          borderRight: "1px solid var(--border-color)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "2px 0 4px rgba(0,0,0,0.1)",
          flexShrink: 0
        }} className="sidebar">
          <div style={{
            padding: "1.25rem",
            borderBottom: "1px solid var(--border-color)",
            backgroundColor: "var(--primary-color)",
            color: "white"
          }} className="sidebar-header">
            <h2 style={{ margin: "0 0 0.3125rem 0", fontSize: "1.125rem", fontWeight: "600" }}>
              Support Chat
            </h2>
            <p style={{ margin: 0, fontSize: "0.8125rem", opacity: 0.9 }}>
              {providerName}
            </p>
          </div>

          <div style={{ padding: "0.9375rem" }} className="admin-contact">
            <div
              onClick={() => setActiveChat("system")}
              style={{
                padding: "0.9375rem",
                borderRadius: "0.75rem",
                backgroundColor: activeChat === "system" ? "var(--primary-color)" : "transparent",
                color: activeChat === "system" ? "white" : "var(--text-color)",
                cursor: "pointer",
                transition: "all 0.2s ease",
                border: activeChat === "system" ? "2px solid var(--primary-color)" : "2px solid transparent"
              }}
              onMouseEnter={(e) => {
                if (activeChat !== "system") {
                  e.target.style.backgroundColor = "var(--hover-color)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeChat !== "system") {
                  e.target.style.backgroundColor = "transparent";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", marginBottom: "0.5rem" }}>
                <div style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "50%",
                  backgroundColor: activeChat === "system" ? "rgba(255,255,255,0.2)" : "var(--primary-color)",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1rem",
                  fontWeight: "600",
                  marginRight: "0.75rem",
                  position: "relative"
                }}>
                  A
                  <div style={{
                    position: "absolute",
                    bottom: "-2px",
                    right: "-2px",
                    width: "0.75rem",
                    height: "0.75rem",
                    borderRadius: "50%",
                    backgroundColor: isAdminOnline ? "var(--online-color)" : "var(--offline-color)",
                    border: "2px solid white"
                  }}></div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontWeight: "600",
                    fontSize: "0.9375rem",
                    marginBottom: "0.125rem"
                  }}>
                    Admin Support
                  </div>
                  <div style={{
                    fontSize: "0.75rem",
                    opacity: activeChat === "system" ? 0.9 : 0.7
                  }}>
                    {isAdminOnline ? "Online" : "Offline"}
                  </div>
                </div>
              </div>
              {getLastMessage() && (
                <div style={{
                  fontSize: "0.75rem",
                  opacity: 0.8,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  paddingLeft: "3.25rem"
                }}>
                  {getLastMessage().isOwn ? "You: " : "Admin: "}{getLastMessage().text}
                </div>
              )}
            </div>
          </div>

          <div style={{
            padding: "0.9375rem",
            marginTop: "auto",
            borderTop: "1px solid var(--border-color)",
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            textAlign: "center"
          }}>
            Need help? Chat with our admin support team for assistance with your account and bookings.
          </div>
        </div>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--card-bg)"
        }} className="chat-area">
          {activeChat === "system" ? (
            <>
              <div style={{
                padding: "1.25rem",
                borderBottom: "1px solid var(--border-color)",
                backgroundColor: "var(--card-bg)",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
              }} className="chat-header">
                <div style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    width: "2.8125rem",
                    height: "2.8125rem",
                    borderRadius: "50%",
                    backgroundColor: "var(--primary-color)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    marginRight: "0.9375rem",
                    position: "relative"
                  }}>
                    A
                    <div style={{
                      position: "absolute",
                      bottom: "0",
                      right: "0",
                      width: "0.875rem",
                      height: "0.875rem",
                      borderRadius: "50%",
                      backgroundColor: isAdminOnline ? "var(--online-color)" : "var(--offline-color)",
                      border: "3px solid white"
                    }}></div>
                  </div>
                  <div>
                    <h3 style={{ margin: "0 0 0.3125rem 0", fontSize: "1.125rem", fontWeight: "600" }}>
                      Admin Support
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-muted)" }}>
                      {isAdminOnline ? "Online" : "Offline"} • Always here to help
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.25rem",
                backgroundColor: "#f8f9fa"
              }}
              className="scrollbar">
                {messages.length === 0 ? (
                  <div style={{
                    textAlign: "center",
                    color: "var(--text-muted)",
                    marginTop: "3.125rem"
                  }}>
                    <div style={{
                      fontSize: "3rem",
                      marginBottom: "1.25rem",
                      opacity: 0.3
                    }}>💬</div>
                    <h4 style={{ margin: "0 0 0.625rem 0", fontSize: "1.125rem" }}>Welcome to Support Chat</h4>
                    <p>Need help? Start a conversation with our admin support team!</p>
                  </div>
                ) : (
                  messages.map((message, i) => (
                    <div key={i} style={{
                      marginBottom: "1.25rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: message.isOwn ? "flex-end" : "flex-start"
                    }}
                    className="message-enter">
                      <div style={{
                        maxWidth: "70%",
                        padding: "0.75rem 1.125rem",
                        borderRadius: "1.25rem",
                        backgroundColor: message.isOwn ? "var(--primary-color)" : "white",
                        color: message.isOwn ? "white" : "var(--text-color)",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        position: "relative"
                      }} className="message-container">
                        <div style={{
                          fontSize: "0.75rem",
                          opacity: 0.8,
                          marginBottom: "0.3125rem",
                          fontWeight: "600"
                        }}>
                          {message.sender === "system" ? "Admin" : "You"}
                        </div>
                        <div style={{ lineHeight: "1.4" }}>{message.text}</div>
                        {message.timestamp && (
                          <div style={{
                            fontSize: "0.6875rem",
                            opacity: 0.7,
                            marginTop: "0.3125rem",
                            textAlign: "right"
                          }} className="message-timestamp">
                            {formatTimestamp(message.timestamp)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div style={{
                padding: "1.25rem",
                borderTop: "1px solid var(--border-color)",
                backgroundColor: "var(--card-bg)"
              }} className="input-container">
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message to admin..."
                    style={{
                      flex: 1,
                      padding: "0.75rem 1.25rem",
                      border: "1px solid var(--border-color)",
                      borderRadius: "1.5625rem",
                      fontSize: "0.875rem",
                      outline: "none",
                      transition: "border-color 0.2s"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "var(--primary-color)"}
                    onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
                    disabled={!socket}
                    className="message-input"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!text.trim() || !socket}
                    style={{
                      padding: "0.75rem 1.5rem",
                      backgroundColor: text.trim() && socket ? "var(--primary-color)" : "var(--text-muted)",
                      color: "white",
                      border: "none",
                      borderRadius: "1.5625rem",
                      cursor: text.trim() && socket ? "pointer" : "not-allowed",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      transition: "all 0.2s"
                    }}
                    className="send-button"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "var(--text-muted)"
            }}>
              <div style={{
                fontSize: "4rem",
                marginBottom: "1.25rem",
                opacity: 0.3
              }}>💬</div>
              <h3 style={{ margin: "0 0 0.625rem 0", fontSize: "1.25rem" }}>Support Chat</h3>
              <p style={{ margin: 0, fontSize: "1rem" }}>Click on Admin Support to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderChat;