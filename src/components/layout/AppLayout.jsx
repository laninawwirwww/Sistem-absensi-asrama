import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout({ title, subtitle, children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="app-layout">
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 95 }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <Topbar title={title} subtitle={subtitle} onMenuClick={toggleSidebar} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}
