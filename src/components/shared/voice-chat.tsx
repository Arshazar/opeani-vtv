'use client';
import { useState, useRef } from 'react';
import { sendMessage } from '@/app/actions/chat';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mic, Square } from 'lucide-react';

export function VoiceChat() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string>('');
  const [conversation, setConversation] = useState<{ user: string; assistant: string }[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayer = useRef<HTMLAudioElement>(new Audio());

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        await processAudioAndGetResponse();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError('');
    } catch (err) {
      setError('Error accessing microphone');
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const processAudioAndGetResponse = async () => {
    try {
      setIsProcessing(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

      // Convert Blob to Base64
      const buffer = await audioBlob.arrayBuffer();
      const base64Audio = Buffer.from(buffer).toString('base64');

      const response = await sendMessage(base64Audio);

      if (!response.success) {
        throw new Error(response.error);
      }

      if (response.text) {
        setConversation((prev) => [...prev, response.text]);
      }

      setIsPlaying(true);
      audioPlayer.current.src = `data:audio/mp3;base64,${response.audioData}`;
      audioPlayer.current.play();
    } catch (err) {
      console.error(err);
      setError('Error processing voice chat');
    } finally {
      setIsProcessing(false);
    }
  };

  audioPlayer.current.onended = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
      <Button
        size="icon"
        variant={isRecording ? 'destructive' : 'default'}
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`h-16 w-16 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`}>
        {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
      </Button>

      {isProcessing && <p className="text-sm text-muted-foreground">Processing your message...</p>}
      {isPlaying && (
        <p className="text-sm text-muted-foreground animate-pulse">Playing response...</p>
      )}
      {error && <p className="text-destructive">{error}</p>}
    </div>
  );
}
