import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { ArrowLeft, Check, X, HelpCircle, Volume2, AlertTriangle } from 'lucide-react';
import { type Word } from '../types/Word';

interface TestPageProps {
  topicName: string;
  lessonIndex: number;
  setPage: (page: any) => void;
}

interface Question {
  word: Word;
  type: 'translation' | 'context';
  questionText: string;
  correctAnswer: string;
  hint: string;
}

export const TestPage: React.FC<TestPageProps> = ({ topicName, lessonIndex, setPage }) => {
  const { words, passLesson } = useVocabulary();
  const { speak } = useSpeechSynthesis();

  // Test state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [testFinished, setTestFinished] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Generate questions from lesson words
  const generateQuestions = () => {
    const topicWords = words.filter(w => w.topic.toLowerCase() === topicName.toLowerCase() && !w.isCustom);
    const start = lessonIndex * 10;
    const end = Math.min(start + 10, topicWords.length);
    const subset = topicWords.slice(start, end);

    const generated: Question[] = subset.map((w, idx) => {
      // Even indices: direct translation spelling test
      if (idx % 2 === 0) {
        return {
          word: w,
          type: 'translation',
          questionText: `Viết từ tiếng Anh có nghĩa là: "${w.vietnameseMeaning}"`,
          correctAnswer: w.word,
          hint: `Phát âm: ${w.ipa}`
        };
      } 
      
      // Odd indices: contextual fill-in-the-blank from example
      else {
        let questionText = `Điền từ thích hợp vào chỗ trống để dịch nghĩa: "${w.exampleVietnamese}"`;
        let enSentence = w.exampleEnglish;

        // Replace the target word in sentence with blank spaces
        if (enSentence) {
          const regex = new RegExp(`\\b${w.word}\\b`, 'gi');
          enSentence = enSentence.replace(regex, '_______');
        } else {
          enSentence = `I need to buy some _______ at the store.`; // Fallback
        }

        return {
          word: w,
          type: 'context',
          questionText: `${questionText}\n\n"${enSentence}"`,
          correctAnswer: w.word,
          hint: `Nghĩa của từ cần điền: ${w.vietnameseMeaning}`
        };
      }
    });

    setQuestions(generated);
    setCurrentIdx(0);
    setTypedAnswer('');
    setIsAnswered(false);
    setScore(0);
    setTestFinished(false);
  };

  useEffect(() => {
    generateQuestions();
  }, [words, topicName, lessonIndex]);

  const activeQuestion = questions[currentIdx];

  const handleCheckAnswer = () => {
    if (!activeQuestion || isAnswered) return;

    const normTyped = typedAnswer.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
    const normCorrect = activeQuestion.correctAnswer.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");

    const correct = normTyped === normCorrect;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setScore(prev => prev + 1);
    }

    // Speak correct answer
    speak(activeQuestion.correctAnswer);
  };

  const handleNext = () => {
    setTypedAnswer('');
    setIsAnswered(false);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Completed last question
      setTestFinished(true);
      // If perfect score 10/10, auto unlock next lesson in store
      if (score + (isCorrect ? 1 : 0) === questions.length) {
        passLesson(topicName, lessonIndex);
      }
    }
  };

  const handleExit = () => {
    setPage({ type: 'wordList', topicName, lessonIndex });
  };

  if (questions.length === 0) return null;

  if (testFinished) {
    const perfectScore = score === questions.length;
    return (
      <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center', padding: '24px' }}>
        <div className="glass" style={{ borderRadius: '24px', padding: '40px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
          <span style={{ fontSize: '4.5rem', display: 'block', marginBottom: '16px' }}>
            {perfectScore ? '🏆' : '📝'}
          </span>
          <h1 className="font-heading" style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-bold)', marginBottom: '8px' }}>
            Kết quả kiểm tra
          </h1>
          <p className="font-heading" style={{
            fontSize: '24px',
            fontWeight: 800,
            color: perfectScore ? 'var(--emerald)' : 'var(--text-bold)',
            marginBottom: '12px'
          }}>
            {score}/{questions.length} Điểm
          </p>

          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '15px', marginBottom: '32px', lineHeight: 1.4 }}>
            {perfectScore 
              ? 'Tuyệt vời! Bạn đã trả lời đúng tất cả các câu hỏi và đã mở khóa bài học tiếp theo!' 
              : 'Bạn cần trả lời đúng 10/10 câu hỏi để hoàn thành bài học và mở khóa bài mới.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {perfectScore ? (
              <button
                onClick={() => setPage({ type: 'topics', topicName })}
                className="font-heading"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, var(--emerald) 0%, var(--emerald-light) 100%)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px var(--emerald-glow)'
                }}
              >
                Hoàn thành & Quay lại chủ đề
              </button>
            ) : (
              <>
                <button
                  onClick={generateQuestions}
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
                    boxShadow: '0 4px 12px var(--accent-glow)'
                  }}
                >
                  Làm lại bài kiểm tra
                </button>
                <button
                  onClick={handleExit}
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
                  Quay lại tự học thêm
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const progressPct = Math.round(((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100);

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="back-btn" style={{ marginBottom: 0 }} onClick={() => setShowExitConfirm(true)}>
          <ArrowLeft size={16} />
          <span>Thoát</span>
        </button>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)' }}>
          Câu hỏi {currentIdx + 1}/{questions.length}
        </span>
      </div>

      {/* Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <div className="progress-bar-container" style={{ flex: 1, backgroundColor: 'var(--border)' }}>
          <div className="progress-bar-fill" style={{ width: `${progressPct}%`, backgroundColor: 'var(--accent)' }} />
        </div>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>{progressPct}%</span>
      </div>

      {/* Question Card */}
      <div className="glass" style={{ borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', marginBottom: '12px' }}>
          <HelpCircle size={18} />
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Câu hỏi kiểm tra viết
          </span>
        </div>

        <p style={{
          fontSize: '20px',
          fontWeight: 800,
          color: 'var(--text-bold)',
          textAlign: 'left',
          lineHeight: 1.5,
          whiteSpace: 'pre-line'
        }}>
          {activeQuestion.questionText}
        </p>

        {/* Input box */}
        <div style={{ marginTop: '24px' }}>
          <input
            type="text"
            placeholder="Gõ từ tiếng Anh..."
            value={typedAnswer}
            disabled={isAnswered}
            onChange={e => setTypedAnswer(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCheckAnswer()}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: '2px solid var(--border)',
              backgroundColor: 'var(--bg)',
              color: 'var(--text-bold)',
              fontSize: '18px',
              fontWeight: 700,
              outline: 'none',
              textAlign: 'center',
              textTransform: 'lowercase',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />

          <span style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '8px', textAlign: 'left' }}>
            Gợi ý: {activeQuestion.hint}
          </span>
        </div>

        {/* Answer verification feedback */}
        {isAnswered && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: isCorrect ? 'var(--emerald-glow)' : 'var(--rose-glow)',
            borderRadius: '16px',
            padding: '16px',
            marginTop: '20px',
            color: isCorrect ? 'var(--emerald)' : 'var(--rose)',
            textAlign: 'left'
          }}>
            {isCorrect ? <Check size={24} strokeWidth={3} /> : <X size={24} strokeWidth={3} />}
            <div>
              <p style={{ fontSize: '15px', fontWeight: 800 }}>
                {isCorrect ? 'Chính xác!' : 'Chưa đúng rồi!'}
              </p>
              {!isCorrect && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, marginTop: '2px' }}>
                  <span>Đáp án đúng: <strong>{activeQuestion.correctAnswer}</strong></span>
                  <button onClick={() => speak(activeQuestion.correctAnswer)} style={{ background: 'transparent', border: 'none', color: 'var(--rose)', cursor: 'pointer' }}>
                    <Volume2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div>
        {!isAnswered ? (
          <button
            onClick={handleCheckAnswer}
            disabled={!typedAnswer.trim()}
            className="font-heading"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: typedAnswer.trim()
                ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)'
                : 'var(--bg-tertiary)',
              color: typedAnswer.trim() ? 'white' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '16px',
              cursor: typedAnswer.trim() ? 'pointer' : 'not-allowed',
              boxShadow: typedAnswer.trim() ? '0 4px 12px var(--accent-glow)' : 'none'
            }}
          >
            Kiểm tra đáp án
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="font-heading"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)',
              color: 'white',
              fontWeight: 800,
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px var(--accent-glow)'
            }}
          >
            {currentIdx < questions.length - 1 ? 'Câu tiếp theo' : 'Xem kết quả'}
          </button>
        )}
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '20px'
        }}>
          <div className="glass" style={{ borderRadius: '24px', padding: '32px', maxWidth: '400px', width: '100%', border: '1px solid var(--border)', textAlign: 'center' }}>
            <AlertTriangle size={48} style={{ color: 'var(--amber)', marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-bold)', marginBottom: '8px' }}>
              Xác nhận thoát?
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.4 }}>
              Tiến trình bài kiểm tra hiện tại sẽ bị mất. Bạn vẫn muốn thoát chứ?
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleExit}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--rose)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Thoát
              </button>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text)',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
