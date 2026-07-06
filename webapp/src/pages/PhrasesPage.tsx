import React from 'react';
import { useVocabulary } from '../context/VocabularyContext';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { Heart, Volume2, Info } from 'lucide-react';

export const PhrasesPage: React.FC = () => {
  const { phrases, togglePhraseFavorite } = useVocabulary();
  const { speak } = useSpeechSynthesis();

  // Group phrases by category
  const groupedPhrases = React.useMemo(() => {
    const groups: Record<string, typeof phrases> = {};
    phrases.forEach(p => {
      const cat = p.category || 'Đời sống xã hội';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(p);
    });
    return groups;
  }, [phrases]);

  const categories = React.useMemo(() => {
    return Object.keys(groupedPhrases).sort();
  }, [groupedPhrases]);

  return (
    <div>
      {/* Page Header */}
      <div className="page-header">
        <div className="header-title-container" style={{ textAlign: 'left' }}>
          <span className="header-subtitle">VocaHani - Cụm từ</span>
          <h1 className="header-title font-heading">Cụm Từ<br />Giao Tiếp</h1>
        </div>
        <img src="/logo.png" alt="VocaHani Logo" className="header-logo" />
      </div>

      {/* Phrases list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {categories.map(category => (
          <div key={category} style={{ textAlign: 'left' }}>
            {/* Category Header */}
            <h2 className="font-heading" style={{
              fontSize: '20px',
              fontWeight: 800,
              color: 'var(--text-bold)',
              marginBottom: '16px',
              borderBottom: '2px solid var(--border)',
              paddingBottom: '8px'
            }}>
              {category}
            </h2>

            {/* List of cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {groupedPhrases[category].map(phrase => (
                <div
                  key={phrase.id}
                  className="glass"
                  style={{
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--card-shadow)',
                    transition: 'border-color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div>
                      <p style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-bold)' }}>
                        {phrase.english}
                      </p>
                      <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500, marginTop: '2px' }}>
                        {phrase.vietnamese}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => speak(phrase.english)}
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

                      <button
                        onClick={() => togglePhraseFavorite(phrase.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          color: phrase.isFavorite ? 'var(--rose)' : 'var(--text-muted)',
                          padding: '6px',
                          borderRadius: '50%',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Heart size={20} fill={phrase.isFavorite ? 'var(--rose)' : 'transparent'} />
                      </button>
                    </div>
                  </div>

                  {/* Context Note (If present) */}
                  {phrase.contextNote && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      backgroundColor: 'var(--accent-glow)',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      color: 'var(--accent)',
                      fontWeight: 500
                    }}>
                      <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{phrase.contextNote}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
