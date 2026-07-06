import { type Word } from '../types/Word';

export function parseCSV(text: string): Partial<Word>[] {
  const lines = text.split(/\r?\n/);
  if (lines.length <= 1) return [];

  const results: Partial<Word>[] = [];
  // Skips the first header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const fields = parseCSVLine(line);
    if (fields.length < 3) continue; // Must at least have word, meaning

    const word = fields[0] || '';
    const ipa = fields[1] || '';
    const vietnameseMeaning = fields[2] || '';
    const exampleEnglish = fields[3] || '';
    const exampleVietnamese = fields[4] || '';
    const level = fields[5] || 'A1';
    const topic = fields[6] || 'Từ của tôi';

    results.push({
      word,
      ipa,
      vietnameseMeaning,
      exampleEnglish,
      exampleVietnamese,
      level,
      topic,
      isCustom: true,
      isLearned: false,
      isFavorite: false,
    });
  }

  return results;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        currentField += '"';
        i++; // skip double double-quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(currentField);
      currentField = '';
    } else {
      currentField += char;
    }
  }
  result.push(currentField);
  return result;
}

export function generateCSV(words: Word[]): string {
  const headers = ['Word', 'IPA', 'VietnameseMeaning', 'ExampleEnglish', 'ExampleVietnamese', 'Level', 'Topic'];
  const rows = words.map(w => [
    escapeCSVField(w.word),
    escapeCSVField(w.ipa),
    escapeCSVField(w.vietnameseMeaning),
    escapeCSVField(w.exampleEnglish),
    escapeCSVField(w.exampleVietnamese),
    escapeCSVField(w.level),
    escapeCSVField(w.topic)
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

function escapeCSVField(field: string): string {
  if (!field) return '';
  const needsQuotes = field.includes(',') || field.includes('"') || field.includes('\n') || field.includes('\r');
  if (needsQuotes) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}
