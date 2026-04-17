import React, { useState } from 'react';
import { AlertCircle, Plus, Trash2 } from 'lucide-react';

const css = `
.figma-container {
  max-width: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.figma-header {
  margin-bottom: 2.5rem;
}

.figma-header h1 {
  font-family: 'DM Serif Display', serif;
  font-size: 2rem;
  color: #0f2557;
  margin: 0 0 0.75rem 0;
  font-weight: 400;
  letter-spacing: -0.5px;
}

.figma-header p {
  font-size: 1rem;
  color: rgba(15, 37, 87, 0.6);
  line-height: 1.6;
  margin: 0;
}

.how-to-section {
  background: white;
  border: 1.5px solid rgba(15, 37, 87, 0.12);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px rgba(15, 37, 87, 0.04);
}

.how-to-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f2557;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.how-to-steps {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
}

.how-to-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 0.9rem;
  color: rgba(15, 37, 87, 0.7);
  line-height: 1.5;
}

.step-num {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #0f2557, #091840);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  margin-top: 2px;
}

.urls-section {
  background: white;
  border: 1.5px solid rgba(15, 37, 87, 0.12);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 16px rgba(15, 37, 87, 0.04);
  margin-bottom: 2rem;
}

.urls-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f2557;
  margin-bottom: 1.5rem;
}

.url-row {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  align-items: center;
}

.url-input {
  flex: 1;
  padding: 11px 14px;
  font-size: 0.9rem;
  border: 1.5px solid rgba(15, 37, 87, 0.14);
  border-radius: 9px;
  font-family: 'DM Sans', sans-serif;
  background: #fafbfc;
  transition: all 0.2s;
  box-sizing: border-box;
  color: #0f2557;
}

.url-input:focus {
  outline: none;
  border-color: rgba(15, 37, 87, 0.38);
  background: white;
  box-shadow: 0 0 0 3px rgba(15, 37, 87, 0.07);
}

.url-input::placeholder {
  color: rgba(15, 37, 87, 0.32);
}

.url-input.invalid {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.02);
}

.url-remove-btn {
  flex-shrink: 0;
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(15, 37, 87, 0.35);
  padding: 8px;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.url-remove-btn:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
}

.add-url-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 11px 16px;
  background: white;
  border: 1.5px dashed rgba(15, 37, 87, 0.2);
  border-radius: 9px;
  color: rgba(15, 37, 87, 0.6);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.add-url-btn:hover {
  border-color: rgba(15, 37, 87, 0.35);
  color: #0f2557;
  background: rgba(15, 37, 87, 0.02);
}

.error-message {
  background: #fee2e2;
  border: 1.5px solid #fecaca;
  border-radius: 10px;
  padding: 12px 16px;
  color: #991b1b;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.error-message svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.info-section {
  background: rgba(100, 180, 255, 0.05);
  border: 1.5px solid rgba(100, 180, 255, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.info-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #0f2557;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 1rem 0;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.info-item {
  font-size: 0.9rem;
  color: rgba(15, 37, 87, 0.68);
  padding: 0;
  line-height: 1.5;
}

.submit-button {
  width: 100%;
  padding: 12px 24px;
  background: linear-gradient(135deg, #0f2557, #091840);
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 37, 87, 0.15);
}

.submit-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .urls-section {
    padding: 1.5rem;
  }

  .how-to-section {
    padding: 1.5rem;
  }

  .figma-header h1 {
    font-size: 1.6rem;
  }

  .figma-header p {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .urls-section {
    padding: 1.25rem;
  }

  .how-to-section {
    padding: 1.25rem;
  }

  .figma-header h1 {
    font-size: 1.4rem;
  }

  .figma-header p {
    font-size: 0.85rem;
  }

  .submit-button {
    padding: 11px 18px;
    font-size: 0.85rem;
  }
}
`;

const isFigmaUrl = (url) =>
  url.includes('figma.com') &&
  (url.includes('/file/') || url.includes('/design/'));

const FigmaProjectInput = ({ onProjectSubmit }) => {
  const [frameUrls, setFrameUrls] = useState(['']);
  const [error, setError]         = useState('');

  const updateUrl = (index, value) => {
    setError('');
    setFrameUrls(prev => prev.map((u, i) => (i === index ? value : u)));
  };

  const addUrl = () => setFrameUrls(prev => [...prev, '']);

  const removeUrl = (index) => {
    if (frameUrls.length === 1) { setFrameUrls(['']); return; }
    setFrameUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const valid = frameUrls.map(u => u.trim()).filter(Boolean);
    if (valid.length === 0) {
      setError('Add at least one Figma frame URL.');
      return;
    }
    const bad = valid.find(u => !isFigmaUrl(u));
    if (bad) {
      setError(`Not a valid Figma URL: ${bad}`);
      return;
    }

    onProjectSubmit({ frameUrls: valid });
  };

  return (
    <>
      <style>{css}</style>
      <div className="figma-container">
        {/* How-to */}
        <div className="how-to-section">
          <div className="how-to-title">How to copy a frame link from Figma</div>
          <div className="how-to-steps">
            <div className="how-to-step">
              <div className="step-num">1</div>
              <span>Open your Figma project in the browser</span>
            </div>
            <div className="how-to-step">
              <div className="step-num">2</div>
              <span>Click on a <strong>Frame</strong> in the canvas</span>
            </div>
            <div className="how-to-step">
              <div className="step-num">3</div>
              <span>Right-click → <strong>Copy link</strong> (or press <strong>Ctrl/⌘ + L</strong>)</span>
            </div>
            <div className="how-to-step">
              <div className="step-num">4</div>
              <span>Paste below. Repeat for each frame you want analyzed.</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="urls-section">
            <div className="urls-label">Frame URLs ({frameUrls.filter(u => u.trim()).length} added)</div>

            {frameUrls.map((url, idx) => (
              <div className="url-row" key={idx}>
                <input
                  type="url"
                  value={url}
                  onChange={e => updateUrl(idx, e.target.value)}
                  placeholder="https://www.figma.com/design/xxx/Name?node-id=1:2"
                  className={`url-input ${url.trim() && !isFigmaUrl(url) ? 'invalid' : ''}`}
                />
                <button
                  type="button"
                  className="url-remove-btn"
                  onClick={() => removeUrl(idx)}
                  title="Remove"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <button type="button" className="add-url-btn" onClick={addUrl}>
              <Plus size={15} /> Add another frame
            </button>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={frameUrls.every(u => !u.trim())}
          >
            Analyze {frameUrls.filter(u => u.trim()).length || ''} Frame{frameUrls.filter(u => u.trim()).length !== 1 ? 's' : ''} →
          </button>
        </form>
      </div>
    </>
  );
};

export default FigmaProjectInput;
