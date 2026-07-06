import React, { useState } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { RefreshCcw, AlertTriangle, Book, Heart, BookmarkCheck } from 'lucide-react';

export const StatisticsPage: React.FC = () => {
  const { 
    words, 
    customWords, 
    passedLessons, 
    resetLessonProgress 
  } = useVocabulary();

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Group stats calculations
  const totalWords = words.length;
  const learnedWords = words.filter(w => w.isLearned).length;
  const overallPct = totalWords > 0 ? Math.round((learnedWords / totalWords) * 100) : 0;

  const favoriteCount = words.filter(w => w.isFavorite).length;
  const customCount = customWords.length;

  // Calculate unique topic progress (passed lessons per topic)
  const baseWords = React.useMemo(() => words.filter(w => !w.isCustom), [words]);
  const topicProgressList = React.useMemo(() => {
    const topicWordsMap: Record<string, number> = {};
    baseWords.forEach(w => {
      topicWordsMap[w.topic] = (topicWordsMap[w.topic] || 0) + 1;
    });

    return Object.keys(topicWordsMap).map(topic => {
      const totalTopicWords = topicWordsMap[topic];
      const totalLessons = Math.ceil(totalTopicWords / 10);
      
      // Count passed lessons for this topic
      let passedCount = 0;
      for (let i = 0; i < totalLessons; i++) {
        if (passedLessons.includes(`${topic.toLowerCase()}_${i}`)) {
          passedCount++;
        }
      }

      return {
        topic,
        totalLessons,
        passedCount
      };
    }).sort((a, b) => b.passedCount - a.passedCount);
  }, [baseWords, passedLessons]);

  // SVG Circular Ring parameters
  const radius = 64;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overallPct / 100) * circumference;

  const handleResetProgress = () => {
    resetLessonProgress();
    setShowResetConfirm(false);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <div className="header-title-container" style={{ textAlign: 'left' }}>
          <span className="header-subtitle">VocaHani - Tiến độ</span>
          <h1 className="header-title font-heading">Tiến Độ Học</h1>
        </div>

        {/* Reset Button */}
        <button
          onClick={() => setShowResetConfirm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--rose-glow)',
            color: 'var(--rose)',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <RefreshCcw size={16} />
          <span>Đặt lại tiến trình</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Core Stats Overview block */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          
          {/* Circular progress card */}
          <div className="glass" style={{ borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '28px', boxShadow: 'var(--card-shadow)', textAlign: 'left' }}>
            <div style={{ position: 'relative', width: '140px', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="var(--bg-tertiary)"
                  strokeWidth={strokeWidth}
                />
                {/* Foreground Fill Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="var(--accent)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              {/* Center percentage label */}
              <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="font-heading" style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-bold)', lineHeight: '1' }}>
                  {overallPct}%
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '2px' }}>Hoàn thành</span>
              </div>
            </div>

            <div>
              <h2 className="font-heading" style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-bold)' }}>Tổng quan</h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px', lineHeight: '1.4' }}>
                Bạn đã tích lũy và ghi nhớ thành công <strong>{learnedWords}</strong> trên tổng số <strong>{totalWords}</strong> từ vựng hệ thống.
              </p>
            </div>
          </div>

          {/* Quick Metrics columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            <div className="glass" style={{ borderRadius: '20px', padding: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', textAlign: 'left' }}>
              <Heart size={24} style={{ color: 'var(--rose)' }} />
              <div>
                <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-bold)', display: 'block' }}>{favoriteCount}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Từ yêu thích</span>
              </div>
            </div>

            <div className="glass" style={{ borderRadius: '20px', padding: '20px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '8px', textAlign: 'left' }}>
              <Book size={24} style={{ color: 'var(--accent)' }} />
              <div>
                <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-bold)', display: 'block' }}>{customCount}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Từ cá nhân</span>
              </div>
            </div>
          </div>
        </div>

        {/* Topic Progress Bar Charts */}
        <div className="glass" style={{ borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <BookmarkCheck size={20} style={{ color: 'var(--accent)' }} />
            <h2 className="font-heading" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-bold)' }}>
              Bài học đã thông qua
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {topicProgressList.map(item => {
              const pct = Math.round((item.passedCount / item.totalLessons) * 100);
              
              return (
                <div key={item.topic} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 700 }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-bold)' }}>{item.topic}</span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {item.passedCount}/{item.totalLessons} bài học ({pct}%)
                    </span>
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="progress-bar-container" style={{ height: '8px', backgroundColor: 'var(--bg-tertiary)' }}>
                    <div className="progress-bar-fill" style={{ 
                      width: `${pct}%`, 
                      background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-light) 100%)' 
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reset Confirmation dialog modal */}
      {showResetConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass" style={{ borderRadius: '24px', padding: '32px', maxWidth: '400px', width: '100%', border: '1px solid var(--border)', textAlign: 'center' }}>
            <AlertTriangle size={48} style={{ color: 'var(--rose)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-bold)', marginBottom: '8px' }}>
              Xóa bỏ mọi tiến trình?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.4 }}>
              Hành động này sẽ xóa vĩnh viễn toàn bộ từ đã học, từ yêu thích, các từ tự thêm cá nhân và điểm thi. Bạn có chắc chắn?
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleResetProgress}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--rose)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Đặt lại
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text)',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
