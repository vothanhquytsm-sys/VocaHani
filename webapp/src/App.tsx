import { useState } from 'react';
import { VocabularyProvider, useVocabulary } from './context/VocabularyContext';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout/Layout';
import { AuthModal } from './components/AuthModal';
import { TopicsPage } from './pages/TopicsPage';
import { WordListPage } from './pages/WordListPage';
import { WordDetailPage } from './pages/WordDetailPage';
import { FlashcardPage } from './pages/FlashcardPage';
import { TestPage } from './pages/TestPage';
import { PhrasesPage } from './pages/PhrasesPage';
import { ReadingListPage } from './pages/ReadingListPage';
import { ReadingDetailPage } from './pages/ReadingDetailPage';
import { ReadingQuizPage } from './pages/ReadingQuizPage';
import { DictionaryPage } from './pages/DictionaryPage';
import { CustomWordsPage } from './pages/CustomWordsPage';
import { StatisticsPage } from './pages/StatisticsPage';

// Import IELTS views
import { Dashboard } from './pages/Dashboard';
import { Listening } from './pages/Listening';
import { Reading } from './pages/Reading';
import { Speaking } from './pages/Speaking';
import { Reflex } from './pages/Reflex';
import { Writing } from './pages/Writing';
import { Vocabulary as IeltsVocabulary } from './pages/IeltsVocabulary';

type ActivePage =
  | { type: 'topics'; topicName?: string }
  | { type: 'wordList'; topicName: string; lessonIndex: number }
  | { type: 'wordDetail'; topicName: string; lessonIndex: number; wordId: string }
  | { type: 'flashcards'; topicName: string; lessonIndex: number }
  | { type: 'test'; topicName: string; lessonIndex: number }
  | { type: 'phrases' }
  | { type: 'reading' }
  | { type: 'readingDetail'; passageId: string }
  | { type: 'readingQuiz'; passageId: string }
  | { type: 'dictionary' }
  | { type: 'customWords' }
  | { type: 'statistics' }
  | { type: 'ielts-dashboard' }
  | { type: 'ielts-listening' }
  | { type: 'ielts-reading' }
  | { type: 'ielts-speaking' }
  | { type: 'ielts-writing' }
  | { type: 'ielts-reflex' }
  | { type: 'ielts-vocab' };

function AppContent() {
  const [currentPage, setCurrentPage] = useState<ActivePage>({ type: 'topics' });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { loginUser } = useVocabulary();

  const renderActivePage = () => {
    switch (currentPage.type) {
      case 'topics':
        return <TopicsPage selectedTopicName={currentPage.topicName} setPage={setCurrentPage} />;
      case 'wordList':
        return (
          <WordListPage
            topicName={currentPage.topicName}
            lessonIndex={currentPage.lessonIndex}
            setPage={setCurrentPage}
          />
        );
      case 'wordDetail':
        return (
          <WordDetailPage
            topicName={currentPage.topicName}
            lessonIndex={currentPage.lessonIndex}
            wordId={currentPage.wordId}
            setPage={setCurrentPage}
          />
        );
      case 'flashcards':
        return (
          <FlashcardPage
            topicName={currentPage.topicName}
            lessonIndex={currentPage.lessonIndex}
            setPage={setCurrentPage}
          />
        );
      case 'test':
        return (
          <TestPage
            topicName={currentPage.topicName}
            lessonIndex={currentPage.lessonIndex}
            setPage={setCurrentPage}
          />
        );
      case 'phrases':
        return <PhrasesPage />;
      case 'reading':
        return <ReadingListPage setPage={setCurrentPage} />;
      case 'readingDetail':
        return <ReadingDetailPage passageId={currentPage.passageId} setPage={setCurrentPage} />;
      case 'readingQuiz':
        return <ReadingQuizPage passageId={currentPage.passageId} setPage={setCurrentPage} />;
      case 'dictionary':
        return <DictionaryPage />;
      case 'customWords':
        return <CustomWordsPage setPage={setCurrentPage} />;
      case 'statistics':
        return <StatisticsPage />;
      case 'ielts-dashboard':
        return <Dashboard />;
      case 'ielts-listening':
        return <Listening />;
      case 'ielts-reading':
        return <Reading />;
      case 'ielts-speaking':
        return <Speaking />;
      case 'ielts-writing':
        return <Writing />;
      case 'ielts-reflex':
        return <Reflex />;
      case 'ielts-vocab':
        return <IeltsVocabulary />;
      default:
        return <TopicsPage setPage={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} setPage={setCurrentPage} onLoginClick={() => setShowLoginModal(true)}>
      {renderActivePage()}

      {showLoginModal && (
        <AuthModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(username, token) => {
            loginUser(username, token);
            setShowLoginModal(false);
          }}
        />
      )}
    </Layout>
  );
}

function App() {
  return (
    <VocabularyProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </VocabularyProvider>
  );
}

export default App;
