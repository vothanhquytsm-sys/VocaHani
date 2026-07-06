import React from 'react';
import { useVocabulary } from '../../context/VocabularyContext';
import { 
  LayoutGrid, 
  MessageSquare, 
  BookOpen, 
  Languages, 
  PenTool, 
  BarChart2
} from 'lucide-react';

interface SidebarProps {
  currentPage: any;
  setPage: (page: any) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage }) => {
  const { words } = useVocabulary();
  
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
    </aside>
  );
};
