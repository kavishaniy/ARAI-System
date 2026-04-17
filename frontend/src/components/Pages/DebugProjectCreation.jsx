import React, { useState, useEffect } from 'react';

const DebugProjectCreation = () => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load token and user from localStorage
    const storedToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');
    setToken(storedToken);
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, []);

  const testCreateProject = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      if (!token) {
        setTestResult({
          success: false,
          message: '❌ No authentication token found! You must log in first.',
        });
        return;
      }

      console.log('🧪 Testing project creation with token:', token.substring(0, 20) + '...');

      const response = await fetch('http://localhost:8000/api/v1/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: `Test Project ${Date.now()}`,
          description: 'This is a test project from the debug page',
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: '✅ Project created successfully!',
          data,
        });
      } else {
        setTestResult({
          success: false,
          message: `❌ API Error (${response.status}): ${data.detail || JSON.stringify(data)}`,
          data,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Network Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const testGetProjects = async () => {
    setLoading(true);
    setTestResult(null);

    try {
      if (!token) {
        setTestResult({
          success: false,
          message: '❌ No authentication token found! You must log in first.',
        });
        return;
      }

      console.log('🧪 Fetching projects...');

      const response = await fetch('http://localhost:8000/api/v1/projects', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: `✅ Found ${data.projects?.length || 0} projects`,
          data,
        });
      } else {
        setTestResult({
          success: false,
          message: `❌ API Error (${response.status}): ${data.detail || JSON.stringify(data)}`,
          data,
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Network Error: ${error.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const decodeToken = () => {
    if (!token) {
      setTestResult({
        success: false,
        message: '❌ No token to decode',
      });
      return;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        setTestResult({
          success: false,
          message: '❌ Invalid token format (not JWT)',
        });
        return;
      }

      const payload = JSON.parse(atob(parts[1]));
      const expiresAt = new Date(payload.exp * 1000);
      const expiresIn = (payload.exp * 1000 - Date.now()) / 1000 / 60;

      setTestResult({
        success: true,
        message: '✅ Token decoded successfully',
        data: {
          payload,
          expiresAt: expiresAt.toLocaleString(),
          expiresInMinutes: expiresIn.toFixed(2),
          isExpired: expiresIn < 0,
        },
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `❌ Failed to decode token: ${error.message}`,
      });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '800px' }}>
      <h1>🔍 Debug Project Creation</h1>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>Authentication Status</h2>
        <p>
          <strong>Token Present:</strong> {token ? '✅ Yes' : '❌ No'}
        </p>
        <p>
          <strong>User Logged In:</strong> {user ? `✅ Yes (${user.email})` : '❌ No'}
        </p>
        {token && (
          <p>
            <strong>Token Preview:</strong> {token.substring(0, 30)}...
          </p>
        )}
      </div>

      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={testGetProjects}
          disabled={loading || !token}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !token ? 'not-allowed' : 'pointer',
            opacity: loading || !token ? 0.5 : 1,
          }}
        >
          {loading ? 'Loading...' : 'Get Projects'}
        </button>

        <button
          onClick={testCreateProject}
          disabled={loading || !token}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || !token ? 'not-allowed' : 'pointer',
            opacity: loading || !token ? 0.5 : 1,
          }}
        >
          {loading ? 'Loading...' : 'Test Create Project'}
        </button>

        <button
          onClick={decodeToken}
          disabled={!token}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !token ? 'not-allowed' : 'pointer',
            opacity: !token ? 0.5 : 1,
          }}
        >
          Decode Token
        </button>
      </div>

      {testResult && (
        <div
          style={{
            padding: '15px',
            backgroundColor: testResult.success ? '#d4edda' : '#f8d7da',
            border: `1px solid ${testResult.success ? '#c3e6cb' : '#f5c6cb'}`,
            borderRadius: '4px',
            marginTop: '20px',
          }}
        >
          <p style={{ margin: '0 0 10px 0', fontSize: '16px' }}>
            {testResult.message}
          </p>
          {testResult.data && (
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Response Details
              </summary>
              <pre style={{ marginTop: '10px', backgroundColor: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
                {JSON.stringify(testResult.data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
        <h3>📝 Instructions</h3>
        <ol>
          <li>Make sure you're logged in (check "User Logged In" status above)</li>
          <li>Click "Get Projects" to see your current projects</li>
          <li>Click "Test Create Project" to create a new project</li>
          <li>Check the response below for any errors</li>
          <li>Click "Decode Token" to verify your token is valid</li>
        </ol>
      </div>
    </div>
  );
};

export default DebugProjectCreation;
