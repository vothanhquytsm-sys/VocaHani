import React from 'react';
import { 
  LayoutGrid, 
  MessageSquare, 
  BookOpen, 
  Languages, 
  PenTool, 
  BarChart2 
} from 'lucide-react';

interface MobileNavProps {
  currentPage: any;
  setPage: (page: any) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ currentPage, setPage }) => {
  const getTabClass = (types: string[]) => {
    const isActive = types.includes(currentPage.type);
    return `mobile-tab-btn ${isActive ? 'active' : ''}`;
  };

  return (
    <nav className="app-mobile-nav">
      <button 
        onClick={() => setPage({ type: 'topics' })} 
        className={getTabClass(['topics', 'wordList', 'wordDetail', 'flashcards', 'test'])}
      >
        <LayoutGrid size={20} />
        <span>Chủ đề</span>
      </button>
      
      <button 
        onClick={() => setPage({ type: 'phrases' })} 
        className={getTabClass(['phrases'])}
      >
        <MessageSquare size={20} />
        <span>Cụm từ</span>
      </button>
      
      <button 
        onClick={() => setPage({ type: 'reading' })} 
        className={getTabClass(['reading', 'readingDetail', 'readingQuiz'])}
      >
        <BookOpen size={20} />
        <span>Luyện đọc</span>
      </button>
      
      <button 
        onClick={() => setPage({ type: 'dictionary' })} 
        className={getTabClass(['dictionary'])}
      >
        <Languages size={20} />
        <span>Từ điển</span>
      </button>
      
      <button 
        onClick={() => setPage({ type: 'customWords' })} 
        className={getTabClass(['customWords'])}
      >
        <PenTool size={20} />
        <span>Từ của tôi</span>
      </button>
      
      <button 
        onClick={() => setPage({ type: 'statistics' })} 
        className={getTabClass(['statistics'])}
      >
        <BarChart2 size={20} />
        <span>Tiến trình</span>
      </button>
    </nav>
  );
};
