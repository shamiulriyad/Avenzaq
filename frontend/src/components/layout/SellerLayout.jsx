import React from 'react';
import SellerSidebar from './SellerSidebar';

export default function SellerLayout({ children }) {
  return (
    <div className="seller-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8f9fc', position: 'relative' }}>
      <SellerSidebar />
      <div 
        className="seller-main" 
        style={{ 
          marginLeft: '240px', 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
          width: '100%'
        }}
      >
        <div className="seller-content" style={{ flex: 1, overflow: 'auto', width: '100%' }}>
          {children}
        </div>
      </div>

      <style>{`
        .seller-layout { position: relative; }
        
        @media (max-width: 768px) {
          .seller-main {
            margin-left: 64px !important;
          }
        }
      `}</style>
    </div>
  );
}
