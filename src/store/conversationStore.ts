import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { MessageT } from '@/types';

interface ConversationStore {
  messages: MessageT[];
  addMessages: (messages: MessageT[]) => void;
  clearMessages: () => void;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set) => ({
      messages: [],
      addMessages: (messages) =>
        set((state) => ({
          messages: [...state.messages, ...messages],
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'conversation-storage',
    },
  ),
);
