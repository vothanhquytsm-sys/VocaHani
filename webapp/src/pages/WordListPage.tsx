import React, { useState } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { type Word } from '../types/Word';
import { 
  ArrowLeft, 
  Sparkles, 
  Award, 
  Heart, 
  Check, 
  Search,
  BookOpen
} from 'lucide-react';


interface WordListPageProps {
  topicName: string;
  lessonIndex: number;
  setPage: (page: any) => void;
}

export const WordListPage: React.FC<WordListPageProps> = ({ topicName, lessonIndex, setPage }) => {
  const { words, toggleFavorite, toggleLearned, passedLessons } = useVocabulary();

  
  const [searchText, setSearchText] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showUnlearnedOnly, setShowUnlearnedOnly] = useState(false);

  // Extract base words for this topic (10 per lesson)
  const lessonWords = React.useMemo(() => {
    const topicWords = words.filter(w => w.topic.toLowerCase() === topicName.toLowerCase() && !w.isCustom);
    const start = lessonIndex * 10;
    const end = Math.min(start + 10, topicWords.length);
    return topicWords.slice(start, end);
  }, [words, topicName, lessonIndex]);

  // Apply filters
  const filteredWords = React.useMemo(() => {
    return lessonWords.filter(w => {
      const matchSearch = 
        w.word.toLowerCase().includes(searchText.toLowerCase()) || 
        w.vietnameseMeaning.toLowerCase().includes(searchText.toLowerCase());
      
      const matchFavorite = !showFavoritesOnly || w.isFavorite;
      const matchUnlearned = !showUnlearnedOnly || !w.isLearned;

      return matchSearch && matchFavorite && matchUnlearned;
    });
  }, [lessonWords, searchText, showFavoritesOnly, showUnlearnedOnly]);

  const isLessonPassed = passedLessons.includes(`${topicName.toLowerCase()}_${lessonIndex}`);
  
  const handleWordClick = (word: Word) => {
    // Find index of the clicked word in the filtered list
    setPage({
      type: 'wordDetail',
      topicName,
      lessonIndex,
      wordId: word.id
    });
  };

  return (
    <div>
      {/* Back Button */}
      <button className="back-btn" onClick={() => setPage({ type: 'topics', topicName })}>
        <ArrowLeft size={16} />
        <span>Quay lại chủ đề</span>
      </button>

      {/* Lesson Header Banner */}
      <div className="glass" style={{ borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
              Bài học {lessonIndex + 1} • {topicName}
            </span>
            <h1 className="font-heading" style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-bold)', marginTop: '4px' }}>
              Danh sách từ vựng
            </h1>
          </div>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setPage({ type: 'flashcards', topicName, lessonIndex })}
              className="font-heading"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px var(--accent-glow)',
                transition: 'transform 0.15s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1.0)'}
            >
              <Sparkles size={16} />
              <span>Thẻ ghi nhớ (Flashcards)</span>
            </button>

            <button 
              onClick={() => setPage({ type: 'test', topicName, lessonIndex })}
              className="font-heading"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: isLessonPassed
                  ? 'linear-gradient(135deg, var(--emerald) 0%, var(--emerald-light) 100%)'
                  : 'var(--bg-tertiary)',
                color: isLessonPassed ? 'white' : 'var(--text)',
                border: isLessonPassed ? 'none' : '1px solid var(--border)',
                padding: '10px 18px',
                borderRadius: '14px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: isLessonPassed ? '0 4px 12px var(--emerald-glow)' : 'none',
                transition: 'transform 0.15s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.96)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1.0)'}
            >
              <Award size={16} />
              <span>Kiểm tra {isLessonPassed && '• Đã Đạt'}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm từ hoặc nghĩa tiếng Việt..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              borderRadius: '14px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text-bold)',
              fontSize: '15px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{
              padding: '8px 16px',
              borderRadius: '99px',
              border: showFavoritesOnly ? 'none' : '1px solid var(--border)',
              backgroundColor: showFavoritesOnly ? 'var(--rose)' : 'var(--bg)',
              color: showFavoritesOnly ? 'white' : 'var(--text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Heart size={14} fill={showFavoritesOnly ? 'white' : 'transparent'} />
            <span>Đã thích</span>
          </button>

          <button
            onClick={() => setShowUnlearnedOnly(!showUnlearnedOnly)}
            style={{
              padding: '8px 16px',
              borderRadius: '99px',
              border: showUnlearnedOnly ? 'none' : '1px solid var(--border)',
              backgroundColor: showUnlearnedOnly ? 'var(--accent)' : 'var(--bg)',
              color: showUnlearnedOnly ? 'white' : 'var(--text)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <BookOpen size={14} />
            <span>Chưa học</span>
          </button>
        </div>
      </div>

      {/* Words List */}
      {filteredWords.length === 0 ? (
        <div style={{ padding: '64px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '18px', fontWeight: 600 }}>Không tìm thấy từ vựng nào.</p>
          <p style={{ fontSize: '14px', marginTop: '4px' }}>Vui lòng thay đổi bộ lọc tìm kiếm hoặc từ khóa.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filteredWords.map(w => (
            <div
              key={w.id}
              className="glass"
              style={{
                borderRadius: '16px',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                border: '1px solid var(--border)',
                transition: 'all 0.2s'
              }}
              onClick={() => handleWordClick(w)}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'left' }}>
                <span style={{ fontSize: '1.5rem', background: 'var(--bg-tertiary)', padding: '10px', borderRadius: '12px' }}>
                  📖
                </span>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-bold)' }}>{w.word}</span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{w.ipa}</span>
                  </div>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>{w.vietnameseMeaning}</span>
                </div>
              </div>

              {/* Toggle indicators */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} onClick={e => e.stopPropagation()}>
                {/* Heart Toggle */}
                <button
                  onClick={() => toggleFavorite(w.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: w.isFavorite ? 'var(--rose)' : 'var(--text-muted)',
                    padding: '6px',
                    borderRadius: '50%',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Heart size={20} fill={w.isFavorite ? 'var(--rose)' : 'transparent'} />
                </button>

                {/* Learned Toggle */}
                <button
                  onClick={() => toggleLearned(w.id)}
                  style={{
                    background: w.isLearned ? 'var(--emerald)' : 'transparent',
                    border: w.isLearned ? 'none' : '2px solid var(--border)',
                    color: w.isLearned ? 'white' : 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = w.isLearned ? 'var(--emerald)' : 'var(--bg-tertiary)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = w.isLearned ? 'var(--emerald)' : 'transparent'}
                >
                  {w.isLearned && <Check size={16} strokeWidth={3} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
