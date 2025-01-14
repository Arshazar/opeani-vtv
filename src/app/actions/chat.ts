'use server';

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function sendMessage(base64Audio: string) {
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

    // 2. Get GPT-4 response
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o-2024-11-20',
      messages: [{ role: 'user', content: userText }],
    });

    const assistantResponse = chatResponse.choices[0].message.content;

    if (!assistantResponse) throw new Error('No response from GPT');

    // 3. Convert response to speech
    const speechResponse = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: assistantResponse,
    });

    // 4. Convert the speech response to base64
    const arrayBuffer = await speechResponse.arrayBuffer();
    const base64Response = Buffer.from(arrayBuffer).toString('base64');

    return {
      success: true,
      audioData: base64Response,
      text: {
        user: userText,
        assistant: assistantResponse,
      },
    };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    return {
      success: false,
      error: 'Failed to process the message',
    };
  }
}
