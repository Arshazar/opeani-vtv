'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useModelStore, SPEAKERS, useConversationStore } from '@/store';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { clearMessages } = useConversationStore();
  const { selectedModel, setModel, selectedSpeaker, setSpeaker } = useModelStore();

  const handleClearHistory = () => {
    clearMessages();
    toast.success('History cleared');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-2 md:px-4">
        <div className="flex xs:hidden">
          <span className="font-semibold text-sm">OpenAI Voice Chat</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Select value={selectedModel} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
              <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedSpeaker} onValueChange={setSpeaker}>
            <SelectTrigger>
              <SelectValue placeholder="Select Voice" />
            </SelectTrigger>
            <SelectContent>
              {SPEAKERS.map((speaker) => (
                <SelectItem key={speaker} value={speaker}>
                  {speaker}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleClearHistory}>
            Clear History
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 sm:h-9 sm:w-9"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            <Sun className="h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 sm:h-[1.2rem] sm:w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
