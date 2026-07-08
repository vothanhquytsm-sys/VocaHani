import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useVocabulary } from './VocabularyContext';

export interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  id: number;
}

export interface ProgressData {
  wordsLearned: string[];
  testsPassed: number;
  listeningCompleted: string[];
  readingCompleted: string[];
  speakingCompleted: string[];
  writingCompleted: string[];
  reflexCompleted: string[];
  vocabProgress: Record<string, number>;
  dailyLog: Record<string, {
    words: string[];
    listening: string[];
    reading: string[];
    reflex: string[];
  }>;
}

interface AppContextProps {
  currentUser: string | null;
  currentTab: string;
  theme: 'light' | 'dark';
  voiceGender: 'female' | 'male';
  progress: ProgressData;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  dismissToast: (id: number) => void;
  login: (username: string) => Promise<void>;
  logout: () => void;
  switchTab: (tab: string) => void;
  toggleDarkMode: () => void;
  setVoiceGender: (gender: 'female' | 'male') => void;
  saveProgress: (type: 'vocab' | 'listening' | 'reading' | 'speaking' | 'writing' | 'reflex', id: string | number) => void;
  updateVocabProgress: (topicId: string, nextBatchNum: number) => void;
  resetProgress: () => void;
  forceSync: () => Promise<void>;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const defaultProgress = (): ProgressData => ({
  wordsLearned: [],
  testsPassed: 0,
  listeningCompleted: [],
  readingCompleted: [],
  speakingCompleted: [],
  writingCompleted: [],
  reflexCompleted: [],
  vocabProgress: {
    emotion: 1, environment: 1, technology: 1, education: 1,
    business: 1, health: 1, celebrities: 1, travel: 1, society: 1,
    'phrasal-verbs': 1, A1: 1, A2: 1, B1: 1, B2: 1, PV: 1, ielts: 1
  },
  dailyLog: {}
});

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logoutUser, ieltsProgress, setIeltsProgress } = useVocabulary();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => (localStorage.getItem('ef_theme') as 'light' | 'dark') || 'light');
  const [voiceGender, setVoiceGenderState] = useState<'female' | 'male'>(() => (localStorage.getItem('ef_voice_gender') as 'female' | 'male') || 'female');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Resolve currentUser from VocaHani's user context
  const currentUser = user ? user.username : null;

  // Resolve progress from the synchronized ieltsProgress
  const progress: ProgressData = React.useMemo(() => {
    const raw = ieltsProgress || {};
    return {
      wordsLearned: raw.wordsLearned || [],
      testsPassed: raw.testsPassed || 0,
      listeningCompleted: raw.listeningCompleted || [],
      readingCompleted: raw.readingCompleted || [],
      speakingCompleted: raw.speakingCompleted || [],
      writingCompleted: raw.writingCompleted || [],
      reflexCompleted: raw.reflexCompleted || [],
      vocabProgress: { ...defaultProgress().vocabProgress, ...raw.vocabProgress },
      dailyLog: raw.dailyLog || {}
    };
  }, [ieltsProgress]);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('ef_theme', theme);
  }, [theme]);

  const login = async (username: string) => {
    showToast(`Vui lòng sử dụng Đăng nhập tài khoản ở góc sidebar để đồng bộ dữ liệu.`, 'warning');
  };

  const logout = () => {
    logoutUser();
  };

  const switchTab = useCallback((tab: string) => {
    setCurrentTab(tab);
  }, []);

  const toggleDarkMode = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const setVoiceGender = useCallback((gender: 'female' | 'male') => {
    setVoiceGenderState(gender);
    localStorage.setItem('ef_voice_gender', gender);
    showToast(`Đã đổi giọng đọc sang Giọng ${gender === 'female' ? 'Nữ' : 'Nam'}`, 'info');
  }, [showToast]);

  const saveProgress = useCallback((
    type: 'vocab' | 'listening' | 'reading' | 'speaking' | 'writing' | 'reflex',
    id: string | number
  ) => {
    const today = new Date().toLocaleDateString('en-CA');
    const sid = String(id);

    setIeltsProgress((prev: any) => {
      const next = { ...(prev || defaultProgress()) };
      next.wordsLearned = next.wordsLearned || [];
      next.listeningCompleted = next.listeningCompleted || [];
      next.readingCompleted = next.readingCompleted || [];
      next.speakingCompleted = next.speakingCompleted || [];
      next.writingCompleted = next.writingCompleted || [];
      next.reflexCompleted = next.reflexCompleted || [];
      next.dailyLog = next.dailyLog || {};
      
      next.dailyLog[today] = next.dailyLog[today] || { words: [], listening: [], reading: [], reflex: [] };
      const log = next.dailyLog[today];
      log.words = log.words || [];
      log.listening = log.listening || [];
      log.reading = log.reading || [];
      log.reflex = log.reflex || [];

      if (type === 'vocab') {
        if (!next.wordsLearned.includes(sid)) next.wordsLearned.push(sid);
        if (!log.words.includes(sid)) log.words.push(sid);
      } else if (type === 'listening') {
        if (!next.listeningCompleted.includes(sid)) next.listeningCompleted.push(sid);
        if (!log.listening.includes(sid)) log.listening.push(sid);
      } else if (type === 'reading') {
        if (!next.readingCompleted.includes(sid)) next.readingCompleted.push(sid);
        if (!log.reading.includes(sid)) log.reading.push(sid);
      } else if (type === 'speaking') {
        if (!next.speakingCompleted.includes(sid)) next.speakingCompleted.push(sid);
      } else if (type === 'writing') {
        if (!next.writingCompleted.includes(sid)) next.writingCompleted.push(sid);
      } else if (type === 'reflex') {
        if (!next.reflexCompleted.includes(sid)) next.reflexCompleted.push(sid);
        if (!log.reflex.includes(sid)) log.reflex.push(sid);
      }

      return next;
    });
  }, [setIeltsProgress]);

  const updateVocabProgress = useCallback((topicId: string, nextBatchNum: number) => {
    setIeltsProgress((prev: any) => {
      const next = { ...(prev || defaultProgress()) };
      next.vocabProgress = next.vocabProgress || {};
      next.vocabProgress[topicId] = Math.max(next.vocabProgress[topicId] || 1, nextBatchNum);
      return next;
    });
  }, [setIeltsProgress]);

  const resetProgress = useCallback(() => {
    if (window.confirm('Bạn có chắc muốn đặt lại toàn bộ tiến độ học tập IELTS?')) {
      setIeltsProgress(defaultProgress());
      showToast('Đã đặt lại tiến độ học tập IELTS.', 'info');
    }
  }, [setIeltsProgress, showToast]);

  const forceSync = useCallback(async () => {
    showToast('☁️ Dữ liệu đang được đồng bộ tự động lên SQLite đám mây...', 'info');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentTab,
        theme,
        voiceGender,
        progress,
        toasts,
        showToast,
        dismissToast,
        login,
        logout,
        switchTab,
        toggleDarkMode,
        setVoiceGender,
        saveProgress,
        updateVocabProgress,
        resetProgress,
        forceSync
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
