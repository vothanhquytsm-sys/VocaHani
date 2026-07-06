import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useDictionary } from '../hooks/useDictionary';
import { Search, Volume2, Save, ArrowLeft, Plus, Check, X } from 'lucide-react';

export const DictionaryPage: React.FC = () => {
  const { words, addCustomWord } = useVocabulary();
  const { speak } = useSpeechSynthesis();

  const [searchText, setSearchText] = useState('');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form state for adding custom word manually
  const [newWord, setNewWord] = useState('');
  const [newIpa, setNewIpa] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newExEn, setNewExEn] = useState('');
  const [newExVi, setNewExVi] = useState('');

  // Extract all words in base words database to run prefix autocomplete matching
  const allBaseWords = React.useMemo(() => {
    return words.map(w => w.word);
  }, [words]);

  const {
    suggestions,
    loading,
    lookupResult,
    getSuggestions,
    lookup,
    setLookupResult
  } = useDictionary(allBaseWords);

  // Trigger search suggestion updates on text change
  useEffect(() => {
    getSuggestions(searchText);
  }, [searchText, getSuggestions]);

  const handleSuggestionClick = (word: string) => {
    setSearchText(word);
    lookup(word);
  };

  const handleSaveToCustom = () => {
    if (!lookupResult) return;
    addCustomWord({
      word: lookupResult.word,
      ipa: lookupResult.ipa,
      vietnameseMeaning: lookupResult.vietnameseMeaning,
      exampleEnglish: lookupResult.exampleEnglish,
      exampleVietnamese: lookupResult.exampleVietnamese,
      topic: 'Tra từ điển',
      level: 'A1',
      symbolName: lookupResult.symbolName
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleAddManualWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newMeaning.trim()) return;

    addCustomWord({
      word: newWord,
      ipa: newIpa || '/.../',
      vietnameseMeaning: newMeaning,
      exampleEnglish: newExEn,
      exampleVietnamese: newExVi,
      topic: 'Từ tự thêm',
      level: 'A1',
      symbolName: 'pencil.circle.fill'
    });

    // Reset form
    setNewWord('');
    setNewIpa('');
    setNewMeaning('');
    setNewExEn('');
    setNewExVi('');
    setShowAddSheet(false);
  };

  return (
    <div>
      {/* Header bar */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="header-title-container" style={{ textAlign: 'left' }}>
          <span className="header-subtitle">VocaHani - Từ điển</span>
          <h1 className="header-title font-heading">Tra Từ Điển</h1>
        </div>
        
        {/* Add Word Sheet Button */}
        <button
          onClick={() => setShowAddSheet(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'var(--accent-glow)',
            color: 'var(--accent)',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          <Plus size={16} />
          <span>Thêm từ mới</span>
        </button>
      </div>

      {/* Main Grid View */}
      <div style={{ display: 'grid', gridTemplateColumns: lookupResult ? '1fr' : '1fr', gap: '20px' }}>
        
        {/* Search & Suggestions Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Custom Search Input */}
          <div className="glass" style={{ borderRadius: '16px', padding: '16px', border: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Nhập từ tiếng Anh để tra cứu..."
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchText.trim() && lookup(searchText)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 48px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text-bold)',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>
            
            <button
              onClick={() => searchText.trim() && lookup(searchText)}
              className="font-heading"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                padding: '0 20px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Tra từ
            </button>
          </div>

          {/* Autocomplete suggestions list */}
          {!lookupResult && suggestions.length > 0 && (
            <div className="glass" style={{ borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', textAlign: 'left' }}>
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  style={{
                    width: '100%',
                    padding: '12px 20px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text-bold)',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lookup Detail Result Card */}
        {lookupResult ? (
          <div className="glass animate-fade-in" style={{ borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', textAlign: 'left' }}>
            {/* Back button inside definition */}
            <button className="back-btn" onClick={() => { setLookupResult(null); setSearchText(''); }}>
              <ArrowLeft size={16} />
              <span>Quay lại tra cứu</span>
            </button>

            {/* Word Headers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h2 className="font-heading" style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-bold)', letterSpacing: '-0.5px' }}>
                    {lookupResult.word}
                  </h2>
                  <button
                    onClick={() => speak(lookupResult.word)}
                    style={{
                      background: 'var(--accent-glow)',
                      color: 'var(--accent)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Volume2 size={16} />
                  </button>
                </div>
                <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 600 }}>{lookupResult.ipa}</span>
              </div>

              {/* Save button */}
              <button
                onClick={handleSaveToCustom}
                disabled={savedSuccess}
                className="font-heading"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: savedSuccess ? 'var(--emerald)' : 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: savedSuccess ? '0 4px 12px var(--emerald-glow)' : '0 4px 12px var(--accent-glow)'
                }}
              >
                {savedSuccess ? <Check size={14} strokeWidth={3} /> : <Save size={14} />}
                <span>{savedSuccess ? 'Đã lưu!' : 'Lưu từ của tôi'}</span>
              </button>
            </div>

            {/* Definition Block */}
            <div style={{ backgroundColor: 'var(--bg-tertiary)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Nghĩa tiếng Việt
              </span>
              <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-bold)' }}>
                {lookupResult.vietnameseMeaning}
              </p>
            </div>

            {/* Example sentence block */}
            {lookupResult.exampleEnglish && (
              <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-bold)', fontStyle: 'italic' }}>
                    "{lookupResult.exampleEnglish}"
                  </p>
                  <button onClick={() => speak(lookupResult.exampleEnglish)} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}>
                    <Volume2 size={14} />
                  </button>
                </div>
                {lookupResult.exampleVietnamese && (
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                    {lookupResult.exampleVietnamese}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Empty Search placeholder state */
          searchText.trim() === '' && (
            <div className="glass" style={{ borderRadius: '24px', padding: '64px 32px', border: '1px solid var(--border)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '4.5rem' }}>📚</span>
              <h2 className="font-heading" style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-bold)' }}>
                Từ điển Anh - Việt Offline / Online
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '400px', lineHeight: '1.5' }}>
                Gõ từ tiếng Anh vào ô tìm kiếm ở trên để tra nghĩa Việt, phiên âm IPA, nghe giọng đọc bản xứ và xem các câu ví dụ trực quan.
              </p>
            </div>
          )
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100
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

      {/* Add Custom Word manually Modal Sheet */}
      {showAddSheet && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }} onClick={() => setShowAddSheet(false)}>
          <div
            onClick={e => e.stopPropagation()}
            className="glass"
            style={{
              width: '100%',
              maxWidth: '480px',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              padding: '32px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className="font-heading" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-bold)' }}>
                Thêm từ vựng mới
              </h3>
              <button onClick={() => setShowAddSheet(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddManualWord} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Từ tiếng Anh *</label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={e => setNewWord(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Phiên âm IPA</label>
                <input
                  type="text"
                  value={newIpa}
                  onChange={e => setNewIpa(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Nghĩa dịch tiếng Việt *</label>
                <input
                  type="text"
                  required
                  value={newMeaning}
                  onChange={e => setNewMeaning(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Câu ví dụ tiếng Anh</label>
                <input
                  type="text"
                  value={newExEn}
                  onChange={e => setNewExEn(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Ví dụ dịch tiếng Việt</label>
                <input
                  type="text"
                  value={newExVi}
                  onChange={e => setNewExVi(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                />
              </div>

              <button
                type="submit"
                className="font-heading"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Lưu từ vựng
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
