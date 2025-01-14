'use server';

import OpenAI from 'openai';

import { MessageT } from '@/types';
import { useModelStore } from '@/store';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function sendMessage(base64Audio: string, messages: MessageT[]) {
  const { selectedModel, selectedSpeaker } = useModelStore.getState();
  const newMessages: MessageT[] = [];
  try {
    // Convert base64 to Blob
    const binaryStr = Buffer.from(base64Audio, 'base64');
    const audioBlob = new Blob([binaryStr], { type: 'audio/webm' });

    // 1. Convert audio to text
    const transcriptionResponse = await openai.audio.transcriptions.create({
      file: new File([audioBlob], 'audio.webm'),
      model: 'whisper-1',
    });

    const userText = transcriptionResponse.text;
    newMessages.push({ role: 'user', content: userText });

    // 2. Get GPT-4 response
    const chatResponse = await openai.chat.completions.create({
      model: selectedModel,
      messages: [...messages, { role: 'user', content: userText }],
    });

    const assistantResponse = chatResponse.choices[0].message.content;
    newMessages.push({ role: 'assistant', content: assistantResponse ?? '' });

    if (!assistantResponse) throw new Error('No response from GPT');

    // 3. Convert response to speech
    const speechResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: selectedSpeaker,
      input: assistantResponse,
    });

    // 4. Convert the speech response to base64
    const arrayBuffer = await speechResponse.arrayBuffer();
    const base64Response = Buffer.from(arrayBuffer).toString('base64');

    return {
      success: true,
      audioData: base64Response,
      messages: newMessages,
    };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return {
      success: false,
      error: 'Failed to process the message',
    };
  }
}
