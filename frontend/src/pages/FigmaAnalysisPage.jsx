import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Common/Sidebar';
import FigmaAnalyzer from '../components/FigmaAnalyzer';

const FigmaAnalysisPage = () => {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        const v = localStorage.getItem('sidebar_collapsed');
        setCollapsed(v === 'true');
      } catch (e) {
        setCollapsed(false);
      }
    };

    read();
    const onStorage = (e) => { if (e.key === 'sidebar_collapsed') read(); };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const css = `
/* Main shell - matches dashboard-shell */
.figma-shell {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
}

/* Content wrapper - matches dashboard-content */
.figma-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Header - exact match with dashboard-header */
.figma-header {
  padding: 48px 40px 24px;
  border-bottom: 1px solid rgba(15,37,87,0.08);
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(8px);
}

.figma-header-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.figma-header-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.figma-header-title {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.figma-title {
  margin: 0;
  font-family: 'DM Serif Display', serif;
  font-size: 2.2rem;
  font-weight: 400;
  color: #0f2557;
  line-height: 1.2;
}

.figma-subtitle {
  font-size: 0.95rem;
  color: rgba(15,37,87,0.6);
  font-weight: 300;
  letter-spacing: 0.3px;
}

/* Main content area - exact match with dashboard-main */
.figma-main {
  flex: 1;
  padding: 32px 40px;
  overflow-y: auto;
}

/* Card - exact match with dashboard-card */
.figma-card {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border: 1.5px solid rgba(15,37,87,0.12);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(15,37,87,0.06);
  transition: all 0.3s ease;
}

.figma-card:hover {
  border-color: rgba(15,37,87,0.2);
  box-shadow: 0 15px 50px rgba(15,37,87,0.1);
}

/* Mobile adjustments - match dashboard */
@media (max-width: 768px) {
  .figma-header {
    padding: 24px 16px 16px;
  }

  .figma-main {
    padding: 20px 16px;
  }

  .figma-card {
    padding: 20px;
  }

  .figma-title {
    font-size: 1.6rem;
  }

  .figma-header-section {
    flex-direction: column;
    gap: 16px;
  }
}
`;

  return (
    <>
      <style>{css}</style>
      <div className="figma-shell">
        <Sidebar />
        <div className="figma-content" style={{ marginLeft: collapsed ? 72 : 260 }}>
          <div className="figma-header">
            <div className="figma-header-content">
              <div className="figma-header-section">
                <div className="figma-header-title">
                  <h1 className="figma-title">Figma Analysis</h1>
                  <p className="figma-subtitle">
                    Analyze your Figma designs for accessibility, readability, and visual hierarchy
                  </p>
                </div>
              </div>
            </div>
          </div>
          <main className="figma-main">
            <div className="figma-card">
              <FigmaAnalyzer />
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default FigmaAnalysisPage;
