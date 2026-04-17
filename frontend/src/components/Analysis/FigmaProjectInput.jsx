import React, { useState } from 'react';
import { AlertCircle, Plus, Trash2, Zap } from 'lucide-react';

const css = `
.figma-input-container { max-width: 720px; margin: 0 auto; }

.figma-header { text-align: center; margin-bottom: 2.5rem; }
.figma-header h1 {
  font-family: 'DM Serif Display', serif;
  font-size: 2.2rem; color: #0f2557; margin-bottom: 0.5rem; font-weight: 400;
}
.figma-header p { font-size: 0.95rem; color: rgba(15,37,87,0.6); line-height: 1.6; }

.how-to-card {
  background: linear-gradient(135deg, rgba(15,37,87,0.03), rgba(100,200,255,0.05));
  border: 1.5px solid rgba(100,180,255,0.2);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  margin-bottom: 1.75rem;
}
.how-to-title {
  font-size: 0.9rem; font-weight: 600; color: #0f2557;
  margin-bottom: 1rem; display: flex; align-items: center; gap: 6px;
}
.how-to-steps { display: flex; flex-direction: column; gap: 0.6rem; }
.how-to-step { display: flex; align-items: flex-start; gap: 10px; font-size: 0.875rem; color: rgba(15,37,87,0.72); line-height: 1.5; }
.step-num {
  flex-shrink: 0; width: 22px; height: 22px;
  background: linear-gradient(135deg, #0f2557, #091840);
  color: white; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.72rem; font-weight: 700; margin-top: 1px;
}

.urls-card {
  background: white;
  border: 1.5px solid rgba(15,37,87,0.13);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(15,37,87,0.07);
  margin-bottom: 1.5rem;
}
.urls-card-label {
  font-size: 0.9rem; font-weight: 600; color: #0f2557; margin-bottom: 1rem;
}

.url-row { display: flex; gap: 8px; margin-bottom: 10px; align-items: center; }
.url-input {
  flex: 1; padding: 11px 14px; font-size: 0.9rem;
  border: 1.5px solid rgba(15,37,87,0.14); border-radius: 9px;
  font-family: 'DM Sans', sans-serif; background: #fafbfc;
  transition: all 0.2s; box-sizing: border-box;
}
.url-input:focus {
  outline: none; border-color: rgba(15,37,87,0.38); background: white;
  box-shadow: 0 0 0 3px rgba(15,37,87,0.07);
}
.url-input::placeholder { color: rgba(15,37,87,0.32); }
.url-input.invalid { border-color: rgba(239,68,68,0.5); background: rgba(239,68,68,0.02); }

.url-remove-btn {
  flex-shrink: 0; background: none; border: none; cursor: pointer;
  color: rgba(15,37,87,0.35); padding: 6px; border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.url-remove-btn:hover { background: rgba(239,68,68,0.08); color: #dc2626; }

.add-url-btn {
  display: flex; align-items: center; gap: 7px;
  padding: 9px 16px; background: none;
  border: 1.5px dashed rgba(15,37,87,0.2); border-radius: 9px;
  color: rgba(15,37,87,0.6); font-family: 'DM Sans', sans-serif;
  font-size: 0.875rem; font-weight: 500; cursor: pointer;
  transition: all 0.2s; width: 100%; justify-content: center;
  margin-top: 4px;
}
.add-url-btn:hover { border-color: rgba(15,37,87,0.35); color: #0f2557; background: rgba(15,37,87,0.02); }

.error-message {
  background: #fee2e2; border: 1.5px solid #fecaca;
  border-radius: 10px; padding: 0.9rem 1.2rem; color: #991b1b;
  font-size: 0.88rem; margin-bottom: 1.2rem;
  display: flex; align-items: flex-start; gap: 9px;
}
.error-message svg { flex-shrink: 0; margin-top: 1px; }

.submit-button {
  width: 100%; padding: 14px 24px;
  background: linear-gradient(135deg, #0f2557, #091840);
  color: white; border: none; border-radius: 10px;
  font-family: 'DM Sans', sans-serif; font-size: 0.95rem; font-weight: 600;
  cursor: pointer; transition: all 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 9px;
}
.submit-button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(15,37,87,0.22); }
.submit-button:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

.info-box {
  background: rgba(100,180,255,0.07); border: 1.5px solid rgba(100,180,255,0.2);
  border-radius: 12px; padding: 1.2rem 1.5rem;
}
.info-box h4 {
  font-size: 0.88rem; font-weight: 600; color: #0f2557;
  margin-bottom: 0.5rem; display: flex; align-items: center; gap: 6px;
}
.info-box ul { list-style: none; padding: 0; margin: 0; }
.info-box li {
  font-size: 0.86rem; color: rgba(15,37,87,0.68);
  padding: 0.28rem 0 0.28rem 1.35rem; position: relative; line-height: 1.5;
}
.info-box li::before { content: '✓'; position: absolute; left: 0; color: #10b981; font-weight: bold; }

@media (max-width: 768px) {
  .urls-card { padding: 1.5rem; }
  .how-to-card { padding: 1.25rem 1.5rem; }
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
      <div className="figma-input-container">
        <div className="figma-header">
          <h1>Analyze Figma Frames</h1>
          <p>
            Paste the share link for each frame you want to analyze.
            No API token required — works with any public Figma file.
          </p>
        </div>

        {/* How-to */}
        <div className="how-to-card">
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

          <div className="urls-card">
            <div className="urls-card-label">Frame URLs ({frameUrls.filter(u => u.trim()).length} added)</div>

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

          <div className="info-box" style={{ marginBottom: '1.5rem' }}>
            <h4><Zap size={15} /> What we'll analyze per frame</h4>
            <ul>
              <li>Accessibility — WCAG 2.1 contrast, text size, touch targets</li>
              <li>Readability — sentence length, word complexity, text density</li>
              <li>Visual attention — hierarchy, eye-flow, cognitive load</li>
              <li>Results shown side-by-side, same format as image uploads</li>
            </ul>
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
