import React from 'react';
import './AppLayout.css';

export default function AppLayout({ main, footer }) {
  return (
    <div className='app-page'>
      <main className='app-content'>
        {main}
      </main>
      <footer className="footer">
        <hr />
        {footer}
      </footer>
    </div>
  );
}