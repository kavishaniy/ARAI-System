import React from 'react';
import Sidebar from '../Common/Sidebar';

const HistoryPage = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-area" style={{ marginLeft: 200 }}>
        <div className="container">
          <div className="glass-card">
            <h2 style={{ marginTop: 0 }}>History</h2>
            <p className="muted">Your recent analyses and activity.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;
