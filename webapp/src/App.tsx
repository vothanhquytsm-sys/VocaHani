import { useState } from 'react';
import { VocabularyProvider } from './context/VocabularyContext';
import { Layout } from './components/Layout/Layout';
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
  | { type: 'statistics' };

function AppContent() {
  const [currentPage, setCurrentPage] = useState<ActivePage>({ type: 'topics' });

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
        return <CustomWordsPage />;
      case 'statistics':
        return <StatisticsPage />;
      default:
        return <TopicsPage setPage={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} setPage={setCurrentPage}>
      {renderActivePage()}
    </Layout>
  );
}

function App() {
  return (
    <VocabularyProvider>
      <AppContent />
    </VocabularyProvider>
  );
}

export default App;
