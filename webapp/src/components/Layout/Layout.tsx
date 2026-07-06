import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: any;
  setPage: (page: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, setPage }) => {
  return (
    <div className="app-layout">
      {/* Sidebar - Desktop Only */}
      <Sidebar currentPage={currentPage} setPage={setPage} />

      {/* Main Content Area */}
      <main className="app-main">
        <div className="app-container">
          {children}
        </div>
      </main>

      {/* Bottom Nav - Mobile Only */}
      <MobileNav currentPage={currentPage} setPage={setPage} />
    </div>
  );
};
