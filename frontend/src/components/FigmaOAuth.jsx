import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/constants";

const FigmaOAuth = ({ onConnected, onDisconnected }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Check if user already has an active connection
  useEffect(() => {
    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkConnection = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/figma/auth/verify`,
        {},
        { withCredentials: true }
      );

      if (response.data.connected) {
        setIsConnected(true);
        setUser(response.data.user);
        onConnected?.(response.data);
      } else {
        setIsConnected(false);
        setUser(null);
      }
    } catch (err) {
      console.log("Not connected to Figma");
      setIsConnected(false);
      setUser(null);
    }
  };

  const handleConnect = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the auth URL from backend
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/figma/auth/login`,
        { withCredentials: true }
      );

      // Redirect user to Figma OAuth
      window.location.href = response.data.auth_url;
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to initiate Figma OAuth login"
      );
      console.error("OAuth login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setLoading(true);
      setError(null);

      await axios.post(
        `${API_BASE_URL}/api/v1/figma/auth/disconnect`,
        {},
        { withCredentials: true }
      );

      setIsConnected(false);
      setUser(null);
      onDisconnected?.();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to disconnect from Figma");
      console.error("Disconnect error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="figma-oauth-container">
      <div className="figma-oauth-card">
        {!isConnected ? (
          <div className="oauth-disconnected">
            <div className="oauth-header">
              <h2>🎨 Connect Your Figma Account</h2>
              <p>Allow ARAI to analyze your Figma designs</p>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              className="btn btn-primary btn-lg"
              onClick={handleConnect}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-sm"></span> Connecting...
                </>
              ) : (
                <>🔗 Connect to Figma</>
              )}
            </button>

            <div className="oauth-info">
              <h3>Why connect your Figma account?</h3>
              <ul>
                <li>✅ Analyze your entire design projects</li>
                <li>✅ Check accessibility compliance</li>
                <li>✅ Measure readability scores</li>
                <li>✅ View attention heatmaps</li>
                <li>✅ No manual file uploads needed</li>
              </ul>
              <p className="privacy-note">
                <strong>🔒 Privacy:</strong> ARAI only accesses files you
                authorize and doesn't store your designs.
              </p>
            </div>
          </div>
        ) : (
          <div className="oauth-connected">
            <div className="oauth-header">
              <h2>✅ Connected to Figma</h2>
              <p>You're ready to analyze your designs</p>
            </div>

            <div className="user-info">
              <div className="user-badge">
                <span className="user-icon">👤</span>
                <span className="user-name">{user}</span>
              </div>
            </div>

            <div className="oauth-actions">
              <button
                className="btn btn-secondary"
                onClick={handleDisconnect}
                disabled={loading}
              >
                {loading ? "Disconnecting..." : "🔓 Disconnect"}
              </button>
            </div>

            <div className="oauth-tips">
              <h3>Next Steps:</h3>
              <ol>
                <li>Paste your Figma project URL in the analyzer</li>
                <li>Select frames/screens you want to analyze</li>
                <li>ARAI will run comprehensive analysis</li>
                <li>Review accessibility and readability reports</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .figma-oauth-container {
          padding: 20px;
          max-width: 600px;
          margin: 0 auto;
        }

        .figma-oauth-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 30px;
        }

        .oauth-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .oauth-header h2 {
          margin: 0 0 10px;
          color: #333;
          font-size: 24px;
        }

        .oauth-header p {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .alert-error {
          background-color: #fee;
          color: #c33;
          border: 1px solid #fcc;
        }

        .btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .btn-primary {
          background-color: #a259ff;
          color: white;
          width: 100%;
          justify-content: center;
          padding: 14px;
        }

        .btn-primary:hover:not(:disabled) {
          background-color: #9145e3;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(162, 89, 255, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-lg {
          font-size: 16px;
          padding: 16px 24px;
        }

        .btn-secondary {
          background-color: #f0f0f0;
          color: #333;
          width: 100%;
          justify-content: center;
          padding: 12px;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #e0e0e0;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-sm {
          display: inline-block;
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .oauth-info {
          background-color: #f9f9f9;
          border-left: 4px solid #a259ff;
          padding: 20px;
          border-radius: 6px;
          margin-top: 30px;
        }

        .oauth-info h3 {
          margin: 0 0 15px;
          color: #333;
          font-size: 16px;
        }

        .oauth-info ul {
          list-style: none;
          padding: 0;
          margin: 0 0 15px;
        }

        .oauth-info li {
          padding: 8px 0;
          color: #555;
          font-size: 14px;
        }

        .privacy-note {
          margin: 15px 0 0;
          padding: 12px;
          background-color: #f0f0ff;
          border-radius: 4px;
          font-size: 13px;
          color: #555;
        }

        .user-info {
          text-align: center;
          margin: 30px 0;
        }

        .user-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #f0f0f0;
          padding: 12px 20px;
          border-radius: 24px;
        }

        .user-icon {
          font-size: 20px;
        }

        .user-name {
          font-weight: 600;
          color: #333;
        }

        .oauth-actions {
          margin: 30px 0;
        }

        .oauth-tips {
          background-color: #f0f7ff;
          border-left: 4px solid #0066cc;
          padding: 20px;
          border-radius: 6px;
          margin-top: 30px;
        }

        .oauth-tips h3 {
          margin: 0 0 15px;
          color: #333;
          font-size: 16px;
        }

        .oauth-tips ol {
          margin: 0;
          padding-left: 20px;
          color: #555;
          font-size: 14px;
        }

        .oauth-tips li {
          padding: 6px 0;
        }
      `}</style>
    </div>
  );
};

export default FigmaOAuth;
