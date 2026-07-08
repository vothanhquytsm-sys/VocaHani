import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useDictionary } from '../hooks/useDictionary';
import { findSpellingSuggestion } from '../utils/levenshtein';
import { translateText } from '../utils/dictionaryApi';
import { Search, Volume2, Save, ArrowLeft, Plus, Check, X } from 'lucide-react';

export const DictionaryPage: React.FC = () => {
  const { words, addCustomWord } = useVocabulary();
  const { speak } = useSpeechSynthesis();

  const [searchText, setSearchText] = useState('');
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [spellingSuggestion, setSpellingSuggestion] = useState<string | null>(null);
  
  const [searchMode, setSearchMode] = useState<'en-vi' | 'vi-en'>('en-vi');
  const [searchedViWord, setSearchedViWord] = useState<string | null>(null);
  const [loadingViEn, setLoadingViEn] = useState(false);

  const handleSearch = async (text: string) => {
    if (!text.trim()) return;
    
    let searchWord = text.trim();
    if (searchMode === 'vi-en') {
      setLoadingViEn(true);
      try {
        const translated = await translateText(searchWord, 'vi', 'en');
        if (translated) {
          searchWord = translated.trim();
          setSearchedViWord(text.trim());
        }
      } catch (e) {
        console.error('Vietnamese translation failed:', e);
      } finally {
        setLoadingViEn(false);
      }
    } else {
      setSearchedViWord(null);
    }

    if (searchMode === 'en-vi') {
      const suggestion = findSpellingSuggestion(searchWord, allBaseWords);
      setSpellingSuggestion(suggestion);
    } else {
      setSpellingSuggestion(null);
    }
    
    lookup(searchWord);
  };

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
    setSpellingSuggestion(null);
    lookup(word);
  };

  const handleSaveToCustom = () => {
    if (!lookupResult) return;
    const mainMeaning = lookupResult.meaningsList?.[0];
    addCustomWord({
      word: lookupResult.word,
      ipa: lookupResult.ipa,
      vietnameseMeaning: mainMeaning ? mainMeaning.vietnameseDefinition : lookupResult.vietnameseMeaning,
      exampleEnglish: mainMeaning ? (mainMeaning.exampleEnglish || '') : lookupResult.exampleEnglish,
      exampleVietnamese: mainMeaning ? (mainMeaning.exampleVietnamese || '') : lookupResult.exampleVietnamese,
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
          {/* Toggle Search Mode */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
            <button
              onClick={() => {
                setSearchMode('en-vi');
                setSearchText('');
                setLookupResult(null);
                setSearchedViWord(null);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid ' + (searchMode === 'en-vi' ? 'var(--accent)' : 'var(--border)'),
                backgroundColor: searchMode === 'en-vi' ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                color: searchMode === 'en-vi' ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Từ điển Anh - Việt
            </button>
            <button
              onClick={() => {
                setSearchMode('vi-en');
                setSearchText('');
                setLookupResult(null);
                setSearchedViWord(null);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid ' + (searchMode === 'vi-en' ? 'var(--accent)' : 'var(--border)'),
                backgroundColor: searchMode === 'vi-en' ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                color: searchMode === 'vi-en' ? 'var(--accent)' : 'var(--text-muted)',
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Từ điển Việt - Anh
            </button>
          </div>

          {/* Custom Search Input */}
          <div className="glass" style={{ borderRadius: '16px', padding: '16px', border: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder={searchMode === 'en-vi' ? "Nhập từ tiếng Anh để tra cứu..." : "Nhập từ tiếng Việt để tra cứu..."}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchText.trim() && handleSearch(searchText)}
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
              onClick={() => searchText.trim() && handleSearch(searchText)}
              disabled={loading || loadingViEn}
              className="font-heading"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                padding: '0 20px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                opacity: (loading || loadingViEn) ? 0.6 : 1
              }}
            >
              {loadingViEn ? 'Đang dịch...' : loading ? 'Đang tra...' : 'Tra từ'}
            </button>
          </div>

          {/* Vietnamese search translation info banner */}
          {searchedViWord && lookupResult && (
            <div className="glass animate-fade-in" style={{ borderRadius: '12px', padding: '12px 18px', border: '1px solid var(--border)', backgroundColor: 'var(--accent-glow)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px' }}>🔍</span>
              <span style={{ fontSize: '13px', color: 'var(--text-bold)', fontWeight: 600 }}>
                Tìm kiếm: <strong>"{searchedViWord}"</strong> tương đương tiếng Anh là: <strong>"{lookupResult.word}"</strong>
              </span>
            </div>
          )}

          {/* Spelling Suggestion Banner */}
          {spellingSuggestion && (
            <div className="glass animate-fade-in" style={{ borderRadius: '12px', padding: '12px 18px', border: '1px solid var(--border)', backgroundColor: 'var(--accent-glow)', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>✨ Có phải ý bạn là:</span>
              <button
                onClick={() => {
                  setSearchText(spellingSuggestion);
                  setSpellingSuggestion(null);
                  lookup(spellingSuggestion);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent)',
                  fontWeight: 750,
                  fontSize: '13px',
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline'
                }}
              >
                {spellingSuggestion}
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>?</span>
            </div>
          )}

          {/* Autocomplete suggestions list */}
          {searchMode === 'en-vi' && !lookupResult && suggestions.length > 0 && (
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <button className="back-btn" onClick={() => { setLookupResult(null); setSearchText(''); }}>
                <ArrowLeft size={16} />
                <span>Quay lại tra cứu</span>
              </button>

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

            {/* Quick POS Navigation pills */}
            {lookupResult.meaningsList && lookupResult.meaningsList.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
                {Array.from(new Set(lookupResult.meaningsList.map(m => m.vietnamesePOS))).map((pos) => (
                  <button
                    key={pos}
                    onClick={() => {
                      const element = document.getElementById(`pos-${pos}`);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '20px',
                      border: '1px solid var(--accent)',
                      backgroundColor: 'transparent',
                      color: 'var(--accent)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {pos.toLowerCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Word Header & UK/US pronuncation speakers */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 className="font-heading" style={{ fontSize: '32px', fontWeight: 950, color: 'var(--text-bold)', margin: 0, textDecoration: 'underline' }}>
                  {lookupResult.word}
                </h2>
                <span style={{ fontSize: '15px', color: 'var(--text-muted)', fontWeight: 600 }}>{lookupResult.ipa}</span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {/* UK pronunciation */}
                <button
                  onClick={() => {
                    if (lookupResult.audioUk) {
                      new Audio(lookupResult.audioUk).play().catch(() => speak(lookupResult.word));
                    } else {
                      speak(lookupResult.word);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'var(--accent-glow)',
                    color: 'var(--accent)',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <Volume2 size={14} />
                  <span>UK</span>
                </button>

                {/* US pronunciation */}
                <button
                  onClick={() => {
                    if (lookupResult.audioUs) {
                      new Audio(lookupResult.audioUs).play().catch(() => speak(lookupResult.word));
                    } else {
                      speak(lookupResult.word);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'var(--accent-glow)',
                    color: 'var(--accent)',
                    border: 'none',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  <Volume2 size={14} />
                  <span>US</span>
                </button>
              </div>
            </div>

            {/* Flat dictionary list grouped by Part of Speech */}
            {lookupResult.meaningsList && lookupResult.meaningsList.length > 0 && (() => {
              const groups: Record<string, typeof lookupResult.meaningsList> = {};
              lookupResult.meaningsList.forEach(m => {
                if (!groups[m.vietnamesePOS]) {
                  groups[m.vietnamesePOS] = [];
                }
                groups[m.vietnamesePOS].push(m);
              });

              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {Object.keys(groups).map((posKey) => (
                    <div key={posKey} id={`pos-${posKey}`} style={{ textAlign: 'left' }}>
                      {/* Part of Speech Heading */}
                      <h3 style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-bold)', borderBottom: '1px dashed var(--border)', paddingBottom: '4px', marginBottom: '12px', textDecoration: 'underline' }}>
                        {posKey.toLowerCase()}
                      </h3>

                      {/* Meanings sub-items list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '8px' }}>
                        {groups[posKey].map((m, idx) => (
                          <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {/* Definition text prefixed with pink arrow */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                              <span style={{ color: '#d500f9', fontWeight: 900, fontSize: '16px' }}>⇨</span>
                              <div>
                                <span style={{ fontSize: '16px', fontWeight: 800, color: '#d500f9' }}>
                                  {m.vietnameseDefinition}
                                </span>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block', fontStyle: 'italic', marginTop: '2px' }}>
                                  {m.definition}
                                </span>
                              </div>
                            </div>

                            {/* Context Example text */}
                            {m.exampleEnglish && (
                              <div style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ color: '#1976d2', fontWeight: 900, fontSize: '11px' }}>▶</span>
                                  <span 
                                    style={{ fontSize: '14px', fontWeight: 700, color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
                                    onClick={() => speak(m.exampleEnglish!)}
                                  >
                                    {m.exampleEnglish}
                                  </span>
                                </div>
                                {m.exampleVietnamese && (
                                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', paddingLeft: '14px' }}>
                                    {m.exampleVietnamese}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
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
