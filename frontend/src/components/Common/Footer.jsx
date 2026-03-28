import React from 'react';

const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'transparent' }}>
      <div className="container" style={{ padding: '18px 0' }}>
        <p style={{ textAlign: 'center', margin: 0 }} className="muted">&copy; {new Date().getFullYear()} ARAI System. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
