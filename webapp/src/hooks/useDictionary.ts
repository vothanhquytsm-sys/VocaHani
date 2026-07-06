import { useState, useCallback } from 'react';
import { lookupDictionary, type LookupResult } from '../utils/dictionaryApi';

export function useDictionary(allAvailableWords: string[] = []) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState<LookupResult | null>(null);

  const getSuggestions = useCallback((prefix: string) => {
    if (!prefix || prefix.trim().length === 0) {
      setSuggestions([]);
      return;
    }
    const cleanPrefix = prefix.toLowerCase().trim();
    // Filter suggestions from all available words in the app
    const matches = Array.from(new Set(allAvailableWords))
      .filter(w => w.toLowerCase().startsWith(cleanPrefix))
      .slice(0, 15);
    setSuggestions(matches);
  }, [allAvailableWords]);

  const lookup = useCallback(async (word: string) => {
    setLoading(true);
    setLookupResult(null);
    try {
      const result = await lookupDictionary(word);
      setLookupResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suggestions,
    loading,
    lookupResult,
    getSuggestions,
    lookup,
    setLookupResult,
  };
}
