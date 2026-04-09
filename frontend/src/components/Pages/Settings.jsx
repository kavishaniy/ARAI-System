import React from 'react';
import Sidebar from '../Common/Sidebar';

const Settings = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-area" style={{ marginLeft: 200 }}>
        <div className="container">
          <div className="glass-card">
            <h2 style={{ marginTop: 0 }}>Settings</h2>
            <p className="muted">Account and application settings.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;
