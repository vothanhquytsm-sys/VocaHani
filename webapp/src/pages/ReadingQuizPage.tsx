import React, { useState } from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { ArrowLeft, Check, X, HelpCircle } from 'lucide-react';
import { type ReadingQuestion } from '../types/Reading';

interface ReadingQuizPageProps {
  passageId: string;
  setPage: (page: any) => void;
}

export const ReadingQuizPage: React.FC<ReadingQuizPageProps> = ({ passageId, setPage }) => {
  const { readings, saveReadingScore } = useVocabulary();

  // Find passage
  const passage = React.useMemo(() => {
    return readings.find(r => r.id === passageId);
  }, [readings, passageId]);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [showResults, setShowResults] = useState(false);

  if (!passage) return null;

  const questions = passage.questions;
  const activeQuestion: ReadingQuestion = questions[currentIdx];

  const handleOptionSelect = (option: string) => {
    if (hasSubmitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption || hasSubmitted) return;

    const isCorrect = selectedOption === activeQuestion.correctOption;
    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    }
    setHasSubmitted(true);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setHasSubmitted(false);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      // Completed all questions
      setShowResults(true);
      // Save score to store
      const finalScore = correctCount + (selectedOption === activeQuestion.correctOption ? 1 : 0);
      saveReadingScore(passage.id, finalScore);
    }
  };

  const handleFinish = () => {
    setPage({
      type: 'readingDetail',
      passageId: passage.id
    });
  };

  if (showResults) {
    const finalScore = correctCount;
    const isPassed = finalScore >= 4; // 80% passing standard
    
    return (
      <div style={{ maxWidth: '520px', margin: '0 auto', textAlign: 'center', padding: '24px' }}>
        <div className="glass" style={{ borderRadius: '24px', padding: '40px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)' }}>
          <span style={{ fontSize: '4.5rem', display: 'block', marginBottom: '16px' }}>👑</span>
          <h1 className="font-heading" style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-bold)', marginBottom: '8px' }}>
            Kết quả Trắc nghiệm
          </h1>
          <p className="font-heading" style={{
            fontSize: '24px',
            fontWeight: 800,
            color: isPassed ? 'var(--emerald)' : 'var(--accent)',
            marginBottom: '12px'
          }}>
            {finalScore}/{questions.length} Điểm
          </p>

          <p style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '15px', marginBottom: '32px', lineHeight: 1.4 }}>
            {finalScore === 5
              ? 'Tuyệt hảo! Bạn đã hiểu hoàn toàn nội dung bài đọc!'
              : finalScore >= 3
              ? 'Khá tốt! Bạn đã trả lời đúng đa số các câu hỏi!'
              : 'Cần cố gắng thêm! Hãy đọc lại bài và thử lại nhé.'}
          </p>

          <button
            onClick={handleFinish}
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
            Hoàn tất bài ôn tập
          </button>
        </div>
      </div>
    );
  }

  const progressPct = Math.round(((currentIdx + (hasSubmitted ? 1 : 0)) / questions.length) * 100);

  const getOptionStyle = (option: string): React.CSSProperties => {
    const isSelected = selectedOption === option;
    const isCorrect = option === activeQuestion.correctOption;

    if (hasSubmitted) {
      if (isCorrect) {
        return {
          backgroundColor: 'var(--emerald-glow)',
          borderColor: 'var(--emerald)',
          color: 'var(--emerald)'
        };
      }
      if (isSelected) {
        return {
          backgroundColor: 'var(--rose-glow)',
          borderColor: 'var(--rose)',
          color: 'var(--rose)'
        };
      }
      return {
        borderColor: 'var(--border)',
        opacity: 0.6
      };
    }

    if (isSelected) {
      return {
        borderColor: 'var(--accent)',
        backgroundColor: 'var(--accent-glow)',
        color: 'var(--accent)'
      };
    }

    return {};
  };

  return (
    <div style={{ maxWidth: '560px', margin: '0 auto' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button className="back-btn" style={{ marginBottom: 0 }} onClick={handleFinish}>
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

      {/* Question Box */}
      <div className="glass" style={{ borderRadius: '24px', padding: '32px', border: '1px solid var(--border)', boxShadow: 'var(--card-shadow)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent)', marginBottom: '12px' }}>
          <HelpCircle size={18} />
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Trắc nghiệm Đọc hiểu
          </span>
        </div>

        <p style={{
          fontSize: '18px',
          fontWeight: 800,
          color: 'var(--text-bold)',
          textAlign: 'left',
          lineHeight: 1.5
        }}>
          {activeQuestion.questionText}
        </p>

        {/* Options list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
          {activeQuestion.options.map(option => {
            const isSelected = selectedOption === option;
            const isCorrect = option === activeQuestion.correctOption;

            return (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                disabled={hasSubmitted}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '14px',
                  border: '2px solid var(--border)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text)',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: hasSubmitted ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s',
                  textAlign: 'left',
                  ...getOptionStyle(option)
                }}
              >
                <span>{option}</span>

                {/* Option Icons */}
                {hasSubmitted && (
                  <div>
                    {isCorrect ? (
                      <Check size={18} strokeWidth={3} />
                    ) : isSelected ? (
                      <X size={18} strokeWidth={3} />
                    ) : null}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Action CTA */}
      <div>
        {!hasSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className="font-heading"
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: selectedOption
                ? 'linear-gradient(135deg, var(--accent) 0%, var(--accent-light) 100%)'
                : 'var(--bg-tertiary)',
              color: selectedOption ? 'white' : 'var(--text-muted)',
              fontWeight: 800,
              fontSize: '16px',
              cursor: selectedOption ? 'pointer' : 'not-allowed',
              boxShadow: selectedOption ? '0 4px 12px var(--accent-glow)' : 'none'
            }}
          >
            Kiểm tra
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
            {currentIdx < questions.length - 1 ? 'Tiếp tục' : 'Xem kết quả'}
          </button>
        )}
      </div>
    </div>
  );
};
