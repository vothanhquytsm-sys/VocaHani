import React, { useState, useEffect, useRef } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { ArrowLeft, RotateCw, RefreshCw } from 'lucide-react';
import { type Word } from '../types/Word';

interface FlashcardPageProps {
  topicName: string;
  lessonIndex: number;
  setPage: (page: any) => void;
}

export const FlashcardPage: React.FC<FlashcardPageProps> = ({ topicName, lessonIndex, setPage }) => {
  const { words, rateWordQuality } = useVocabulary();
  const { speak } = useSpeechSynthesis();

  // Load and shuffle cards
  const [deck, setDeck] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [rememberedCount, setRememberedCount] = useState(0);

  // Drag coordinates state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Animation triggers
  const [exitDirection, setExitDirection] = useState<'left' | 'right' | null>(null);

  // Shuffle array helper
  const shuffleDeck = () => {
    const topicWords = words.filter(w => w.topic.toLowerCase() === topicName.toLowerCase() && !w.isCustom);
    const start = lessonIndex * 10;
    const end = Math.min(start + 10, topicWords.length);
    const subset = topicWords.slice(start, end);
    
    // Fisher-Yates Shuffle
    const shuffled = [...subset];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionFinished(false);
    setRememberedCount(0);
  };

  useEffect(() => {
    shuffleDeck();
  }, [words, topicName, lessonIndex]);

  const activeWord = deck[currentIndex];

  // TTS speak when word changes
  useEffect(() => {
    if (activeWord && !sessionFinished) {
      speak(activeWord.word);
    }
  }, [currentIndex, activeWord, sessionFinished, speak]);

  if (deck.length === 0) return null;

  // Rating buttons logic
  const handleRating = (quality: number) => {
    if (!activeWord) return;
    rateWordQuality(activeWord.id, quality);
    
    if (quality >= 3) {
      setRememberedCount(prev => prev + 1);
    }

    // Trigger sliding animation
    setExitDirection(quality >= 3 ? 'right' : 'left');

    setTimeout(() => {
      setExitDirection(null);
      setDragOffset({ x: 0, y: 0 });
      setIsFlipped(false);
      
      if (currentIndex < deck.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setSessionFinished(true);
      }
    }, 250);
  };

  // Pointer drag/swipe events
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isFlipped) return; // Prevent swiping if rating buttons are showing
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setDragOffset({ x: dx, y: dy });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);

    const threshold = 120;
    if (dragOffset.x > threshold) {
      handleRating(4); // Remembered
    } else if (dragOffset.x < -threshold) {
      handleRating(1); // Forgotten
    } else {
      // Snap back
      setDragOffset({ x: 0, y: 0 });
    }
  };

  if (sessionFinished) {
    const pct = Math.round((rememberedCount / deck.length) * 100);
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'center', padding: '24px' }}>
        <div className="glass" style={{ borderRadius: '24px', padding: '40px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
          <span style={{ fontSize: '4.5rem', display: 'block', marginBottom: '16px' }}>👑</span>
          <h1 className="font-heading" style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-bold)', marginBottom: '8px' }}>
            Đã hoàn thành!
          </h1>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '15px', marginBottom: '24px' }}>
            Bạn đã ghi nhớ được {rememberedCount}/{deck.length} từ vựng ({pct}%)
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={shuffleDeck}
              className="font-heading"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                color: 'white',
                border: 'none',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} />
              <span>Học lại lượt này</span>
            </button>

            <button
              onClick={() => setPage({ type: 'wordList', topicName, lessonIndex })}
              className="font-heading"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: 'var(--bg-tertiary)',
                color: 'var(--text-bold)',
                border: '1px solid var(--border)',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              Quay về danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Styles for swipe triggers
  const rotation = dragOffset.x / 15;
  const cardStyle: React.CSSProperties = {
    transform: exitDirection === 'left'
      ? 'translateX(-600px) rotate(-20deg)'
      : exitDirection === 'right'
      ? 'translateX(600px) rotate(20deg)'
      : `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg)`,
    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
    touchAction: 'none',
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => setPage({ type: 'wordList', topicName, lessonIndex })}>
          <ArrowLeft size={16} />
          <span>Danh sách</span>
        </button>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>
          Thẻ {currentIndex + 1}/{deck.length}
        </span>
      </div>

      {/* 3D Flashcard container */}
      <div style={{ perspective: '1000px', width: '100%', height: '360px', position: 'relative', marginBottom: '24px' }}>
        
        {/* Swiping HUD overlays */}
        {dragOffset.x > 30 && (
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            color: 'var(--emerald)',
            border: '4px solid var(--emerald)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontWeight: 900,
            fontSize: '24px',
            transform: 'rotate(-12deg)',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            NHỚ
          </div>
        )}

        {dragOffset.x < -30 && (
          <div style={{
            position: 'absolute',
            top: '24px',
            right: '24px',
            color: 'var(--rose)',
            border: '4px solid var(--rose)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontWeight: 900,
            fontSize: '24px',
            transform: 'rotate(12deg)',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            QUÊN
          </div>
        )}

        {/* The Card Element */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={cardStyle}
          className="topic-card-container"
        >
          <div 
            onClick={() => !isDragging && setIsFlipped(!isFlipped)}
            style={{
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transition: 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              position: 'relative'
            }}
          >
            {/* Front Side */}
            <div className="glass" style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              borderRadius: '24px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border)'
            }}>
              <span className={`font-heading level-${activeWord.level}`} style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                fontSize: '11px',
                fontWeight: 800,
                padding: '4px 10px',
                borderRadius: '99px'
              }}>
                {activeWord.level}
              </span>

              <span style={{ fontSize: '3rem', marginBottom: '16px' }}>📖</span>
              <h2 className="font-heading" style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-bold)', letterSpacing: '-1px' }}>
                {activeWord.word}
              </h2>
              <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>
                {activeWord.ipa}
              </span>

              <div style={{ position: 'absolute', bottom: '20px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                <RotateCw size={12} />
                <span>Chạm để lật thẻ</span>
              </div>
            </div>

            {/* Back Side */}
            <div className="glass" style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              borderRadius: '24px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: 'var(--card-shadow)',
              border: '1px solid var(--border)',
              textAlign: 'left'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Định nghĩa
              </span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-bold)', marginBottom: '16px', marginTop: '4px' }}>
                {activeWord.vietnameseMeaning}
              </h3>

              {activeWord.exampleEnglish && (
                <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '12px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-bold)', fontStyle: 'italic' }}>
                    "{activeWord.exampleEnglish}"
                  </p>
                  {activeWord.exampleVietnamese && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {activeWord.exampleVietnamese}
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* SM-2 Spaced Repetition Quality buttons */}
      {isFlipped ? (
        <div className="glass" style={{
          borderRadius: '20px',
          padding: '16px',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxShadow: 'var(--card-shadow)'
        }}>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'center' }}>
            Đánh giá độ nhớ từ vựng
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            <button onClick={() => handleRating(0)} style={{ backgroundColor: 'var(--bg-tertiary)', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: 'var(--rose)' }}>Quên</button>
            <button onClick={() => handleRating(1)} style={{ backgroundColor: 'var(--bg-tertiary)', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: 'var(--rose-light)' }}>Mơ hồ</button>
            <button onClick={() => handleRating(2)} style={{ backgroundColor: 'var(--bg-tertiary)', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: 'var(--amber)' }}>Nhắc nhớ</button>
            <button onClick={() => handleRating(3)} style={{ backgroundColor: 'var(--bg-tertiary)', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: 'var(--text)' }}>Nhớ chậm</button>
            <button onClick={() => handleRating(4)} style={{ backgroundColor: 'var(--bg-tertiary)', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: 'var(--accent)' }}>Nhớ tốt</button>
            <button onClick={() => handleRating(5)} style={{ backgroundColor: 'var(--bg-tertiary)', border: 'none', padding: '10px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', color: 'var(--emerald)' }}>Nhớ ngay</button>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'center' }}>
          Chạm để lật thẻ. Vuốt PHẢI để ghi nhớ, TRÁI để bỏ qua.
        </p>
      )}
    </div>
  );
};
