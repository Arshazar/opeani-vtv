import OpenAI from 'openai';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ModelT = OpenAI.ChatModel;
type SpeakerT = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export const SPEAKERS: SpeakerT[] = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];

interface ModelStore {
  selectedModel: ModelT;
  setModel: (model: ModelT) => void;
  selectedSpeaker: SpeakerT;
  setSpeaker: (speaker: SpeakerT) => void;
}

export const useModelStore = create<ModelStore>()(
  persist(
    (set) => ({
      selectedModel: 'gpt-4o',
      setModel: (model) => set({ selectedModel: model }),
      selectedSpeaker: 'alloy',
      setSpeaker: (speaker) => set({ selectedSpeaker: speaker }),
    }),
    {
      name: 'model-storage',
    },
  ),
);
