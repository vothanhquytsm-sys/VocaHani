import React, { useState } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { Search, BookOpen, Award } from 'lucide-react';
import { type ReadingPassage } from '../types/Reading';

interface ReadingListPageProps {
  setPage: (page: any) => void;
}

export const ReadingListPage: React.FC<ReadingListPageProps> = ({ setPage }) => {
  const { readings, completedReadings } = useVocabulary();
  const [searchText, setSearchText] = useState('');

  // Group and filter passages
  const filteredReadings = React.useMemo(() => {
    return readings.filter(r => 
      r.title.toLowerCase().includes(searchText.toLowerCase()) ||
      r.content.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [readings, searchText]);

  const groupedReadings = React.useMemo(() => {
    const groups: Record<string, ReadingPassage[]> = {
      'A2': [],
      'B1': [],
      'B2': []
    };
    
    filteredReadings.forEach(r => {
      const lvl = r.level.toUpperCase();
      if (!groups[lvl]) {
        groups[lvl] = [];
      }
      groups[lvl].push(r);
    });

    return groups;
  }, [filteredReadings]);

  const levels = ['A2', 'B1', 'B2'];

  const getLevelDotColor = (level: string) => {
    if (level === 'A2') return '#0ea5e9'; // Light Blue
    if (level === 'B1') return '#8b5cf6'; // Purple
    if (level === 'B2') return '#ec4899'; // Pink
    return 'var(--accent)';
  };

  const handlePassageClick = (passage: ReadingPassage) => {
    setPage({
      type: 'readingDetail',
      passageId: passage.id
    });
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="header-title-container" style={{ textAlign: 'left' }}>
          <span className="header-subtitle">VocaHani - Luyện đọc</span>
          <h1 className="header-title font-heading">Luyện Đọc<br />Từ Vựng</h1>
        </div>
        <img src="/logo.png" alt="VocaHani Logo" className="header-logo" />
      </div>

      {/* Action Banner Card */}
      <div className="glass" style={{ borderRadius: '24px', padding: '20px', marginBottom: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm bài đọc..."
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
      </div>

      {/* Level Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {levels.map(level => {
          const list = groupedReadings[level] || [];
          if (list.length === 0) return null;

          return (
            <div key={level} style={{ textAlign: 'left' }}>
              {/* Level Group Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: getLevelDotColor(level)
                }} />
                <h2 className="font-heading" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-bold)' }}>
                  Trình độ {level}
                </h2>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>({list.length} bài)</span>
              </div>

              {/* Grid of Reading Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '16px'
              }}>
                {list.map(passage => {
                  const score = completedReadings[passage.id];
                  const hasCompleted = score !== undefined;

                  return (
                    <div
                      key={passage.id}
                      className="glass"
                      onClick={() => handlePassageClick(passage)}
                      style={{
                        borderRadius: '20px',
                        padding: '20px',
                        border: '1px solid var(--border)',
                        boxShadow: 'var(--card-shadow)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        transition: 'transform 0.2s, border-color 0.2s'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.borderColor = 'var(--accent)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }}
                    >
                      {/* Card Title & Icon */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 className="font-heading" style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-bold)' }}>
                          {passage.title}
                        </h3>

                        <span className={`font-heading level-${level}`} style={{
                          padding: '4px 10px',
                          borderRadius: '99px',
                          fontSize: '11px',
                          fontWeight: 800
                        }}>
                          {level}
                        </span>
                      </div>

                      {/* Content excerpt snippet */}
                      <p style={{
                        fontSize: '13px',
                        color: 'var(--text-muted)',
                        fontWeight: 500,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {passage.content}
                      </p>

                      {/* Footnotes: details and completed scores */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 'auto',
                        borderTop: '1px solid var(--border)',
                        paddingTop: '12px'
                      }}>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                          <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: '6px' }}>
                            {passage.vocabulary.length} từ khóa
                          </span>
                          <span style={{ backgroundColor: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: '6px' }}>
                            {passage.questions.length} câu hỏi
                          </span>
                        </div>

                        {hasCompleted ? (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            backgroundColor: 'var(--emerald-glow)',
                            color: 'var(--emerald)',
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 800
                          }}>
                            <Award size={12} />
                            <span>Điểm: {score}/5</span>
                          </div>
                        ) : (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: 'var(--accent)',
                            fontSize: '12px',
                            fontWeight: 700
                          }}>
                            <BookOpen size={12} />
                            <span>Đọc bài</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
