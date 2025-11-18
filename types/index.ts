import { Novel, Character, Chapter, Scene, Memory, WorldSetting, Timeline, PlotPoint, Relationship } from '@prisma/client'

// Extended types with relations
export type NovelWithRelations = Novel & {
  characters: Character[]
  chapters: (Chapter & { scenes: Scene[] })[]
  worldSettings: WorldSetting[]
  memories: Memory[]
  timelines: Timeline[]
  plotPoints: PlotPoint[]
}

export type CharacterWithRelations = Character & {
  relationships: (Relationship & { toCharacter: Character })[]
  relationshipsTo: (Relationship & { fromCharacter: Character })[]
  appearances: Scene[]
}

export type ChapterWithRelations = Chapter & {
  scenes: (Scene & { characters: Character[] })[]
  plotPoints: PlotPoint[]
}

// AI Generation types
export interface GenerationContext {
  novelId: string
  chapterNumber?: number
  recentContent?: string
  relevantCharacters?: Character[]
  relevantMemories?: Memory[]
  worldSettings?: WorldSetting[]
  plotPoints?: PlotPoint[]
}

export interface GenerationRequest {
  type: 'chapter' | 'scene' | 'dialogue' | 'description'
  prompt: string
  context: GenerationContext
  tone?: string
  length?: 'short' | 'medium' | 'long'
}

export interface ConsistencyCheck {
  type: 'character' | 'timeline' | 'setting' | 'plot'
  isConsistent: boolean
  conflicts: string[]
  suggestions: string[]
}

export interface ReadabilityMetrics {
  wordCount: number
  sentenceCount: number
  avgSentenceLength: number
  readingLevel: string
  sentiment: 'positive' | 'negative' | 'neutral'
  pacing: 'fast' | 'medium' | 'slow'
}
