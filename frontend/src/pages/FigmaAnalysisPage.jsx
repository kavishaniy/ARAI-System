import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Common/Sidebar';
import FigmaAnalyzer from '../components/FigmaAnalyzer';

const FigmaAnalysisPage = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Listen for sidebar expansion changes
  useEffect(() => {
    const checkSidebarState = () => {
      const sidebar = document.querySelector('.side-rail');
      if (sidebar) {
        const isExpanded = sidebar.classList.contains('expanded');
        setSidebarExpanded(isExpanded);
      }
    };

    // Check initial state
    checkSidebarState();

    // Watch for changes
    const observer = new MutationObserver(checkSidebarState);
    const sidebar = document.querySelector('.side-rail');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    }

    return () => observer.disconnect();
  }, []);

  const sidebarWidth = sidebarExpanded ? 240 : 80;

  const css = `
    /* Main shell container - positioned to the right of fixed sidebar */
    .figma-shell {
      display: block;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
      position: fixed;
      top: 0;
      left: ${sidebarWidth}px;
      right: 0;
      bottom: 0;
      width: calc(100% - ${sidebarWidth}px);
      overflow-y: auto;
      overflow-x: hidden;
      z-index: 1;
      margin: 0;
      padding: 0;
      transition: left 0.35s cubic-bezier(0.4, 0, 0.2, 1), width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Main content area */
    .figma-content {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      position: relative;
      z-index: 1;
      margin: 0;
      padding: 0;
    }

    /* Header section - matches dashboard header */
    .figma-header {
      padding: 24px 16px 16px 16px;
      border-bottom: 1px solid rgba(15,37,87,0.08);
      background: rgba(255,255,255,0.5);
      backdrop-filter: blur(8px);
      flex-shrink: 0;
      position: relative;
      z-index: 5;
      margin: 0;
    }

    .figma-header-content {
      max-width: 100%;
      margin: 0;
      width: 100%;
      padding: 0;
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

    /* Main content area */
    .figma-main {
      flex: 1;
      padding: 16px 16px;
      overflow-y: auto;
      overflow-x: hidden;
      width: 100%;
      margin: 0;
    }

    /* Card styling - matches dashboard card */
    .figma-card {
      max-width: 100%;
      margin: 0;
      background: white;
      border: 1.5px solid rgba(15,37,87,0.12);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 10px 40px rgba(15,37,87,0.06);
      transition: all 0.3s ease;
    }

    .figma-card:hover {
      border-color: rgba(15,37,87,0.2);
      box-shadow: 0 15px 50px rgba(15,37,87,0.1);
    }

    /* Scrollbar styling */
    .figma-main::-webkit-scrollbar {
      width: 8px;
    }

    .figma-main::-webkit-scrollbar-track {
      background: transparent;
    }

    .figma-main::-webkit-scrollbar-thumb {
      background: rgba(15, 37, 87, 0.2);
      border-radius: 4px;
    }

    .figma-main::-webkit-scrollbar-thumb:hover {
      background: rgba(15, 37, 87, 0.3);
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .figma-shell {
        left: 0;
        width: 100%;
      }

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
      <Sidebar />
      <div className="figma-shell">
        <div className="figma-content">
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
