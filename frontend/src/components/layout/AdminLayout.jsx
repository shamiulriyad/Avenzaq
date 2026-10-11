import React from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main" style={{ marginLeft: '240px' }}>
        <div className="admin-content">
          {children}
        </div>
      </div>
    </div>
  );
}
