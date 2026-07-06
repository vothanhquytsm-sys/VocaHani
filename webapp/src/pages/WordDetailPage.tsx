import React, { useEffect, useState } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { 
  ArrowLeft, 
  Heart, 
  Volume2, 
  Mic, 
  MicOff, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Award
} from 'lucide-react';

interface WordDetailPageProps {
  topicName: string;
  lessonIndex: number;
  wordId: string;
  setPage: (page: any) => void;
}

export const WordDetailPage: React.FC<WordDetailPageProps> = ({ topicName, lessonIndex, wordId, setPage }) => {
  const { words, toggleFavorite, toggleLearned } = useVocabulary();
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { 
    transcript, 
    isRecording, 
    scoreInfo, 
    startRecording, 
    stopRecording 
  } = useSpeechRecognition();

  // Find all words in this lesson deck
  const deckWords = React.useMemo(() => {
    const topicWords = words.filter(w => w.topic.toLowerCase() === topicName.toLowerCase() && !w.isCustom);
    const start = lessonIndex * 10;
    const end = Math.min(start + 10, topicWords.length);
    return topicWords.slice(start, end);
  }, [words, topicName, lessonIndex]);

  // Track index of current word in deck
  const [currentIndex, setCurrentIndex] = useState(() => {
    const idx = deckWords.findIndex(w => w.id === wordId);
    return idx !== -1 ? idx : 0;
  });

  const activeWord = deckWords[currentIndex];

  // Auto-speak the word when it changes
  useEffect(() => {
    if (activeWord) {
      speak(activeWord.word);
    }
  }, [currentIndex, activeWord, speak]);

  if (!activeWord) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Không tìm thấy từ vựng</p>
        <button className="back-btn" onClick={() => setPage({ type: 'wordList', topicName, lessonIndex })}>
          Quay lại
        </button>
      </div>
    );
  }

  // Example fields splitter
  const exampleEn = activeWord.exampleEnglish;
  const exampleVi = activeWord.exampleVietnamese;

  const allWordsLearned = deckWords.every(w => w.isLearned);
  const isLastWord = currentIndex === deckWords.length - 1;

  const handleNext = () => {
    if (currentIndex < deckWords.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Toggle Learned and Auto-advance
  const handleToggleLearned = () => {
    toggleLearned(activeWord.id);
    if (!activeWord.isLearned) {
      // Auto-advance to next word after 400ms delay if not the last word
      setTimeout(() => {
        if (currentIndex < deckWords.length - 1) {
          setCurrentIndex(prev => prev + 1);
        }
      }, 400);
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording(activeWord.word);
    }
  };

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Upper bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => setPage({ type: 'wordList', topicName, lessonIndex })}>
          <ArrowLeft size={16} />
          <span>Danh sách</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className={`font-heading level-${activeWord.level}`} style={{ padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 800 }}>
            {activeWord.level}
          </span>
          
          <button
            onClick={() => toggleFavorite(activeWord.id)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              color: activeWord.isFavorite ? 'var(--rose)' : 'var(--text-muted)',
              padding: '8px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--card-shadow)'
            }}
          >
            <Heart size={18} fill={activeWord.isFavorite ? 'var(--rose)' : 'transparent'} />
          </button>
        </div>
      </div>

      {/* Main Flashcard Sheet */}
      <div className="glass" style={{ borderRadius: '28px', padding: '32px', textAlign: 'center', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', marginBottom: '24px' }}>
        {/* Glow Spherical Symbol */}
        <div style={{
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-glow) 0%, rgba(255,255,255,0) 100%)',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px var(--accent-glow)',
          fontSize: '2.5rem'
        }}>
          📖
        </div>

        {/* Word Title & IPA */}
        <h1 className="font-heading" style={{ fontSize: '42px', fontWeight: 900, color: 'var(--text-bold)', letterSpacing: '-1px' }}>
          {activeWord.word}
        </h1>
        
        {/* Play Pronunciation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '6px', marginBottom: '24px' }}>
          <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 600 }}>{activeWord.ipa}</span>
          <button
            onClick={() => speak(activeWord.word)}
            disabled={isSpeaking}
            style={{
              background: 'var(--accent-glow)',
              color: 'var(--accent)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              opacity: isSpeaking ? 0.6 : 1
            }}
          >
            <Volume2 size={16} />
          </button>
        </div>

        {/* Translation Meaning */}
        <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '16px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
            Nghĩa tiếng Việt
          </span>
          <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-bold)' }}>
            {activeWord.vietnameseMeaning}
          </p>
        </div>

        {/* Example Sentences */}
        {exampleEn && (
          <div style={{ textAlign: 'left', borderLeft: '3px solid var(--accent)', paddingLeft: '16px', marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-bold)', fontStyle: 'italic' }}>
                "{exampleEn}"
              </p>
              <button
                onClick={() => speak(exampleEn)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                <Volume2 size={14} />
              </button>
            </div>
            {exampleVi && (
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                {exampleVi}
              </p>
            )}
          </div>
        )}

        {/* Pronunciation Practice Microphone */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '12px' }}>
            Luyện phát âm
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleMicPress}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                border: 'none',
                background: isRecording 
                  ? 'linear-gradient(135deg, var(--rose) 0%, var(--rose-light) 100%)' 
                  : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: isRecording ? '0 4px 16px var(--rose-glow)' : '0 4px 16px var(--accent-glow)',
                position: 'relative'
              }}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
              
              {/* Pulsating Ring */}
              {isRecording && (
                <div style={{
                  position: 'absolute',
                  inset: '-6px',
                  borderRadius: '50%',
                  border: '2px solid var(--rose)',
                  animation: 'pulseGlow 1.2s infinite'
                }} />
              )}
            </button>

            {isRecording && (
              <p style={{ fontSize: '13px', color: 'var(--rose)', fontWeight: 700 }}>Đang ghi âm... Hãy đọc to từ trên</p>
            )}

            {/* Score & Feedback Display */}
            {scoreInfo && (
              <div style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', borderRadius: '16px', padding: '16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>Kết quả đọc của bạn:</span>
                  <span className="font-heading" style={{
                    fontSize: '20px',
                    fontWeight: 900,
                    color: scoreInfo.score >= 90 ? 'var(--emerald)' : scoreInfo.score >= 70 ? 'var(--amber)' : 'var(--rose)'
                  }}>
                    {scoreInfo.score}/100
                  </span>
                </div>
                <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-bold)', textAlign: 'left', fontStyle: 'italic', marginBottom: '4px' }}>
                  "{transcript}"
                </p>
                <p style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  textAlign: 'left',
                  color: scoreInfo.score >= 90 ? 'var(--emerald)' : scoreInfo.score >= 70 ? 'var(--amber)' : 'var(--rose)'
                }}>
                  {scoreInfo.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation & Action buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Spelling Test CTA (Shows if last word or all words learned) */}
        {(isLastWord || allWordsLearned) && (
          <button
            onClick={() => setPage({ type: 'test', topicName, lessonIndex })}
            className="font-heading"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '16px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, var(--emerald) 0%, var(--emerald-light) 100%)',
              color: 'white',
              border: 'none',
              fontWeight: 800,
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px var(--emerald-glow)'
            }}
          >
            <Award size={18} />
            <span>Bắt đầu bài kiểm tra ngay!</span>
          </button>
        )}

        {/* Deck Navigation row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              padding: '10px 16px',
              borderRadius: '12px',
              color: 'var(--text)',
              fontSize: '14px',
              fontWeight: 700,
              cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === 0 ? 0.5 : 1
            }}
          >
            <ChevronLeft size={16} />
            <span>Trước</span>
          </button>

          {/* Mark Learned Checkbox */}
          <button
            onClick={handleToggleLearned}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeWord.isLearned ? 'var(--emerald)' : 'var(--bg-secondary)',
              border: activeWord.isLearned ? 'none' : '1px solid var(--border)',
              padding: '10px 20px',
              borderRadius: '99px',
              color: activeWord.isLearned ? 'white' : 'var(--text)',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: activeWord.isLearned ? '0 4px 12px var(--emerald-glow)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            <div style={{
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              border: activeWord.isLearned ? 'none' : '2px solid var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: activeWord.isLearned ? 'white' : 'transparent',
              color: 'var(--emerald)'
            }}>
              {activeWord.isLearned && <Check size={12} strokeWidth={3} />}
            </div>
            <span>Đã học</span>
          </button>

          <button
            onClick={handleNext}
            disabled={currentIndex === deckWords.length - 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              padding: '10px 16px',
              borderRadius: '12px',
              color: 'var(--text)',
              fontSize: '14px',
              fontWeight: 700,
              cursor: currentIndex === deckWords.length - 1 ? 'not-allowed' : 'pointer',
              opacity: currentIndex === deckWords.length - 1 ? 0.5 : 1
            }}
          >
            <span>Sau</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
