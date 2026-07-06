import { useState, useEffect, useRef, useCallback } from 'react';
import { evaluatePronunciation } from '../utils/levenshtein';

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [scoreInfo, setScoreInfo] = useState<{ score: number; message: string } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

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
        setAudioUrl(null);
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

  const startRecording = useCallback(async (targetWord: string) => {
    if (!recognitionRef.current) return;
    
    try {
      // 1. Request microphone access for audio recording in parallel
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();

      // 2. Start speech recognizer transcriptions
      recognitionRef.current.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        setTranscript(resultText);
        
        const evaluation = evaluatePronunciation(targetWord, resultText);
        setScoreInfo(evaluation);
      };

      recognitionRef.current.start();
    } catch (e) {
      console.error('Mic record failed:', e);
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    // Stop WebSpeech Recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    // Stop Media Recorder and release microphone hardware
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  return {
    transcript,
    isRecording,
    permissionGranted,
    scoreInfo,
    audioUrl,
    startRecording,
    stopRecording
  };
}
