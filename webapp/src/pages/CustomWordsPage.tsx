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
  Search,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Play,
  RotateCw
} from 'lucide-react';
import { type Word } from '../types/Word';
import { type WordAlbum } from '../types/WordAlbum';

interface CustomWordsPageProps {
  setPage: (page: any) => void;
}

const EMOJI_OPTIONS = ['📂', '📚', '🌟', '🎒', '🐾', '🍔', '❤️', '💼', '🎓', '💻', '🗣️', '🧪', '✈️', '🌍', '🔥'];

export const CustomWordsPage: React.FC<CustomWordsPageProps> = ({ setPage }) => {
  const { 
    customWords, 
    addCustomWord, 
    updateCustomWord, 
    deleteCustomWord, 
    toggleLearned,
    importCustomWords,
    albums,
    addAlbum,
    deleteAlbum,
    updateAlbum
  } = useVocabulary();

  const { speak } = useSpeechSynthesis();
  
  // Navigation states
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  
  // Search and Filter states
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<'all' | 'unlearned' | 'learned'>('all');
  
  // Modal toggles
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showStudyDrawer, setShowStudyDrawer] = useState(false);
  
  // Edit states
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [editingAlbum, setEditingAlbum] = useState<WordAlbum | null>(null);

  // Form states - Words
  const [wordText, setWordText] = useState('');
  const [ipaText, setIpaText] = useState('');
  const [meaningText, setMeaningText] = useState('');
  const [exEnText, setExEnText] = useState('');
  const [exViText, setExViText] = useState('');

  // Form states - Albums
  const [albumNameInput, setAlbumNameInput] = useState('');
  const [albumDescInput, setAlbumDescInput] = useState('');
  const [albumEmojiInput, setAlbumEmojiInput] = useState('📂');

  const [lookupLoading, setLookupLoading] = useState(false);
  const [batchInput, setBatchInput] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve current active album
  const currentAlbum = React.useMemo(() => {
    return albums.find(a => a.id === selectedAlbumId) || null;
  }, [albums, selectedAlbumId]);

  // Filter words belonging to current album
  const albumWords = React.useMemo(() => {
    if (!currentAlbum) return [];
    return customWords.filter(w => w.topic.toLowerCase() === currentAlbum.name.toLowerCase());
  }, [customWords, currentAlbum]);

  // Apply filters on current album words
  const filteredWords = React.useMemo(() => {
    return albumWords.filter(w => {
      const matchesSearch = 
        w.word.toLowerCase().includes(searchText.toLowerCase()) ||
        w.vietnameseMeaning.toLowerCase().includes(searchText.toLowerCase());
      
      if (filter === 'learned') return matchesSearch && w.isLearned;
      if (filter === 'unlearned') return matchesSearch && !w.isLearned;
      return matchesSearch;
    });
  }, [albumWords, searchText, filter]);

  // Stats
  const learnedCount = React.useMemo(() => {
    return albumWords.filter(w => w.isLearned).length;
  }, [albumWords]);

  // Auto divide album words into lessons (10 words per lesson)
  const albumLessons = React.useMemo(() => {
    const total = albumWords.length;
    const lessonsCount = Math.ceil(total / 10);
    const list = [];
    for (let i = 0; i < lessonsCount; i++) {
      list.push({
        index: i,
        name: `Bài học ${i + 1}`,
        range: `Từ ${i * 10 + 1} - ${Math.min((i + 1) * 10, total)}`
      });
    }
    return list;
  }, [albumWords]);

  // Quick Dictionary Lookup helper
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

  // Add/Edit custom word submit
  const handleSaveWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordText.trim() || !meaningText.trim() || !currentAlbum) return;

    const wordData = {
      word: wordText.trim(),
      ipa: ipaText.trim() || '/.../',
      vietnameseMeaning: meaningText.trim(),
      exampleEnglish: exEnText.trim(),
      exampleVietnamese: exViText.trim(),
      topic: currentAlbum.name, // Set topic directly to album name!
      level: 'A1',
      symbolName: 'pencil.circle.fill'
    };

    if (editingWord) {
      updateCustomWord(editingWord.id, wordData);
    } else {
      addCustomWord(wordData);
    }

    setShowAddModal(false);
    setWordText('');
    setIpaText('');
    setMeaningText('');
    setExEnText('');
    setExViText('');
    setEditingWord(null);
  };

  // Batch import text submit
  const handleBatchImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchInput.trim() || !currentAlbum) return;

    setBatchLoading(true);
    const lines = batchInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const wordsToImport: Partial<Word>[] = [];

    try {
      await Promise.all(
        lines.map(async line => {
          let word = line;
          let customMeaning = '';

          const separatorMatch = line.match(/^([^|:-]+)[|:-](.+)$/);
          if (separatorMatch) {
            word = separatorMatch[1].trim();
            customMeaning = separatorMatch[2].trim();
          }

          try {
            const res = await lookupDictionary(word);
            wordsToImport.push({
              word,
              ipa: res.ipa || '/.../',
              vietnameseMeaning: customMeaning || res.vietnameseMeaning || 'Nghĩa trống',
              exampleEnglish: res.exampleEnglish || '',
              exampleVietnamese: res.exampleVietnamese || '',
              topic: currentAlbum.name, // Bind to current album topic!
              level: 'A1'
            });
          } catch (err) {
            wordsToImport.push({
              word,
              ipa: '/.../',
              vietnameseMeaning: customMeaning || 'Không tìm thấy định nghĩa',
              exampleEnglish: '',
              exampleVietnamese: '',
              topic: currentAlbum.name,
              level: 'A1'
            });
          }
        })
      );

      importCustomWords(wordsToImport);
      setShowBatchModal(false);
      setBatchInput('');
    } catch (err) {
      console.error('Batch import error:', err);
    } finally {
      setBatchLoading(false);
    }
  };

  // Save/Create Album submit
  const handleSaveAlbum = (e: React.FormEvent) => {
    e.preventDefault();
    if (!albumNameInput.trim()) return;

    if (editingAlbum) {
      updateAlbum(editingAlbum.id, albumNameInput.trim(), albumDescInput.trim(), albumEmojiInput);
    } else {
      addAlbum(albumNameInput.trim(), albumDescInput.trim(), albumEmojiInput);
    }

    setShowAlbumModal(false);
    setAlbumNameInput('');
    setAlbumDescInput('');
    setAlbumEmojiInput('📂');
    setEditingAlbum(null);
  };

  // Import JSON/CSV file helper
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentAlbum) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        let imported: Partial<Word>[] = [];
        if (file.name.endsWith('.json')) {
          imported = JSON.parse(content);
        } else if (file.name.endsWith('.csv')) {
          imported = parseCSV(content);
        }

        // Force bind imported words to current album
        const mapped = imported.map(w => ({
          ...w,
          topic: currentAlbum.name
        }));

        importCustomWords(mapped);
      } catch (err) {
        alert('Tệp dữ liệu không hợp lệ.');
      }
    };
    reader.readAsText(file);
  };

  // Export JSON/CSV file helper
  const handleExportFile = (format: 'json' | 'csv') => {
    if (!currentAlbum) return;
    let dataStr = '';
    let filename = '';

    if (format === 'json') {
      dataStr = JSON.stringify(albumWords, null, 2);
      filename = `${currentAlbum.name}_vocab.json`;
    } else {
      dataStr = generateCSV(albumWords);
      filename = `${currentAlbum.name}_vocab.csv`;
    }

    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      {/* CASE A: NO ALBUM SELECTED - SHOW ALBUMS LIST GRID */}
      {!selectedAlbumId ? (
        <div>
          {/* Header */}
          <div className="page-header" style={{ marginBottom: '24px' }}>
            <div className="header-title-container" style={{ textAlign: 'left' }}>
              <span className="header-subtitle">VocaHani - Cá nhân</span>
              <h1 className="header-title font-heading">Album Từ Vựng</h1>
            </div>

            <button 
              onClick={() => {
                setEditingAlbum(null);
                setAlbumNameInput('');
                setAlbumDescInput('');
                setAlbumEmojiInput('📂');
                setShowAlbumModal(true);
              }} 
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}
            >
              <Plus size={16} />
              <span>Tạo Album mới</span>
            </button>
          </div>

          {/* Albums grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px', textAlign: 'left' }}>
            {albums.map(album => {
              const count = customWords.filter(w => w.topic.toLowerCase() === album.name.toLowerCase()).length;
              return (
                <div 
                  key={album.id}
                  className="glass card-hover"
                  onClick={() => setSelectedAlbumId(album.id)}
                  style={{
                    borderRadius: '24px',
                    padding: '24px',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    height: '180px'
                  }}
                >
                  <div>
                    {/* Icon & Count */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{ fontSize: '2.5rem' }}>{album.symbolName || '📂'}</span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 750,
                        backgroundColor: 'var(--accent-glow)',
                        color: 'var(--accent)',
                        padding: '4px 10px',
                        borderRadius: '20px'
                      }}>
                        {count} từ vựng
                      </span>
                    </div>

                    {/* Album Info */}
                    <h3 className="font-heading" style={{ fontSize: '16px', fontWeight: 900, color: 'var(--text-bold)', margin: '0 0 4px 0', textTransform: 'capitalize' }}>
                      {album.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {album.description || 'Không có mô tả.'}
                    </p>
                  </div>

                  {/* Album Action Buttons */}
                  {album.id !== 'default_album' && (
                    <div 
                      style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '6px' }}
                      onClick={e => e.stopPropagation()} // Stop bubbling
                    >
                      <button
                        onClick={() => {
                          setEditingAlbum(album);
                          setAlbumNameInput(album.name);
                          setAlbumDescInput(album.description || '');
                          setAlbumEmojiInput(album.symbolName);
                          setShowAlbumModal(true);
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa album "${album.name}" và toàn bộ từ vựng bên trong?`)) {
                            deleteAlbum(album.id);
                          }
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--rose)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* CASE B: ALBUM IS SELECTED - SHOW ALBUM DETAIL VIEW (WORDS & STUDY DRILLS) */
        <div>
          {/* Header Nav */}
          <button
            onClick={() => {
              setSelectedAlbumId(null);
              setShowStudyDrawer(false);
              setSearchText('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              background: 'transparent',
              color: 'var(--accent)',
              fontWeight: 750,
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Quay lại danh sách Album</span>
          </button>

          {/* Album Banner */}
          <div className="glass" style={{ borderRadius: '24px', padding: '24px', border: '1px solid var(--border)', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '3.5rem' }}>{currentAlbum?.symbolName}</span>
              <div>
                <h2 className="font-heading" style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-bold)', textTransform: 'capitalize', margin: 0 }}>
                  {currentAlbum?.name}
                </h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                  {currentAlbum?.description || 'Album từ vựng tự biên soạn.'}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => {
                  setEditingWord(null);
                  setWordText('');
                  setIpaText('');
                  setMeaningText('');
                  setExEnText('');
                  setExViText('');
                  setShowAddModal(true);
                }} 
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700 }}
              >
                <Plus size={16} />
                <span>Thêm từ</span>
              </button>

              <button 
                onClick={() => setShowBatchModal(true)} 
                className="btn"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text)', padding: '10px 14px', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                <Plus size={16} />
                <span>Nhập hàng loạt</span>
              </button>

              <button 
                onClick={() => setShowStudyDrawer(!showStudyDrawer)}
                className="btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  border: 'none',
                  backgroundColor: 'var(--emerald-glow)',
                  color: 'var(--emerald)',
                  padding: '10px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: 750,
                  cursor: 'pointer'
                }}
              >
                <GraduationCap size={16} />
                <span>Học tập & Kiểm tra</span>
              </button>
            </div>
          </div>

          {/* Study Drawer (Auto Lessons grid) */}
          {showStudyDrawer && (
            <div className="glass animate-fade-in" style={{ borderRadius: '24px', padding: '24px', border: '2px solid var(--emerald)', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="font-heading" style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-bold)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🎯</span> Phân loại bài học Album
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  (Hệ thống tự động chia 10 từ mỗi bài học)
                </span>
              </div>

              {albumWords.length === 0 ? (
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '12px 0 0 0' }}>
                  Hãy thêm ít nhất 1 từ vựng vào Album này để bắt đầu kích hoạt bài học ôn tập.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                  {albumLessons.map(lesson => (
                    <div 
                      key={lesson.index} 
                      style={{
                        backgroundColor: 'var(--bg)',
                        borderRadius: '16px',
                        padding: '16px',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: 'var(--text-bold)' }}>{lesson.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{lesson.range}</span>
                      </div>

                      {/* Study Options */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                        <button
                          onClick={() => setPage({ type: 'wordList', topicName: currentAlbum!.name, lessonIndex: lesson.index })}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-bold)',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <BookOpen size={14} />
                          <span>Học từ</span>
                        </button>

                        <button
                          onClick={() => setPage({ type: 'flashcards', topicName: currentAlbum!.name, lessonIndex: lesson.index })}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'var(--accent-glow)',
                            color: 'var(--accent)',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <RotateCw size={14} />
                          <span>Flashcards</span>
                        </button>

                        <button
                          onClick={() => setPage({ type: 'test', topicName: currentAlbum!.name, lessonIndex: lesson.index })}
                          style={{
                            padding: '8px 4px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'var(--emerald-glow)',
                            color: 'var(--emerald)',
                            fontSize: '11px',
                            fontWeight: 750,
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Play size={14} />
                          <span>Làm test</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search, filters, import / export */}
          <div className="glass" style={{ borderRadius: '24px', padding: '24px', border: '1px solid var(--border)', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

            {/* Filter Pills / Import & Export options row */}
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setFilter('all')} style={{ padding: '6px 16px', borderRadius: '99px', border: filter === 'all' ? 'none' : '1px solid var(--border)', backgroundColor: filter === 'all' ? 'var(--accent)' : 'var(--bg)', color: filter === 'all' ? 'white' : 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Tất cả ({albumWords.length})
                </button>
                <button onClick={() => setFilter('unlearned')} style={{ padding: '6px 16px', borderRadius: '99px', border: filter === 'unlearned' ? 'none' : '1px solid var(--border)', backgroundColor: filter === 'unlearned' ? 'var(--accent)' : 'var(--bg)', color: filter === 'unlearned' ? 'white' : 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Cần học ({albumWords.length - learnedCount})
                </button>
                <button onClick={() => setFilter('learned')} style={{ padding: '6px 16px', borderRadius: '99px', border: filter === 'learned' ? 'none' : '1px solid var(--border)', backgroundColor: filter === 'learned' ? 'var(--accent)' : 'var(--bg)', color: filter === 'learned' ? 'white' : 'var(--text)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Đã thuộc ({learnedCount})
                </button>
              </div>

              {/* Import & Export options */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => fileInputRef.current?.click()} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: '10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                  <Upload size={14} />
                  <span>Nhập tệp</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json,.csv" style={{ display: 'none' }} />

                <button onClick={() => handleExportFile('json')} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                  <Download size={12} />
                  <span>JSON</span>
                </button>
                
                <button onClick={() => handleExportFile('csv')} style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}>
                  <Download size={12} />
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Words list */}
          {filteredWords.length === 0 ? (
            <div className="glass" style={{ borderRadius: '24px', padding: '64px 32px', border: '1px solid var(--border)', textAlign: 'center' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '8px' }}>📝</span>
              <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-bold)' }}>Không tìm thấy từ vựng nào</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Hãy nhấn nút Thêm từ hoặc Nhập hàng loạt để bổ sung vốn từ cho Album này.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', textAlign: 'left' }}>
              {filteredWords.map(w => (
                <div
                  key={w.id}
                  className="glass card-hover"
                  style={{
                    borderRadius: '20px',
                    padding: '20px',
                    border: '1px solid var(--border)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: '170px'
                  }}
                >
                  <div>
                    {/* Word Title & Speak */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '48px', marginBottom: '8px' }}>
                      <h4 className="font-heading" style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-bold)', margin: 0 }}>
                        {w.word}
                      </h4>
                      <button
                        onClick={() => speak(w.word)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          display: 'flex',
                          padding: '4px',
                          borderRadius: '50%'
                        }}
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                    <span style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>
                      {w.ipa}
                    </span>

                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-bold)', margin: '0 0 12px 0' }}>
                      {w.vietnameseMeaning}
                    </p>

                    {w.exampleEnglish && (
                      <div style={{ borderLeft: '2px solid var(--accent-light)', paddingLeft: '8px', marginBottom: '12px' }}>
                        <p style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--text-bold)', margin: '0 0 2px 0' }}>
                          {w.exampleEnglish}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>
                          {w.exampleVietnamese}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer options */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '4px' }}>
                    {/* Status Checkbox */}
                    <button
                      onClick={() => toggleLearned(w.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: w.isLearned ? 'var(--emerald)' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: w.isLearned ? 'var(--emerald)' : 'var(--border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: w.isLearned ? 'var(--emerald-glow)' : 'transparent'
                      }}>
                        {w.isLearned && <Check size={12} />}
                      </div>
                      <span>{w.isLearned ? 'Đã thuộc' : 'Chưa thuộc'}</span>
                    </button>

                    {/* Edit / Delete actions */}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setEditingWord(w);
                          setWordText(w.word);
                          setIpaText(w.ipa);
                          setMeaningText(w.vietnameseMeaning);
                          setExEnText(w.exampleEnglish || '');
                          setExViText(w.exampleVietnamese || '');
                          setShowAddModal(true);
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      
                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa từ "${w.word}"?`)) {
                            deleteCustomWord(w.id);
                          }
                        }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--rose)', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT WORD MODAL */}
      {showAddModal && currentAlbum && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass animate-scale-up"
            style={{
              width: '100%',
              maxWidth: '450px',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              padding: '28px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%'
              }}
            >
              <X size={18} />
            </button>

            <h3 className="font-heading" style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-bold)', marginBottom: '4px' }}>
              {editingWord ? 'Sửa từ vựng' : 'Thêm từ mới'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Thêm từ vào Album: <b style={{ color: 'var(--accent)' }}>{currentAlbum.name}</b>
            </p>

            <form onSubmit={handleSaveWord} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Từ tiếng Anh *</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: textbook"
                    value={wordText}
                    onChange={e => setWordText(e.target.value)}
                    style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)', fontSize: '14px' }}
                  />
                  <button
                    type="button"
                    onClick={handleQuickLookup}
                    disabled={lookupLoading}
                    style={{
                      padding: '10px 16px',
                      borderRadius: '10px',
                      border: 'none',
                      backgroundColor: 'var(--accent-glow)',
                      color: 'var(--accent)',
                      fontSize: '12px',
                      fontWeight: 750,
                      cursor: 'pointer'
                    }}
                  >
                    {lookupLoading ? '...' : 'Tra nghĩa'}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Phiên âm IPA</label>
                <input
                  type="text"
                  placeholder="Ví dụ: /ˈtekstbʊk/"
                  value={ipaText}
                  onChange={e => setIpaText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Nghĩa tiếng Việt *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: sách giáo khoa"
                  value={meaningText}
                  onChange={e => setMeaningText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Câu ví dụ tiếng Anh</label>
                <input
                  type="text"
                  placeholder="Ví dụ: We read textbooks at school."
                  value={exEnText}
                  onChange={e => setExEnText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Ví dụ dịch tiếng Việt</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chúng tôi đọc sách giáo khoa ở trường."
                  value={exViText}
                  onChange={e => setExViText(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)', fontSize: '14px' }}
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
                  fontWeight: 800,
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

      {/* MODAL 2: BATCH WORD IMPORT MODAL */}
      {showBatchModal && currentAlbum && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
          onClick={() => setShowBatchModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass animate-scale-up"
            style={{
              width: '100%',
              maxWidth: '500px',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              padding: '28px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowBatchModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%'
              }}
            >
              <X size={18} />
            </button>

            <h3 className="font-heading" style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-bold)', marginBottom: '6px' }}>
              Nhập từ vựng hàng loạt
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
              Nhập mỗi từ một dòng vào Album: <b style={{ color: 'var(--accent)' }}>{currentAlbum.name}</b>.<br />
              <b>Cách 1:</b> <code>từ_tiếng_anh</code> (Tự động tra định nghĩa & ví dụ online)<br />
              <b>Cách 2:</b> <code>từ_tiếng_anh | nghĩa_tiếng_việt</code> (Phân tách bằng <code>|</code>, <code>-</code> hoặc <code>:</code>)
            </p>

            <form onSubmit={handleBatchImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Danh sách từ vựng
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder={`Ví dụ:\napple\nbanana | quả chuối\ncat - con mèo\ndog : con chó`}
                  value={batchInput}
                  onChange={e => setBatchInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg)',
                    color: 'var(--text-bold)',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={batchLoading}
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
                  cursor: batchLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                {batchLoading ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'pulseGlow 1s infinite'
                    }} />
                    <span>Đang tra cứu từ điển online...</span>
                  </>
                ) : (
                  <span>Bắt đầu nhập từ</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE / EDIT ALBUM MODAL */}
      {showAlbumModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
          onClick={() => setShowAlbumModal(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="glass animate-scale-up"
            style={{
              width: '100%',
              maxWidth: '420px',
              borderRadius: '24px',
              border: '1px solid var(--border)',
              padding: '28px',
              boxShadow: 'var(--card-shadow)',
              textAlign: 'left',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowAlbumModal(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%'
              }}
            >
              <X size={18} />
            </button>

            <h3 className="font-heading" style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-bold)', marginBottom: '16px' }}>
              {editingAlbum ? 'Sửa thông tin Album' : 'Tạo Album mới'}
            </h3>

            <form onSubmit={handleSaveAlbum} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Tên Album *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Từ vựng IELTS nâng cao"
                  value={albumNameInput}
                  onChange={e => setAlbumNameInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Mô tả ngắn</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Ôn thi từ vựng mục tiêu 7.5+"
                  value={albumDescInput}
                  onChange={e => setAlbumDescInput(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', backgroundColor: 'var(--bg)', color: 'var(--text-bold)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>Biểu tượng (Emoji)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setAlbumEmojiInput(emoji)}
                      style={{
                        fontSize: '1.5rem',
                        padding: '6px',
                        borderRadius: '8px',
                        border: albumEmojiInput === emoji ? '2px solid var(--accent)' : '1px solid var(--border)',
                        backgroundColor: albumEmojiInput === emoji ? 'var(--accent-glow)' : 'var(--bg)',
                        cursor: 'pointer',
                        transition: 'all 0.1s'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
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
                  fontWeight: 800,
                  fontSize: '14px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                {editingAlbum ? 'Cập nhật Album' : 'Tạo Album'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
