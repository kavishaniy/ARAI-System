import React from 'react';

/**
 * Standardized Page Layout Component
 * Provides consistent page structure with header and main content area
 */
const PageLayout = ({ children, header = null, mainContent = null }) => {
  const css = `
    .page-shell {
      display: flex;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f4f0 0%, #faf9f7 100%);
    }

    .page-container {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .page-main {
      flex: 1;
      padding: 32px 40px;
      overflow-y: auto;
    }

    @media (max-width: 1024px) {
      .page-main {
        padding: 24px 30px;
      }
    }

    @media (max-width: 768px) {
      .page-main {
        padding: 20px 16px;
      }
    }

    @media (max-width: 480px) {
      .page-main {
        padding: 16px 12px;
      }
    }

    .page-content {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .page-card {
      background: white;
      border: 1.5px solid rgba(15, 37, 87, 0.12);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 10px 40px rgba(15, 37, 87, 0.06);
      transition: all 0.3s ease;
    }

    @media (max-width: 768px) {
      .page-card {
        padding: 20px;
        border-radius: 12px;
      }
    }

    @media (max-width: 480px) {
      .page-card {
        padding: 16px;
        border-radius: 10px;
      }
    }

    .page-card:hover {
      border-color: rgba(15, 37, 87, 0.2);
      box-shadow: 0 15px 50px rgba(15, 37, 87, 0.1);
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="page-shell">
        {children}
      </div>
    </>
  );
};

export default PageLayout;
