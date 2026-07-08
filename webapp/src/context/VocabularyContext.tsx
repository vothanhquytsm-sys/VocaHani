import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { type Word, type SRSData } from '../types/Word';
import { type Phrase } from '../types/Phrase';
import { type ReadingPassage } from '../types/Reading';
import { type WordAlbum } from '../types/WordAlbum';
import { calculateSM2 } from '../utils/sm2';

interface VocabularyContextType {
  words: Word[];
  phrases: Phrase[];
  readings: ReadingPassage[];
  customWords: Word[];
  learnedWordIds: string[];
  favoriteWordIds: string[];
  favoritePhraseIds: string[];
  passedLessons: string[];
  completedReadings: Record<string, number>;
  loading: boolean;
  user: { username: string; token: string } | null;
  albums: WordAlbum[];
  ieltsProgress: any;
  setIeltsProgress: React.Dispatch<React.SetStateAction<any>>;
  
  toggleLearned: (wordId: string) => void;
  toggleFavorite: (wordId: string) => void;
  togglePhraseFavorite: (phraseId: string) => void;
  rateWordQuality: (wordId: string, quality: number) => void;
  addCustomWord: (wordData: Omit<Word, 'id' | 'isCustom' | 'isLearned' | 'isFavorite'>) => void;
  updateCustomWord: (wordId: string, wordData: Partial<Word>) => void;
  deleteCustomWord: (wordId: string) => void;
  saveReadingScore: (passageId: string, score: number) => void;
  passLesson: (topicName: string, lessonIndex: number) => void;
  resetLessonProgress: () => void;
  importCustomWords: (imported: Partial<Word>[]) => void;
  loginUser: (username: string, token: string) => void;
  logoutUser: () => void;
  addAlbum: (name: string, description?: string, symbolName?: string) => void;
  deleteAlbum: (id: string) => void;
  updateAlbum: (id: string, name: string, description?: string, symbolName?: string) => void;
}

const VocabularyContext = createContext<VocabularyContextType | undefined>(undefined);

export const VocabularyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  
  // Auth State
  const [user, setUser] = useState<{ username: string; token: string } | null>(() => {
    const item = localStorage.getItem('voca_user_session');
    return item ? JSON.parse(item) : null;
  });

  // Custom Word Albums State
  const [albums, setAlbums] = useState<WordAlbum[]>(() => {
    const item = localStorage.getItem('voca_custom_albums');
    return item ? JSON.parse(item) : [
      { id: 'default_album', name: 'Từ của tôi', description: 'Album từ vựng mặc định', symbolName: 'folder.fill', createdAt: new Date().toISOString() }
    ];
  });

  // IELTS Progress State
  const [ieltsProgress, setIeltsProgress] = useState<any>(() => {
    const item = localStorage.getItem('voca_ielts_progress');
    return item ? JSON.parse(item) : null;
  });

  useEffect(() => {
    if (ieltsProgress) {
      localStorage.setItem('voca_ielts_progress', JSON.stringify(ieltsProgress));
    }
  }, [ieltsProgress]);

  // Master lists loaded from public JSON assets
  const [baseWords, setBaseWords] = useState<Word[]>([]);
  const [basePhrases, setBasePhrases] = useState<Phrase[]>([]);
  const [readings, setReadings] = useState<ReadingPassage[]>([]);

  // User state stored in localStorage
  const [customWords, setCustomWords] = useState<Word[]>(() => {
    const item = localStorage.getItem('voca_custom_words');
    return item ? JSON.parse(item) : [];
  });
  
  const [learnedWordIds, setLearnedWordIds] = useState<string[]>(() => {
    const item = localStorage.getItem('voca_learned_word_ids');
    return item ? JSON.parse(item) : [];
  });
  
  const [favoriteWordIds, setFavoriteWordIds] = useState<string[]>(() => {
    const item = localStorage.getItem('voca_favorite_word_ids');
    return item ? JSON.parse(item) : [];
  });

  const [favoritePhraseIds, setFavoritePhraseIds] = useState<string[]>(() => {
    const item = localStorage.getItem('voca_favorite_phrase_ids');
    return item ? JSON.parse(item) : [];
  });

  const [passedLessons, setPassedLessons] = useState<string[]>(() => {
    const item = localStorage.getItem('voca_passed_lessons');
    return item ? JSON.parse(item) : [];
  });

  const [completedReadings, setCompletedReadings] = useState<Record<string, number>>(() => {
    const item = localStorage.getItem('voca_completed_readings');
    return item ? JSON.parse(item) : {};
  });

  const [srsMap, setSrsMap] = useState<Record<string, SRSData>>(() => {
    const item = localStorage.getItem('voca_srs_map');
    return item ? JSON.parse(item) : {};
  });

  // Load static files at boot
  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [wordsRes, phrasesRes, readingsRes] = await Promise.all([
          fetch('/data/words.json'),
          fetch('/data/phrases.json'),
          fetch('/data/readings.json')
        ]);
        
        const wordsData = await wordsRes.json();
        const phrasesData = await phrasesRes.json();
        const readingsData = await readingsRes.json();
        
        setBaseWords(wordsData);
        setBasePhrases(phrasesData);
        setReadings(readingsData);
      } catch (error) {
        console.error('Failed to load vocabulary data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStaticData();
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('voca_custom_words', JSON.stringify(customWords));
  }, [customWords]);

  useEffect(() => {
    localStorage.setItem('voca_learned_word_ids', JSON.stringify(learnedWordIds));
  }, [learnedWordIds]);

  useEffect(() => {
    localStorage.setItem('voca_favorite_word_ids', JSON.stringify(favoriteWordIds));
  }, [favoriteWordIds]);

  useEffect(() => {
    localStorage.setItem('voca_favorite_phrase_ids', JSON.stringify(favoritePhraseIds));
  }, [favoritePhraseIds]);

  useEffect(() => {
    localStorage.setItem('voca_passed_lessons', JSON.stringify(passedLessons));
  }, [passedLessons]);

  useEffect(() => {
    localStorage.setItem('voca_completed_readings', JSON.stringify(completedReadings));
  }, [completedReadings]);

  useEffect(() => {
    localStorage.setItem('voca_srs_map', JSON.stringify(srsMap));
  }, [srsMap]);

  useEffect(() => {
    localStorage.setItem('voca_custom_albums', JSON.stringify(albums));
  }, [albums]);

  // Combine baseWords and customWords, mapping dynamic favorite/learned/srs status
  const words = React.useMemo(() => {
    const mapWord = (w: Word) => ({
      ...w,
      isLearned: learnedWordIds.includes(w.id),
      isFavorite: favoriteWordIds.includes(w.id),
      srs: srsMap[w.id]
    });
    return [...baseWords.map(mapWord), ...customWords.map(mapWord)];
  }, [baseWords, customWords, learnedWordIds, favoriteWordIds, srsMap]);

  const phrases = React.useMemo(() => {
    return basePhrases.map(p => ({
      ...p,
      isFavorite: favoritePhraseIds.includes(p.id)
    }));
  }, [basePhrases, favoritePhraseIds]);

  // Toggle Learned status
  const toggleLearned = useCallback((wordId: string) => {
    setLearnedWordIds(prev => {
      const exists = prev.includes(wordId);
      if (exists) {
        // Remove from learned, clean up SRS
        setSrsMap(srs => {
          const copy = { ...srs };
          delete copy[wordId];
          return copy;
        });
        return prev.filter(id => id !== wordId);
      } else {
        // Add to learned, initialize SRS
        setSrsMap(srs => ({
          ...srs,
          [wordId]: {
            easinessFactor: 2.5,
            repetitions: 1,
            intervalDays: 1,
            nextReviewDate: new Date().toISOString()
          }
        }));
        return [...prev, wordId];
      }
    });
  }, []);

  // Toggle Favorite
  const toggleFavorite = useCallback((wordId: string) => {
    setFavoriteWordIds(prev =>
      prev.includes(wordId) ? prev.filter(id => id !== wordId) : [...prev, wordId]
    );
  }, []);

  // Toggle Phrase Favorite
  const togglePhraseFavorite = useCallback((phraseId: string) => {
    setFavoritePhraseIds(prev =>
      prev.includes(phraseId) ? prev.filter(id => id !== phraseId) : [...prev, phraseId]
    );
  }, []);

  // Spaced Repetition Grading
  const rateWordQuality = useCallback((wordId: string, quality: number) => {
    setSrsMap(prev => {
      const currentSrs = prev[wordId] || {
        easinessFactor: 2.5,
        repetitions: 0,
        intervalDays: 1,
        nextReviewDate: new Date().toISOString()
      };
      
      const newSrs = calculateSM2(
        quality,
        currentSrs.easinessFactor,
        currentSrs.repetitions,
        currentSrs.intervalDays
      );
      
      // Auto toggle learned status based on quality
      if (quality >= 3) {
        setLearnedWordIds(l => l.includes(wordId) ? l : [...l, wordId]);
      } else {
        setLearnedWordIds(l => l.filter(id => id !== wordId));
      }
      
      return {
        ...prev,
        [wordId]: newSrs
      };
    });
  }, []);

  // Add custom word
  const addCustomWord = useCallback((wordData: Omit<Word, 'id' | 'isCustom' | 'isLearned' | 'isFavorite'>) => {
    const newWord: Word = {
      ...wordData,
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isCustom: true,
      isLearned: false,
      isFavorite: false
    };
    setCustomWords(prev => [...prev, newWord]);
  }, []);

  // Update custom word
  const updateCustomWord = useCallback((wordId: string, wordData: Partial<Word>) => {
    setCustomWords(prev =>
      prev.map(w => (w.id === wordId ? { ...w, ...wordData } : w))
    );
  }, []);

  // Delete custom word
  const deleteCustomWord = useCallback((wordId: string) => {
    setCustomWords(prev => prev.filter(w => w.id !== wordId));
    setLearnedWordIds(prev => prev.filter(id => id !== wordId));
    setFavoriteWordIds(prev => prev.filter(id => id !== wordId));
    setSrsMap(prev => {
      const copy = { ...prev };
      delete copy[wordId];
      return copy;
    });
  }, []);

  // Save Reading Score
  const saveReadingScore = useCallback((passageId: string, score: number) => {
    setCompletedReadings(prev => {
      const currentMax = prev[passageId] || 0;
      if (score > currentMax) {
        return { ...prev, [passageId]: score };
      }
      return prev;
    });
  }, []);

  // Pass Lesson (Auto mark all lesson words as learned)
  const passLesson = useCallback((topicName: string, lessonIndex: number) => {
    const lessonKey = `${topicName}_${lessonIndex}`;
    setPassedLessons(prev => (prev.includes(lessonKey) ? prev : [...prev, lessonKey]));

    // Find all base words in this lesson (10 per lesson)
    const topicWords = words.filter(w => w.topic.toLowerCase() === topicName.toLowerCase() && !w.isCustom);
    const startIdx = lessonIndex * 10;
    const lessonWords = topicWords.slice(startIdx, startIdx + 10);
    
    setLearnedWordIds(prev => {
      const newIds = [...prev];
      lessonWords.forEach(w => {
        if (!newIds.includes(w.id)) {
          newIds.push(w.id);
          // Pre-populate SRS data
          setSrsMap(srs => ({
            ...srs,
            [w.id]: {
              easinessFactor: 2.5,
              repetitions: 1,
              intervalDays: 1,
              nextReviewDate: new Date().toISOString()
            }
          }));
        }
      });
      return newIds;
    });
  }, [words]);

  // Reset Progress
  const resetLessonProgress = useCallback(() => {
    setCustomWords([]);
    setLearnedWordIds([]);
    setFavoriteWordIds([]);
    setFavoritePhraseIds([]);
    setPassedLessons([]);
    setCompletedReadings({});
    setSrsMap({});
  }, []);

  // Import custom words
  const importCustomWords = useCallback((imported: Partial<Word>[]) => {
    const wordsToAdd: Word[] = imported.map((item, idx) => ({
      id: `custom_import_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
      word: item.word || 'Untitled',
      ipa: item.ipa || '/.../',
      vietnameseMeaning: item.vietnameseMeaning || 'Nghĩa trống',
      exampleEnglish: item.exampleEnglish || '',
      exampleVietnamese: item.exampleVietnamese || '',
      topic: item.topic || 'Từ nhập khẩu',
      level: item.level || 'A1',
      symbolName: item.symbolName || 'pencil.circle.fill',
      isCustom: true,
      isLearned: false,
      isFavorite: false
    }));
    
    setCustomWords(prev => [...prev, ...wordsToAdd]);
  }, []);

  const loginUser = useCallback((username: string, token: string) => {
    const session = { username, token };
    setUser(session);
    localStorage.setItem('voca_user_session', JSON.stringify(session));
  }, []);

  const logoutUser = useCallback(() => {
    setUser(null);
    localStorage.removeItem('voca_user_session');
    resetLessonProgress();
  }, [resetLessonProgress]);

  // Album modification callbacks
  const addAlbum = useCallback((name: string, description = '', symbolName = 'folder.fill') => {
    const newAlbum: WordAlbum = {
      id: `album_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      description: description.trim(),
      symbolName,
      createdAt: new Date().toISOString()
    };
    setAlbums(prev => [...prev, newAlbum]);
  }, []);

  const deleteAlbum = useCallback((id: string) => {
    if (id === 'default_album') return;
    setAlbums(prev => {
      const album = prev.find(a => a.id === id);
      if (album) {
        setCustomWords(words => words.filter(w => w.topic.toLowerCase() !== album.name.toLowerCase()));
      }
      return prev.filter(a => a.id !== id);
    });
  }, []);

  const updateAlbum = useCallback((id: string, name: string, description = '', symbolName = 'folder.fill') => {
    setAlbums(prev => prev.map(a => {
      if (a.id === id) {
        setCustomWords(words => words.map(w => {
          if (w.topic.toLowerCase() === a.name.toLowerCase()) {
            return { ...w, topic: name.trim() };
          }
          return w;
        }));
        return {
          ...a,
          name: name.trim(),
          description: description.trim(),
          symbolName
        };
      }
      return a;
    }));
  }, []);

  // Sync Pull Effect (Runs on Login/App Boot)
  useEffect(() => {
    const pullProgress = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/sync/pull', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setCustomWords(data.customWords || []);
          setLearnedWordIds(data.learnedWordIds || []);
          setFavoriteWordIds(data.favoriteWordIds || []);
          setFavoritePhraseIds(data.favoritePhraseIds || []);
          setPassedLessons(data.passedLessons || []);
          setCompletedReadings(data.completedReadings || {});
          setSrsMap(data.srsMap || {});
          setIeltsProgress(data.ieltsProgress || null);
          setAlbums(data.albums && data.albums.length > 0 ? data.albums : [
            { id: 'default_album', name: 'Từ của tôi', description: 'Album từ vựng mặc định', symbolName: 'folder.fill', createdAt: new Date().toISOString() }
          ]);
        }
      } catch (err) {
        console.error('Failed to pull progress from server:', err);
      }
    };
    pullProgress();
  }, [user]);

  // Sync Push Effect (Debounced saving)
  useEffect(() => {
    if (!user) return;

    const pushData = async () => {
      try {
        await fetch('/api/sync/push', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            learnedWordIds,
            favoriteWordIds,
            favoritePhraseIds,
            passedLessons,
            completedReadings,
            srsMap,
            albums,
            ieltsProgress,
            customWords
          })
        });
      } catch (err) {
        console.error('Failed to sync progress to server:', err);
      }
    };

    const timer = setTimeout(() => {
      pushData();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, learnedWordIds, favoriteWordIds, favoritePhraseIds, passedLessons, completedReadings, srsMap, albums, ieltsProgress, customWords]);

  return (
    <VocabularyContext.Provider
      value={{
        words,
        phrases,
        readings,
        customWords,
        learnedWordIds,
        favoriteWordIds,
        favoritePhraseIds,
        passedLessons,
        completedReadings,
        loading,
        toggleLearned,
        toggleFavorite,
        togglePhraseFavorite,
        rateWordQuality,
        addCustomWord,
        updateCustomWord,
        deleteCustomWord,
        saveReadingScore,
        passLesson,
        resetLessonProgress,
        importCustomWords,
        user,
        loginUser,
        logoutUser,
        albums,
        addAlbum,
        deleteAlbum,
        updateAlbum,
        ieltsProgress,
        setIeltsProgress
      }}
    >
      {children}
    </VocabularyContext.Provider>
  );
};

export const useVocabulary = () => {
  const context = useContext(VocabularyContext);
  if (context === undefined) {
    throw new Error('useVocabulary must be used within a VocabularyProvider');
  }
  return context;
};
