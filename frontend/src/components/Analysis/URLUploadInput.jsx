import React, { useState } from 'react';
import { AlertCircle, Zap, Link as LinkIcon } from 'lucide-react';

const css = `
.url-upload-container {
  max-width: 900px;
  margin: 0 auto;
}

.upload-header {
  text-align: center;
  margin-bottom: 3rem;
}

.upload-header h1 {
  font-family: 'DM Serif Display', serif;
  font-size: 2.5rem;
  color: #0f2557;
  margin-bottom: 0.5rem;
  font-weight: 400;
}

.upload-header p {
  font-size: 1rem;
  color: rgba(15, 37, 87, 0.6);
  line-height: 1.6;
}

.upload-form-card {
  background: white;
  border: 1.5px solid rgba(15, 37, 87, 0.15);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 10px 40px rgba(15, 37, 87, 0.08);
  margin-bottom: 2rem;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 1rem;
  font-weight: 600;
  color: #0f2557;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-label .required {
  color: #ef4444;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  font-size: 0.95rem;
  border: 1.5px solid rgba(15, 37, 87, 0.15);
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
  background: #fafbfc;
}

.form-input:focus {
  outline: none;
  border-color: rgba(15, 37, 87, 0.4);
  background: white;
  box-shadow: 0 0 0 3px rgba(15, 37, 87, 0.08);
}

.form-input::placeholder {
  color: rgba(15, 37, 87, 0.4);
}

.form-help {
  font-size: 0.85rem;
  color: rgba(15, 37, 87, 0.6);
  margin-top: 0.5rem;
  line-height: 1.5;
}

.upload-methods {
  background: linear-gradient(135deg, rgba(15, 37, 87, 0.05), rgba(100, 200, 255, 0.05));
  border: 1.5px solid rgba(100, 180, 255, 0.2);
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.methods-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 1rem;
}

.methods-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f2557;
}

.method-note {
  font-size: 0.9rem;
  color: rgba(15, 37, 87, 0.6);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.method-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.method-tab {
  flex: 1;
  padding: 1rem;
  border: 1.5px solid rgba(15, 37, 87, 0.2);
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  font-weight: 500;
  color: rgba(15, 37, 87, 0.6);
}

.method-tab:hover {
  border-color: rgba(15, 37, 87, 0.4);
  background: rgba(15, 37, 87, 0.02);
}

.method-tab.active {
  background: linear-gradient(135deg, #0f2557, #091840);
  color: white;
  border-color: #0f2557;
}

.method-content {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  font-size: 0.9rem;
  color: rgba(15, 37, 87, 0.7);
  line-height: 1.7;
}

.method-content ol {
  padding-left: 1.5rem;
}

.method-content li {
  margin-bottom: 0.75rem;
}

.method-content strong {
  color: #0f2557;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 2rem;
}

.submit-button {
  flex: 1;
  padding: 14px 24px;
  background: linear-gradient(135deg, #0f2557, #091840);
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(15, 37, 87, 0.25);
}

.submit-button:active {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.cancel-button {
  padding: 14px 24px;
  background: transparent;
  color: #0f2557;
  border: 1.5px solid rgba(15, 37, 87, 0.2);
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background: rgba(15, 37, 87, 0.05);
  border-color: rgba(15, 37, 87, 0.3);
}

.error-message {
  background: #fee2e2;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  padding: 1rem;
  color: #991b1b;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-message svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.info-box {
  background: rgba(100, 180, 255, 0.08);
  border: 1.5px solid rgba(100, 180, 255, 0.2);
  border-radius: 10px;
  padding: 1.5rem;
  margin-top: 2rem;
}

.info-box h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f2557;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-box ul {
  list-style: none;
  padding: 0;
}

.info-box li {
  font-size: 0.9rem;
  color: rgba(15, 37, 87, 0.7);
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
}

.info-box li:before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
}

.url-input-hint {
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: #92400e;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .upload-form-card {
    padding: 1.5rem;
  }

  .upload-header h1 {
    font-size: 1.8rem;
  }

  .button-group {
    flex-direction: column;
  }

  .method-tabs {
    flex-direction: column;
  }
}
`;

const URLUploadInput = ({ onProjectSubmit }) => {
  const [formData, setFormData] = useState({
    imageUrl: '',
    frameName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMethod, setActiveMethod] = useState('url');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateInputs = () => {
    if (!formData.imageUrl.trim()) {
      setError('Please enter a URL to the design image');
      return false;
    }

    // Basic URL validation
    try {
      new URL(formData.imageUrl);
    } catch {
      setError('Please enter a valid URL (must start with http:// or https://)');
      return false;
    }

    if (!formData.frameName.trim()) {
      setError('Please give this frame a name');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateInputs()) {
      setLoading(false);
      return;
    }

    try {
      console.log('📤 Submitting design image URL:');
      console.log('  URL:', formData.imageUrl);
      console.log('  Frame Name:', formData.frameName);

      onProjectSubmit({
        imageUrl: formData.imageUrl,
        frameName: formData.frameName,
        type: 'url_upload',
      });
    } catch (err) {
      setError(err.message || 'Failed to process URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="url-upload-container">
        <div className="upload-header">
          <h1>Analyze Design Image</h1>
          <p>
            Upload a design image URL and analyze it for accessibility,
            readability, and visual attention patterns
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          <div className="upload-form-card">
            <div className="upload-methods">
              <div className="methods-header">
                <LinkIcon size={20} />
                <h3>How to Get a Design Image URL</h3>
              </div>
              <p className="method-note">
                Choose any method below to get a URL to your design image
              </p>

              <div className="method-tabs">
                <div
                  className={`method-tab ${activeMethod === 'url' ? 'active' : ''}`}
                  onClick={() => setActiveMethod('url')}
                >
                  Direct URL
                </div>
                <div
                  className={`method-tab ${activeMethod === 'figma' ? 'active' : ''}`}
                  onClick={() => setActiveMethod('figma')}
                >
                  From Figma
                </div>
                <div
                  className={`method-tab ${activeMethod === 'other' ? 'active' : ''}`}
                  onClick={() => setActiveMethod('other')}
                >
                  From Other Tools
                </div>
              </div>

              <div className="method-content">
                {activeMethod === 'url' && (
                  <div>
                    <strong>If you already have a design image online:</strong>
                    <ol>
                      <li>Find your design image (PNG, JPG, etc.)</li>
                      <li>Right-click the image → "Copy image link"</li>
                      <li>Paste the link in the URL field below</li>
                      <li>Make sure the URL starts with http:// or https://</li>
                    </ol>
                  </div>
                )}

                {activeMethod === 'figma' && (
                  <div>
                    <strong>To export a design frame from Figma:</strong>
                    <ol>
                      <li>Open your Figma project</li>
                      <li>Select a frame in the left panel</li>
                      <li>Right-click → "Copy/paste as" → "Copy as PNG"</li>
                      <li>Upload to an image hosting service (imgur, imgbb, etc.)</li>
                      <li>Copy the image URL and paste below</li>
                    </ol>
                    <div className="url-input-hint" style={{ marginTop: '1rem' }}>
                      💡 <strong>Tip:</strong> You can also use Figma's export feature. Select
                      frame → right panel → "Export" → PNG → then upload to a hosting service
                    </div>
                  </div>
                )}

                {activeMethod === 'other' && (
                  <div>
                    <strong>From Adobe XD, Sketch, or other design tools:</strong>
                    <ol>
                      <li>Export your design as PNG or JPG</li>
                      <li>Upload to an image hosting service:</li>
                      <li style={{ marginLeft: '1.5rem' }}>
                        • <strong>Free options:</strong> imgur.com, imgbb.com, tinypng.com
                      </li>
                      <li style={{ marginLeft: '1.5rem' }}>• <strong>Cloud:</strong> Google Drive, OneDrive, Dropbox</li>
                      <li>Get the direct image URL from the hosting service</li>
                      <li>Paste the URL below</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">
                Image URL <span className="required">*</span>
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="https://example.com/design-image.png"
                className="form-input"
                disabled={loading}
              />
              <p className="form-help">
                Paste the full URL to your design image. Must be a direct link to the image file.
              </p>
            </div>

            <div className="form-section">
              <label className="form-label">
                Frame Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="frameName"
                value={formData.frameName}
                onChange={handleInputChange}
                placeholder="e.g., Hero Section, Login Page, Product Card"
                className="form-input"
                disabled={loading}
              />
              <p className="form-help">
                Give this design a descriptive name for your analysis results
              </p>
            </div>
          </div>

          <div className="info-box">
            <h4>
              <Zap size={18} />
              What we'll analyze
            </h4>
            <ul>
              <li>Accessibility compliance (WCAG standards)</li>
              <li>Text readability and legibility</li>
              <li>Visual hierarchy and attention flow</li>
              <li>Color contrast and visual balance</li>
              <li>Component organization and consistency</li>
            </ul>
          </div>

          <div className="button-group">
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Loading...' : 'Analyze Design Image'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default URLUploadInput;
