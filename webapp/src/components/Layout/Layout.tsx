import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useVocabulary } from '../../context/VocabularyContext';
import { LogIn } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: any;
  setPage: (page: any) => void;
  onLoginClick: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentPage, setPage, onLoginClick }) => {
  const { user, logoutUser } = useVocabulary();

  return (
    <div className="app-layout">
      {/* Sidebar - Desktop Only */}
      <Sidebar currentPage={currentPage} setPage={setPage} onLoginClick={onLoginClick} />

      {/* Main Content Area */}
      <main className="app-main">
        {/* Mobile Header Row (Visible on Mobile viewports only) */}
        <header className="mobile-only-header">
          <img src="/logo.png" alt="VocaHani" style={{ height: '36px', objectFit: 'contain' }} />
          
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-bold)' }}>{user.username}</span>
              <button
                onClick={logoutUser}
                style={{
                  background: 'var(--rose-glow)',
                  color: 'var(--rose)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: 750,
                  cursor: 'pointer'
                }}
              >
                Thoát
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--accent-glow)',
                color: 'var(--accent)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <LogIn size={14} />
              <span>Đăng nhập</span>
            </button>
          )}
        </header>

        <div className="app-container">
          {children}
        </div>
      </main>

      {/* Bottom Nav - Mobile Only */}
      <MobileNav currentPage={currentPage} setPage={setPage} />
    </div>
  );
};
