import React, { useState } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useDictionary } from '../hooks/useDictionary';
import { ArrowLeft, BookOpen, Volume2, Save, X, Award, Check } from 'lucide-react';
import { type ReadingPassage } from '../types/Reading';

interface ReadingDetailPageProps {
  passageId: string;
  setPage: (page: any) => void;
}

export const ReadingDetailPage: React.FC<ReadingDetailPageProps> = ({ passageId, setPage }) => {
  const { readings, completedReadings, addCustomWord, words } = useVocabulary();
  const { speak } = useSpeechSynthesis();
  
  // Find current passage
  const passage: ReadingPassage | undefined = React.useMemo(() => {
    return readings.find(r => r.id === passageId);
  }, [readings, passageId]);

  // Extract all plain words in the app for auto-complete/suggestions inside dictionary hook
  const allWordsList = React.useMemo(() => {
    return words.map(w => w.word);
  }, [words]);

  const {
    loading: lookupLoading,
    lookupResult,
    lookup,
    setLookupResult
  } = useDictionary(allWordsList);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Group lookupResult meanings by partOfSpeech
  const groupedMeanings = React.useMemo(() => {
    if (!lookupResult || !lookupResult.meaningsList) return {};
    const groups: { [pos: string]: { posVi: string; meanings: any[] } } = {};
    lookupResult.meaningsList.forEach(m => {
      const pos = m.partOfSpeech || 'other';
      if (!groups[pos]) {
        groups[pos] = {
          posVi: m.vietnamesePOS,
          meanings: []
        };
      }
      groups[pos].meanings.push(m);
    });
    return groups;
  }, [lookupResult]);

  const getAbbreviatedPOS = (pos: string): string => {
    const p = pos.toLowerCase().trim();
    if (p === 'noun') return 'n';
    if (p === 'verb') return 'v';
    if (p === 'adjective') return 'adj';
    if (p === 'adverb') return 'adv';
    if (p === 'preposition') return 'prep';
    if (p === 'pronoun') return 'pron';
    if (p === 'conjunction') return 'conj';
    return p;
  };

  if (!passage) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Không tìm thấy bài luyện đọc</p>
        <button className="back-btn" onClick={() => setPage({ type: 'reading' })}>
          Quay lại
        </button>
      </div>
    );
  }

  const score = completedReadings[passage.id];
  const hasCompleted = score !== undefined;

  // Split paragraph text content into individual clickable words
  const renderParagraph = (paragraphText: string, pIdx: number) => {
    const rawWords = paragraphText.split(/\s+/);
    return (
      <p key={pIdx} style={{ fontSize: '16px', lineHeight: '1.8', color: 'var(--text)', marginBottom: '16px', textAlign: 'left' }}>
        {rawWords.map((rawWord, wIdx) => {
          // Extract word name without ending punctuations for dictionary search
          const cleanWord = rawWord.replace(/^[.,\/#!$%\^&\*;:{}=\-_`~()?"]+|[.,\/#!$%\^&\*;:{}=\-_`~()?"]+$/g, "");
          
          return (
            <span key={wIdx} style={{ display: 'inline-block', marginRight: '4px' }}>
              <span
                onClick={() => cleanWord && lookup(cleanWord)}
                style={{
                  cursor: 'pointer',
                  borderBottom: '1px dashed var(--border)',
                  paddingBottom: '1px',
                  fontWeight: 500,
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--accent)';
                  e.currentTarget.style.borderBottomColor = 'var(--accent)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'inherit';
                  e.currentTarget.style.borderBottomColor = 'var(--border)';
                }}
              >
                {rawWord}
              </span>
            </span>
          );
        })}
      </p>
    );
  };

  const handleSaveToCustom = () => {
    if (!lookupResult) return;
    addCustomWord({
      word: lookupResult.word,
      ipa: lookupResult.ipa,
      vietnameseMeaning: lookupResult.vietnameseMeaning,
      exampleEnglish: lookupResult.exampleEnglish,
      exampleVietnamese: lookupResult.exampleVietnamese,
      topic: 'Luyện đọc',
      level: passage.level,
      symbolName: lookupResult.symbolName
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
      {/* Back Button */}
      <button className="back-btn" onClick={() => setPage({ type: 'reading' })}>
        <ArrowLeft size={16} />
        <span>Danh sách bài đọc</span>
      </button>

      {/* Detail header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`font-heading level-${passage.level}`} style={{ padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 800 }}>
              Trình độ {passage.level}
            </span>
            {hasCompleted && (
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'var(--emerald-glow)',
                color: 'var(--emerald)',
                padding: '4px 10px',
                borderRadius: '99px',
                fontSize: '11px',
                fontWeight: 800
              }}>
                <Award size={12} />
                <span>Điểm đạt: {score}/5</span>
              </span>
            )}
          </div>
          <h1 className="font-heading" style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-bold)', marginTop: '8px' }}>
            {passage.title}
          </h1>
        </div>

        {/* Start Quiz button */}
        <button
          onClick={() => setPage({ type: 'readingQuiz', passageId: passage.id })}
          className="font-heading"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '16px',
            fontWeight: 800,
            fontSize: '14px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px var(--accent-glow)'
          }}
        >
          <BookOpen size={16} />
          <span>Làm bài kiểm tra đọc hiểu</span>
        </button>
      </div>

      {/* Vocabulary highlight panel */}
      <div className="glass" style={{ borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', border: '1px solid var(--border)', textAlign: 'left' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
          Từ khóa quan trọng (Chạm để tra nhanh)
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {passage.vocabulary.map(word => (
            <button
              key={word}
              onClick={() => lookup(word)}
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              {word}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive reading text */}
      <div className="glass" style={{ borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', marginBottom: '32px' }}>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, fontStyle: 'italic', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', textAlign: 'left' }}>
          Mẹo: Chạm vào bất kỳ từ nào dưới đây để tra từ điển offline / dịch nghĩa trực tiếp.
        </p>

        {/* Render content split by paragraph breaks */}
        {passage.content.split(/\n\n+/).map((para, idx) => renderParagraph(para, idx))}
      </div>

      {/* Loading Overlay */}
      {lookupLoading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 90
        }}>
          <div className="glass" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
              animation: 'pulseGlow 1.2s infinite'
            }} />
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-bold)' }}>Đang tra từ điển...</span>
          </div>
        </div>
      )}

      {/* Word Definition Modal Drawer Sheet */}
      {lookupResult && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: 100
        }} onClick={() => setLookupResult(null)}>
          <div
            onClick={e => e.stopPropagation()}
            className="glass"
            style={{
              width: '100%',
              maxWidth: '640px',
              borderTopLeftRadius: '28px',
              borderTopRightRadius: '28px',
              border: '1px solid var(--border)',
              borderBottom: 'none',
              padding: '32px',
              boxShadow: '0 -8px 24px rgba(0,0,0,0.15)',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h2 className="font-heading" style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-bold)', letterSpacing: '-0.5px' }}>
                    {lookupResult.word}
                  </h2>
                  <button
                    onClick={() => speak(lookupResult.word)}
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
                      cursor: 'pointer'
                    }}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
                <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 600 }}>{lookupResult.ipa}</span>
              </div>

              <button
                onClick={() => setLookupResult(null)}
                style={{
                  background: 'var(--bg-tertiary)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-muted)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Translation Meaning */}
            <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {Object.keys(groupedMeanings).length > 0 ? (
                Object.keys(groupedMeanings).map((posKey) => {
                  const group = groupedMeanings[posKey];
                  const abbreviatedPos = getAbbreviatedPOS(posKey);
                  const posTranslation = group.meanings[0]?.vietnameseWordTranslation || lookupResult.vietnameseMeaning;
                  
                  return (
                    <div key={posKey} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          fontWeight: 800, 
                          textTransform: 'uppercase', 
                          color: 'var(--accent)', 
                          backgroundColor: 'var(--accent-glow)',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}>
                          {group.posVi} ({abbreviatedPos})
                        </span>
                        <p style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-bold)', textTransform: 'capitalize', margin: 0 }}>
                          {posTranslation}
                        </p>
                      </div>

                      <ul style={{ paddingLeft: '18px', margin: '4px 0 0', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {group.meanings.slice(0, 2).map((m: any, idx: number) => (
                          <li key={idx} style={{ fontSize: '13px', color: 'var(--text)', fontStyle: 'italic', lineHeight: '1.4' }}>
                            {m.definition}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              ) : (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>
                    Nghĩa tiếng Việt
                  </span>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-bold)', textTransform: 'capitalize', margin: 0 }}>
                    {lookupResult.vietnameseMeaning}
                  </p>
                </div>
              )}
            </div>

            {/* Example sentence */}
            {lookupResult.exampleEnglish && (
              <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-bold)', fontStyle: 'italic' }}>
                    "{lookupResult.exampleEnglish}"
                  </p>
                  <button onClick={() => speak(lookupResult.exampleEnglish)} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                    <Volume2 size={12} />
                  </button>
                </div>
                {lookupResult.exampleVietnamese && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {lookupResult.exampleVietnamese}
                  </p>
                )}
              </div>
            )}

            {/* Save to Custom words button */}
            <button
              onClick={handleSaveToCustom}
              disabled={savedSuccess}
              className="font-heading"
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                background: savedSuccess 
                  ? 'var(--emerald)' 
                  : 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: savedSuccess ? '0 4px 12px var(--emerald-glow)' : '0 4px 12px var(--accent-glow)'
              }}
            >
              {savedSuccess ? (
                <>
                  <Check size={16} strokeWidth={3} />
                  <span>Đã lưu vào Từ của tôi!</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Lưu vào Sổ từ vựng</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
