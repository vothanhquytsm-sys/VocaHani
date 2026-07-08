export interface DictionaryMeaning {
  partOfSpeech: string;
  vietnamesePOS: string;
  definition: string;
  vietnameseDefinition: string;
  exampleEnglish?: string;
  exampleVietnamese?: string;
}

export interface LookupResult {
  word: string;
  ipa: string;
  vietnameseMeaning: string;
  exampleEnglish: string;
  exampleVietnamese: string;
  symbolName: string;
  meaningsList: DictionaryMeaning[];
  audioUk?: string;
  audioUs?: string;
}

export async function translateText(text: string, from = 'en', to = 'vi'): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data && data[0]) {
      return data[0].map((item: any) => item[0]).join('').trim();
    }
    return '';
  } catch (error) {
    console.error('Translation error:', error);
    return '';
  }
}

export async function lookupDictionary(word: string): Promise<LookupResult> {
  const cleanWord = word.trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "");
  
  let ipa = '';
  let meaningsList: DictionaryMeaning[] = [];
  let audioUk = '';
  let audioUs = '';
  
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
    if (response.ok) {
      const data = await response.json();
      const entry = data[0];
      
      // Resolve IPA phonetic transcriptions & audio pronunciations (UK vs US)
      if (entry.phonetic) {
        ipa = entry.phonetic;
      } else if (entry.phonetics && entry.phonetics.length > 0) {
        const withText = entry.phonetics.find((p: any) => p.text);
        if (withText) ipa = withText.text;
      }

      if (entry.phonetics && Array.isArray(entry.phonetics)) {
        for (const p of entry.phonetics) {
          if (p.audio) {
            if (p.audio.includes('-uk') || p.audio.endsWith('uk.mp3')) {
              audioUk = p.audio;
            } else if (p.audio.includes('-us') || p.audio.endsWith('us.mp3')) {
              audioUs = p.audio;
            } else {
              if (!audioUs) audioUs = p.audio;
              else if (!audioUk) audioUk = p.audio;
            }
          }
        }
      }

      // Parse meanings and translate definitions
      if (entry.meanings && Array.isArray(entry.meanings)) {
        for (const m of entry.meanings.slice(0, 3)) { // Top 3 parts of speech
          const pos = m.partOfSpeech || 'other';
          const viPOS = translatePOS(pos);
          
          if (m.definitions && Array.isArray(m.definitions)) {
            for (const d of m.definitions.slice(0, 2)) { // Top 2 definitions per POS
              const defText = d.definition;
              const viDefText = await translateText(defText, 'en', 'vi');
              
              let exEn = d.example || '';
              
              // Generate smart descriptive context example if generic/empty
              if (!exEn || exEn.split(' ').length < 4) {
                exEn = generateSmartExample(cleanWord, pos);
              }
              
              const exVi = await translateText(exEn, 'en', 'vi');
              
              meaningsList.push({
                partOfSpeech: pos,
                vietnamesePOS: viPOS,
                definition: defText,
                vietnameseDefinition: viDefText,
                exampleEnglish: exEn,
                exampleVietnamese: exVi
              });
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Dictionary API lookup error:', error);
  }

  // Fallback if no definitions were successfully parsed
  if (meaningsList.length === 0) {
    const vietnameseMeaning = await translateText(cleanWord, 'en', 'vi');
    const exEn = `It is interesting to study how ${cleanWord} functions in various contexts.`;
    const exVi = await translateText(exEn, 'en', 'vi');
    meaningsList.push({
      partOfSpeech: 'other',
      vietnamesePOS: 'Từ loại khác',
      definition: cleanWord,
      vietnameseDefinition: vietnameseMeaning || 'Chưa rõ nghĩa',
      exampleEnglish: exEn,
      exampleVietnamese: exVi
    });
  }

  // Translate the word itself to get a concise Vietnamese meaning
  const conciseVietnamese = await translateText(cleanWord, 'en', 'vi');

  const first = meaningsList[0];
  const symbolName = resolveSymbolName(cleanWord);

  return {
    word: cleanWord,
    ipa: ipa || '/.../',
    vietnameseMeaning: conciseVietnamese || first.vietnameseDefinition,
    exampleEnglish: first.exampleEnglish || '',
    exampleVietnamese: first.exampleVietnamese || '',
    symbolName,
    meaningsList,
    audioUk,
    audioUs
  };
}

function translatePOS(pos: string): string {
  const p = pos.toLowerCase();
  if (p === 'noun') return 'Danh từ';
  if (p === 'verb') return 'Động từ';
  if (p === 'adjective') return 'Tính từ';
  if (p === 'adverb') return 'Trạng từ';
  if (p === 'pronoun') return 'Đại từ';
  if (p === 'preposition') return 'Giới từ';
  if (p === 'conjunction') return 'Liên từ';
  if (p === 'interjection') return 'Thán từ';
  return pos.charAt(0).toUpperCase() + pos.slice(1);
}

function generateSmartExample(word: string, pos: string): string {
  const p = pos.toLowerCase();
  if (p === 'noun') {
    const templates = [
      `The professor explained the complex concept of ${word} during the academic lecture.`,
      `Scientists have discovered that ${word} plays an essential role in this experiment.`,
      `We must evaluate the direct and long-term impact of ${word} on global development.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  if (p === 'verb') {
    const templates = [
      `It is vital to ${word} the instructions carefully before beginning the process.`,
      `He attempted to ${word} his research findings to the committee members clearly.`,
      `They decided to ${word} the infrastructure to improve overall productivity.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  if (p === 'adjective') {
    const templates = [
      `The manager made a ${word} choice that resolved the team's conflict immediately.`,
      `This book provides a ${word} overview of international political relations.`,
      `The results of the project showed a ${word} improvement in user satisfaction.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  if (p === 'adverb') {
    const templates = [
      `The engineer ${word} fixed the server issues before the major system launch.`,
      `The team collaborated ${word} to complete the task ahead of the strict deadline.`,
      `She explained the complex mathematical theory ${word} to the students.`
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  return `This research helps to demonstrate how ${word} influences behavior in different circumstances.`;
}

function resolveSymbolName(word: string): string {
  const w = word.toLowerCase();
  if (w.includes('car') || w.includes('drive') || w.includes('vehicle')) return 'car.fill';
  if (w.includes('eat') || w.includes('food') || w.includes('drink') || w.includes('fruit') || w.includes('vegetable')) return 'fork.knife';
  if (w.includes('book') || w.includes('read') || w.includes('study') || w.includes('learn')) return 'book.fill';
  if (w.includes('animal') || w.includes('dog') || w.includes('cat') || w.includes('bird')) return 'pawprint.fill';
  if (w.includes('home') || w.includes('house') || w.includes('room')) return 'house.fill';
  if (w.includes('work') || w.includes('job') || w.includes('office')) return 'briefcase.fill';
  if (w.includes('play') || w.includes('game') || w.includes('sport')) return 'sportscourt.fill';
  if (w.includes('music') || w.includes('song') || w.includes('listen')) return 'music.note';
  if (w.includes('heart') || w.includes('love') || w.includes('like')) return 'heart.fill';
  if (w.includes('sun') || w.includes('day') || w.includes('weather') || w.includes('sky')) return 'sun.max.fill';
  if (w.includes('money') || w.includes('buy') || w.includes('sell') || w.includes('price')) return 'dollarsign.circle.fill';
  if (w.includes('time') || w.includes('clock') || w.includes('watch')) return 'clock.fill';
  return 'pencil.circle.fill';
}
