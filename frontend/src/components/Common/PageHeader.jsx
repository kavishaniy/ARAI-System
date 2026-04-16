import React from 'react';

/**
 * Standardized Page Header Component
 * Used across all pages to maintain uniform title, position, style, and theme
 */
const PageHeader = ({ title, subtitle, actions = null }) => {
  const css = `
    .page-header {
      padding: 48px 40px 24px;
      border-bottom: 1px solid rgba(15, 37, 87, 0.08);
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(8px);
    }

    @media (max-width: 1024px) {
      .page-header {
        padding: 36px 30px 18px;
      }
    }

    @media (max-width: 768px) {
      .page-header {
        padding: 24px 16px 16px;
      }
    }

    @media (max-width: 480px) {
      .page-header {
        padding: 18px 12px 12px;
      }
    }

    .page-header-content {
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    .page-header-section {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 24px;
    }

    @media (max-width: 768px) {
      .page-header-section {
        flex-direction: column;
        gap: 16px;
      }
    }

    @media (max-width: 480px) {
      .page-header-section {
        gap: 12px;
      }
    }

    .page-header-title {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .page-title {
      margin: 0;
      font-family: 'DM Serif Display', serif;
      font-size: 2.2rem;
      font-weight: 400;
      color: #0f2557;
      line-height: 1.2;
    }

    @media (max-width: 1024px) {
      .page-title {
        font-size: 1.8rem;
      }
    }

    @media (max-width: 768px) {
      .page-title {
        font-size: 1.6rem;
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 1.3rem;
      }
    }

    .page-subtitle {
      font-size: 0.95rem;
      color: rgba(15, 37, 87, 0.6);
      font-weight: 300;
      letter-spacing: 0.3px;
      margin: 0;
    }

    @media (max-width: 768px) {
      .page-subtitle {
        font-size: 0.85rem;
      }
    }

    @media (max-width: 480px) {
      .page-subtitle {
        font-size: 0.8rem;
        letter-spacing: 0.2px;
      }
    }

    .page-header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    @media (max-width: 768px) {
      .page-header-actions {
        width: 100%;
        flex-wrap: wrap;
      }
    }

    @media (max-width: 480px) {
      .page-header-actions {
        gap: 8px;
      }
    }
  `;

  return (
    <>
      <style>{css}</style>
      <header className="page-header">
        <div className="page-header-content">
          <div className="page-header-section">
            <div className="page-header-title">
              <h1 className="page-title">{title}</h1>
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="page-header-actions">{actions}</div>}
          </div>
        </div>
      </header>
    </>
  );
};

export default PageHeader;
