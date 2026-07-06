import React, { useState } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { ArrowLeft, Lock, CheckCircle2, Play } from 'lucide-react';

interface TopicsPageProps {
  selectedTopicName?: string;
  setPage: (page: any) => void;
}

export const TopicsPage: React.FC<TopicsPageProps> = ({ selectedTopicName, setPage }) => {
  const { words, passedLessons } = useVocabulary();
  const [activeTopic, setActiveTopic] = useState<string | null>(selectedTopicName || null);

  // Get base non-custom words
  const baseWords = React.useMemo(() => words.filter(w => !w.isCustom), [words]);

  // Group words by topic
  const topicStats = React.useMemo(() => {
    const map: Record<string, { total: number; learned: number; icon: string; gradient: string }> = {};
    
    baseWords.forEach(w => {
      if (!map[w.topic]) {
        const { icon, gradient } = resolveTopicVisuals(w.topic);
        map[w.topic] = { total: 0, learned: 0, icon, gradient };
      }
      map[w.topic].total++;
      if (w.isLearned) map[w.topic].learned++;
    });

    return map;
  }, [baseWords]);

  const uniqueTopics = React.useMemo(() => {
    return Object.keys(topicStats).sort();
  }, [topicStats]);

  // If a topic is selected, compute lessons for it
  const lessons = React.useMemo(() => {
    if (!activeTopic) return [];
    const topicWords = baseWords.filter(w => w.topic.toLowerCase() === activeTopic.toLowerCase());
    const totalWords = topicWords.length;
    const numLessons = Math.ceil(totalWords / 10);
    
    const list = [];
    for (let i = 0; i < numLessons; i++) {
      const start = i * 10;
      const end = Math.min(start + 10, totalWords);
      const lessonWords = topicWords.slice(start, end);
      const learnedCount = lessonWords.filter(w => w.isLearned).length;
      
      // Unlock logic: lesson 0 is always unlocked; other lessons need the previous one passed
      const isUnlocked = i === 0 || passedLessons.includes(`${activeTopic.toLowerCase()}_${i - 1}`);
      const isPassed = passedLessons.includes(`${activeTopic.toLowerCase()}_${i}`);

      list.push({
        index: i,
        title: `Bài học ${i + 1}`,
        total: lessonWords.length,
        learned: learnedCount,
        isUnlocked,
        isPassed
      });
    }
    return list;
  }, [activeTopic, baseWords, passedLessons]);

  function resolveTopicVisuals(topicName: string): { icon: string; gradient: string } {
    const name = topicName.toLowerCase();
    if (name.includes('động vật') || name.includes('animal')) {
      return { icon: '🐾', gradient: 'gradient-blue-teal' };
    }
    if (name.includes('ăn') || name.includes('uống') || name.includes('food')) {
      return { icon: '🍔', gradient: 'gradient-orange-yellow' };
    }
    if (name.includes('gia đình') || name.includes('family')) {
      return { icon: '❤️', gradient: 'gradient-purple-pink' };
    }
    if (name.includes('trường') || name.includes('school')) {
      return { icon: '🎒', gradient: 'gradient-green-forest' };
    }
    if (name.includes('xe') || name.includes('giao thông') || name.includes('travel')) {
      return { icon: '🚗', gradient: 'gradient-blue-teal' };
    }
    if (name.includes('nghề') || name.includes('work') || name.includes('job')) {
      return { icon: '💼', gradient: 'gradient-purple-pink' };
    }
    return { icon: '⭐', gradient: 'gradient-green-forest' };
  }

  // Handle lesson card click
  const handleLessonClick = (lessonIndex: number, isUnlocked: boolean) => {
    if (!isUnlocked || !activeTopic) return;
    setPage({
      type: 'wordList',
      topicName: activeTopic,
      lessonIndex
    });
  };

  if (activeTopic) {
    const stats = topicStats[activeTopic] || { total: 0, learned: 0, icon: '⭐', gradient: 'gradient-green-forest' };
    const pct = stats.total > 0 ? Math.round((stats.learned / stats.total) * 100) : 0;

    return (
      <div>
        {/* Back navigation button */}
        <button className="back-btn" onClick={() => { setActiveTopic(null); setPage({ type: 'topics' }); }}>
          <ArrowLeft size={16} />
          <span>Quay lại chủ đề</span>
        </button>

        {/* Header Details */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
          <span style={{ fontSize: '3rem', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '24px', boxShadow: 'var(--card-shadow)' }}>
            {stats.icon}
          </span>
          <div style={{ textAlign: 'left' }}>
            <h1 className="font-heading" style={{ fontSize: '32px', fontWeight: 900, textTransform: 'capitalize', color: 'var(--text-bold)', marginBottom: '8px' }}>
              {activeTopic}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '14px' }}>
              <span>Đã thuộc: {stats.learned}/{stats.total} từ ({pct}%)</span>
            </div>
          </div>
        </div>

        {/* Lesson List */}
        <h2 className="font-heading" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-bold)', marginBottom: '16px', textAlign: 'left' }}>
          Danh sách bài học
        </h2>
        
        <div className="lessons-list">
          {lessons.map(lesson => (
            <button
              key={lesson.index}
              disabled={!lesson.isUnlocked}
              onClick={() => handleLessonClick(lesson.index, lesson.isUnlocked)}
              className={`lesson-card ${!lesson.isUnlocked ? 'locked' : ''}`}
            >
              <div className="lesson-info">
                <span className="lesson-title font-heading">{lesson.title}</span>
                <span className="lesson-progress">Hoàn thành: {lesson.learned}/{lesson.total} từ</span>
              </div>

              <div className="lesson-status">
                {lesson.isPassed ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald)', fontWeight: 700, fontSize: '13px' }}>
                    <CheckCircle2 size={18} />
                    <span>Đã Đạt</span>
                  </div>
                ) : lesson.isUnlocked ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent)', fontWeight: 700, fontSize: '13px' }}>
                    <Play size={18} />
                    <span>Học ngay</span>
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)' }}>
                    <Lock size={18} />
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Banner */}
      <div className="page-header">
        <div className="header-title-container text-left" style={{ textAlign: 'left' }}>
          <span className="header-subtitle">VocaHani - Chủ đề</span>
          <h1 className="header-title font-heading">Khám Phá<br />Chủ Đề</h1>
        </div>
        <img src="/logo.png" alt="VocaHani Logo" className="header-logo" />
      </div>

      {/* Grid List of Topics */}
      <div className="grid-topics">
        {uniqueTopics.map(topic => {
          const stats = topicStats[topic];
          const pct = Math.round((stats.learned / stats.total) * 100);
          
          return (
            <button
              key={topic}
              onClick={() => setActiveTopic(topic)}
              className={`topic-card ${stats.gradient}`}
            >
              <div className="topic-card-header">
                <span className="topic-card-title font-heading">{topic}</span>
                <span className="topic-card-icon">{stats.icon}</span>
              </div>
              
              <div style={{ marginTop: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, marginBottom: '6px', opacity: 0.9 }}>
                  <span>Tiến độ: {pct}%</span>
                  <span>{stats.learned}/{stats.total} từ</span>
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
