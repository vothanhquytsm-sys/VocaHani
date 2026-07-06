import React, { useState, useRef } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { lookupDictionary } from '../utils/dictionaryApi';
import { parseCSV, generateCSV } from '../utils/csvParser';
import { 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Edit3, 
  Check, 
  Volume2, 
  X, 
  Search
} from 'lucide-react';
import { type Word } from '../types/Word';

export const CustomWordsPage: React.FC = () => {
  const { 
    customWords, 
    addCustomWord, 
    updateCustomWord, 
    deleteCustomWord, 
    toggleLearned,
    importCustomWords 
  } = useVocabulary();

  const { speak } = useSpeechSynthesis();
  
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<'all' | 'unlearned' | 'learned'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  // Form states
  const [wordText, setWordText] = useState('');
  const [ipaText, setIpaText] = useState('');
  const [meaningText, setMeaningText] = useState('');
  const [exEnText, setExEnText] = useState('');
  const [exViText, setExViText] = useState('');
  const [topicText, setTopicText] = useState('Từ của tôi');

  const [lookupLoading, setLookupLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter custom words
  const filteredWords = React.useMemo(() => {
    return customWords.filter(w => {
      const matchesSearch = 
        w.word.toLowerCase().includes(searchText.toLowerCase()) ||
        w.vietnameseMeaning.toLowerCase().includes(searchText.toLowerCase());
      
      if (filter === 'learned') return matchesSearch && w.isLearned;
      if (filter === 'unlearned') return matchesSearch && !w.isLearned;
      return matchesSearch;
    });
  }, [customWords, searchText, filter]);

  // Total learned statistics count
  const learnedCount = React.useMemo(() => {
    return customWords.filter(w => w.isLearned).length;
  }, [customWords]);

  // Fast Dictionary Lookup trigger
  const handleQuickLookup = async () => {
    if (!wordText.trim()) return;
    setLookupLoading(true);
    try {
      const res = await lookupDictionary(wordText);
      setIpaText(res.ipa);
      setMeaningText(res.vietnameseMeaning);
      setExEnText(res.exampleEnglish);
      setExViText(res.exampleVietnamese);
    } catch (e) {
      console.error(e);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setWordText('');
    setIpaText('');
    setMeaningText('');
    setExEnText('');
    setExViText('');
    setTopicText('Từ của tôi');
    setShowAddModal(true);
  };

  const handleOpenEdit = (w: Word) => {
    setEditingWord(w);
    setWordText(w.word);
    setIpaText(w.ipa);
    setMeaningText(w.vietnameseMeaning);
    setExEnText(w.exampleEnglish);
    setExViText(w.exampleVietnamese);
    setTopicText(w.topic);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordText.trim() || !meaningText.trim()) return;

    const data = {
      word: wordText,
      ipa: ipaText || '/.../',
      vietnameseMeaning: meaningText,
      exampleEnglish: exEnText,
      exampleVietnamese: exViText,
      topic: topicText || 'Từ của tôi',
      level: 'A1',
      symbolName: 'pencil.circle.fill'
    };

    if (editingWord) {
      updateCustomWord(editingWord.id, data);
      setEditingWord(null);
    } else {
      addCustomWord(data);
      setShowAddModal(false);
    }
  };

  // Import handler (FileReader API)
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(content);
          importCustomWords(parsed);
        } catch (err) {
          alert('Sai định dạng JSON!');
        }
      } else if (file.name.endsWith('.csv')) {
        const parsed = parseCSV(content);
        importCustomWords(parsed);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Export JSON or CSV handler
  const handleExport = (format: 'json' | 'csv') => {
    if (customWords.length === 0) {
      alert('Không có từ vựng nào để xuất!');
      return;
    }
    
    let content = '';
    let type = 'text/plain';
    let filename = `VocaHani_CustomWords.${format}`;

    if (format === 'json') {
      content = JSON.stringify(customWords, null, 2);
      type = 'application/json';
    } else {
      content = generateCSV(customWords);
      type = 'text/csv;charset=utf-8;';
    }

    const blob = new Blob([content], { type });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div className="header-title-container" style={{ textAlign: 'left' }}>
          <span className="header-subtitle">VocaHani - Cá nhân</span>
          <h1 className="header-title font-heading">Từ Của Tôi</h1>
        </div>

        {/* Action Buttons Header */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={handleOpenAdd} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--accent)', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            <Plus size={16} />
            <span>Thêm từ</span>
          </button>

          <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
            <Upload size={16} />
            <span>Nhập tệp</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json,.csv" style={{ display: 'none' }} />

          {/* Export options */}
          <div style={{ display: 'flex', gap: '4px' }}>
            <button onClick={() => handleExport('json')} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              <Download size={14} />
              <span>JSON</span>
            </button>
            <button onClick={() => handleExport('csv')} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)', padding: '10px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
              <Download size={14} />
              <span>CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics & Search Bar Card */}
      <div className="glass" style={{ borderRadius: '24px', padding: '24px', marginBottom: '24px', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm kiếm từ hoặc nghĩa..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
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

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setFilter('all')} style={{ padding: '6px 16px', borderRadius: '99px', border: filter === 'all' ? 'none' : '1px solid var(--border)', backgroundColor: filter === 'all' ? 'var(--accent)' : 'var(--bg)', color: filter === 'all' ? 'white' : 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Tất cả ({customWords.length})
            </button>
            <button onClick={() => setFilter('unlearned')} style={{ padding: '6px 16px', borderRadius: '99px', border: filter === 'unlearned' ? 'none' : '1px solid var(--border)', backgroundColor: filter === 'unlearned' ? 'var(--accent)' : 'var(--bg)', color: filter === 'unlearned' ? 'white' : 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Cần học ({customWords.length - learnedCount})
            </button>
            <button onClick={() => setFilter('learned')} style={{ padding: '6px 16px', borderRadius: '99px', border: filter === 'learned' ? 'none' : '1px solid var(--border)', backgroundColor: filter === 'learned' ? 'var(--accent)' : 'var(--bg)', color: filter === 'learned' ? 'white' : 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              Đã thuộc ({learnedCount})
            </button>
          </div>

          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
            Đã thuộc {learnedCount}/{customWords.length} từ
          </span>
        </div>
      </div>

      {/* Words Grid List */}
      {filteredWords.length === 0 ? (
        <div className="glass" style={{ borderRadius: '24px', padding: '64px 32px', border: '1px solid var(--border)', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>📝</span>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bold)' }}>Sổ từ vựng trống</p>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Nhấp nút Thêm từ hoặc Nhập tệp ở góc trên để bổ sung từ vựng của bạn.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', textAlign: 'left' }}>
          {filteredWords.map(w => (
            <div
              key={w.id}
              className="glass"
              style={{
                borderRadius: '20px',
                padding: '20px',
                border: '1px solid var(--border)',
                boxShadow: 'var(--card-shadow)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              {/* Card Header details */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 className="font-heading" style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-bold)' }}>{w.word}</h3>
                    <button onClick={() => speak(w.word)} style={{ background: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', display: 'flex' }}>
                      <Volume2 size={16} />
                    </button>
                  </div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{w.ipa}</span>
                </div>

                {/* Edit / Delete actions */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleOpenEdit(w)} style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '6px', borderRadius: '8px', color: 'var(--text)', cursor: 'pointer' }}>
                    <Edit3 size={14} />
                  </button>
                  <button onClick={() => deleteCustomWord(w.id)} style={{ background: 'var(--bg-tertiary)', border: 'none', padding: '6px', borderRadius: '8px', color: 'var(--rose)', cursor: 'pointer' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Translation */}
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: '10px' }}>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>Nghĩa Việt</span>
                <p style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-bold)' }}>{w.vietnameseMeaning}</p>
              </div>

              {/* Example */}
              {w.exampleEnglish && (
                <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <span style={{ fontStyle: 'italic', fontWeight: 700, color: 'var(--text-bold)' }}>"{w.exampleEnglish}"</span>
                  {w.exampleVietnamese && <span style={{ color: 'var(--text-muted)' }}>{w.exampleVietnamese}</span>}
                </div>
              )}

              {/* Bottom toggle learned bar */}
              <div style={{ marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {w.topic}
                </span>

                <button
                  onClick={() => toggleLearned(w.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: w.isLearned ? 'var(--emerald)' : 'transparent',
                    border: w.isLearned ? 'none' : '1px solid var(--border)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    color: w.isLearned ? 'white' : 'var(--text-muted)',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: w.isLearned ? '0 4px 10px var(--emerald-glow)' : 'none'
                  }}
                >
                  <Check size={12} strokeWidth={3} />
                  <span>{w.isLearned ? 'Đã thuộc' : 'Chưa thuộc'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit manual form sheet */}
      {(showAddModal || editingWord !== null) && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }} onClick={() => { setShowAddModal(false); setEditingWord(null); }}>
          
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
                {editingWord ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}
              </h3>
              <button onClick={() => { setShowAddModal(false); setEditingWord(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Từ tiếng Anh *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    value={wordText}
                    onChange={e => setWordText(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                  />
                  <button
                    type="button"
                    onClick={handleQuickLookup}
                    disabled={lookupLoading}
                    style={{
                      backgroundColor: 'var(--accent-glow)',
                      color: 'var(--accent)',
                      border: 'none',
                      padding: '0 16px',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {lookupLoading ? 'Tra...' : 'Tra nhanh'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Phiên âm IPA</label>
                <input
                  type="text"
                  value={ipaText}
                  onChange={e => setIpaText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Nghĩa dịch tiếng Việt *</label>
                <input
                  type="text"
                  required
                  value={meaningText}
                  onChange={e => setMeaningText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Câu ví dụ tiếng Anh</label>
                <input
                  type="text"
                  value={exEnText}
                  onChange={e => setExEnText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Ví dụ dịch tiếng Việt</label>
                <input
                  type="text"
                  value={exViText}
                  onChange={e => setExViText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Chủ đề (Nhãn phân loại)</label>
                <input
                  type="text"
                  value={topicText}
                  onChange={e => setTopicText(e.target.value)}
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
                {editingWord ? 'Cập nhật thay đổi' : 'Lưu từ vựng'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
