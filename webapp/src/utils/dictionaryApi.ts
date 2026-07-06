export interface LookupResult {
  word: string;
  ipa: string;
  vietnameseMeaning: string;
  exampleEnglish: string;
  exampleVietnamese: string;
  symbolName: string;
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
  let exampleEnglish = '';
  
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);
    if (response.ok) {
      const data = await response.json();
      const entry = data[0];
      
      // Resolve IPA
      if (entry.phonetic) {
        ipa = entry.phonetic;
      } else if (entry.phonetics && entry.phonetics.length > 0) {
        const withText = entry.phonetics.find((p: any) => p.text);
        if (withText) ipa = withText.text;
      }

      // Find example sentence
      if (entry.meanings) {
        for (const meaning of entry.meanings) {
          if (meaning.definitions) {
            for (const def of meaning.definitions) {
              if (def.example) {
                exampleEnglish = def.example;
                break;
              }
            }
          }
          if (exampleEnglish) break;
        }
      }
    }
  } catch (error) {
    console.error('Dictionary API lookup error:', error);
  }

  // Google Translate the word
  const vietnameseMeaning = await translateText(cleanWord, 'en', 'vi');

  // Google Translate the example (if any)
  let exampleVietnamese = '';
  if (exampleEnglish) {
    exampleVietnamese = await translateText(exampleEnglish, 'en', 'vi');
  }

  const symbolName = resolveSymbolName(cleanWord);

  return {
    word: cleanWord,
    ipa: ipa || '/.../',
    vietnameseMeaning: vietnameseMeaning || 'Chưa rõ nghĩa',
    exampleEnglish: exampleEnglish || `This is a sentence containing the word ${cleanWord}.`,
    exampleVietnamese: exampleVietnamese || `Đây là câu ví dụ chứa từ ${cleanWord}.`,
    symbolName,
  };
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
