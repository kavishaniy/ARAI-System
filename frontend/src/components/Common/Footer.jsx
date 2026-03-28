import React from 'react';

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid rgba(0,0,0,0.04)', background: 'transparent' }}>
      <div className="container" style={{ padding: '12px 0' }}>
        <p style={{ textAlign: 'center', margin: 0 }} className="muted">&copy; {new Date().getFullYear()} ARAI System</p>
      </div>
    </footer>
  );
};

export default Footer;
