import React from 'react';
import { useVocabulary } from '../../context/VocabularyContext';
import { 
  LayoutGrid, 
  MessageSquare, 
  BookOpen, 
  Languages, 
  PenTool, 
  BarChart2,
  LogIn,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  currentPage: any;
  setPage: (page: any) => void;
  onLoginClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage, onLoginClick }) => {
  const { words, user, logoutUser } = useVocabulary();
  
  // Extract unique sorted topics
  const topics = React.useMemo(() => {
    const list = Array.from(new Set(words.filter(w => !w.isCustom).map(w => w.topic))).sort();
    return list;
  }, [words]);

  const getTopicIcon = (topic: string) => {
    const name = topic.toLowerCase();
    if (name.includes('động vật') || name.includes('animal')) return '🐾';
    if (name.includes('ăn') || name.includes('uống') || name.includes('food')) return '🍔';
    if (name.includes('gia đình') || name.includes('family')) return '❤️';
    if (name.includes('trường') || name.includes('school')) return '🎒';
    if (name.includes('xe') || name.includes('giao thông') || name.includes('travel')) return '🚗';
    if (name.includes('nghề') || name.includes('work') || name.includes('job')) return '💼';
    return '⭐';
  };

  const isSelected = (type: string, id?: string) => {
    if (currentPage.type === type) {
      if (id && currentPage.topicName !== id) return false;
      return true;
    }
    return false;
  };

  return (
    <aside className="app-sidebar">
      {/* Brand Header */}
      <div className="app-sidebar-header">
        <img 
          src="/logo.png" 
          alt="VocaHani Logo" 
          className="app-sidebar-logo"
          onClick={() => setPage({ type: 'topics' })}
        />
      </div>

      {/* Navigation Links */}
      <div className="app-sidebar-content">
        {/* CHỦ ĐỀ HỌC TẬP */}
        <div>
          <h3 className="sidebar-section-title">
            Chủ đề học tập
          </h3>
          <ul className="sidebar-list">
            <li>
              <button
                onClick={() => setPage({ type: 'topics' })}
                className={`sidebar-btn ${isSelected('topics') && !currentPage.topicName ? 'active' : ''}`}
              >
                <LayoutGrid size={18} />
                <span>Tất cả chủ đề</span>
              </button>
            </li>
            
            {topics.map(topic => (
              <li key={topic}>
                <button
                  onClick={() => setPage({ type: 'topics', topicName: topic })}
                  className={`sidebar-btn ${currentPage.type === 'topics' && currentPage.topicName === topic ? 'active-subtle' : ''}`}
                >
                  <span style={{ fontSize: '1.1rem' }}>{getTopicIcon(topic)}</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                    {topic}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* TIỆN ÍCH */}
        <div>
          <h3 className="sidebar-section-title">
            Tiện ích
          </h3>
          <ul className="sidebar-list">
            <li>
              <button
                onClick={() => setPage({ type: 'phrases' })}
                className={`sidebar-btn ${isSelected('phrases') ? 'active' : ''}`}
              >
                <MessageSquare size={18} />
                <span>Cụm từ giao tiếp</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setPage({ type: 'reading' })}
                className={`sidebar-btn ${isSelected('reading') || isSelected('readingDetail') || isSelected('readingQuiz') ? 'active' : ''}`}
              >
                <BookOpen size={18} />
                <span>Luyện đọc từ vựng</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setPage({ type: 'dictionary' })}
                className={`sidebar-btn ${isSelected('dictionary') ? 'active' : ''}`}
              >
                <Languages size={18} />
                <span>Từ điển Anh - Việt</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setPage({ type: 'customWords' })}
                className={`sidebar-btn ${isSelected('customWords') ? 'active' : ''}`}
              >
                <PenTool size={18} />
                <span>Sổ từ của tôi</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => setPage({ type: 'statistics' })}
                className={`sidebar-btn ${isSelected('statistics') ? 'active' : ''}`}
              >
                <BarChart2 size={18} />
                <span>Tiến trình & Học tập</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Account Footer Section */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-glow)',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}>
                {user.username.substring(0, 2)}
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-bold)', display: 'block' }}>{user.username}</span>
                <span style={{ fontSize: '11px', color: 'var(--emerald)', fontWeight: 700 }}>Đã đồng bộ</span>
              </div>
            </div>
            
            <button
              onClick={logoutUser}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                padding: '6px',
                borderRadius: '50%'
              }}
              title="Đăng xuất"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={onLoginClick}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              background: 'var(--bg-secondary)',
              color: 'var(--text)',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <LogIn size={16} />
            <span>Đăng nhập đồng bộ</span>
          </button>
        )}
      </div>
    </aside>
  );
};
