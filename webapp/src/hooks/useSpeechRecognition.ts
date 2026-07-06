import { useState, useEffect, useRef, useCallback } from 'react';
import { evaluatePronunciation } from '../utils/levenshtein';

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [scoreInfo, setScoreInfo] = useState<{ score: number; message: string } | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsRecording(true);
        setTranscript('');
        setScoreInfo(null);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      rec.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current = rec;
      setPermissionGranted(true);
    } else {
      console.warn('Speech recognition not supported in this browser.');
    }
  }, []);

  const startRecording = useCallback((targetWord: string) => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setTranscript(resultText);
        
        const evaluation = evaluatePronunciation(targetWord, resultText);
        setScoreInfo(evaluation);
      };

      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.error(e);
    }
  }, []);

  return {
    transcript,
    isRecording,
    permissionGranted,
    scoreInfo,
    startRecording,
    stopRecording
  };
}
