import { create } from 'zustand';
import { Novel, Character, Chapter } from '@prisma/client';
import { NovelWithRelations } from '@/types';

interface AppState {
  currentNovel: NovelWithRelations | null;
  setCurrentNovel: (novel: NovelWithRelations | null) => void;

  currentChapter: Chapter | null;
  setCurrentChapter: (chapter: Chapter | null) => void;

  isGenerating: boolean;
  setIsGenerating: (generating: boolean) => void;

  selectedCharacters: Character[];
  setSelectedCharacters: (characters: Character[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentNovel: null,
  setCurrentNovel: (novel) => set({ currentNovel: novel }),

  currentChapter: null,
  setCurrentChapter: (chapter) => set({ currentChapter: chapter }),

  isGenerating: false,
  setIsGenerating: (generating) => set({ isGenerating: generating }),

  selectedCharacters: [],
  setSelectedCharacters: (characters) => set({ selectedCharacters: characters }),
}));
