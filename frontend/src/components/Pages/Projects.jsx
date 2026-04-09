import React from 'react';
import Sidebar from '../Common/Sidebar';

const Projects = () => {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="content-area" style={{ marginLeft: 200 }}>
        <div className="container">
          <div className="glass-card">
            <h2 style={{ marginTop: 0 }}>Projects</h2>
            <p className="muted">Manage and view your projects here.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
