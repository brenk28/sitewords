import { sightWords, type SightWords, type InsertSightWords, type UpdateSightWords } from "@shared/schema";

export interface IStorage {
  getSightWords(userId: string): Promise<SightWords | undefined>;
  createSightWords(data: InsertSightWords): Promise<SightWords>;
  updateSightWords(userId: string, data: UpdateSightWords): Promise<SightWords | undefined>;
}

export class MemStorage implements IStorage {
  private sightWords: Map<string, SightWords>;
  currentId: number;

  constructor() {
    this.sightWords = new Map();
    this.currentId = 1;
  }

  async getSightWords(userId: string): Promise<SightWords | undefined> {
    return this.sightWords.get(userId);
  }

  async createSightWords(data: InsertSightWords): Promise<SightWords> {
    const id = this.currentId++;
    const record: SightWords = {
      id,
      words: data.words,
      randomOrder: data.randomOrder ?? false,
      autoAdvance: data.autoAdvance ?? false,
      speechEnabled: data.speechEnabled ?? true,
      speechRate: data.speechRate ?? "0.8",
      speechPitch: data.speechPitch ?? "1.0",
      speechVoice: data.speechVoice ?? null,
      userId: data.userId ?? "default",
    };
    this.sightWords.set(record.userId, record);
    return record;
  }

  async updateSightWords(userId: string, data: UpdateSightWords): Promise<SightWords | undefined> {
    const existing = this.sightWords.get(userId);
    
    if (!existing) {
      return undefined;
    }

    const updated: SightWords = {
      ...existing,
      ...data
    };

    this.sightWords.set(userId, updated);
    return updated;
  }
}

// Initialize with default words - using the user's requested word list
const defaultWords = [
  'I', 'the', 'am', 'like', 'to', 'a', 'have', 'he', 'is', 'we', 
  'my', 'make', 'for', 'me', 'with', 'are', 'that', 'of', 'they', 'you',
  'do', 'one', 'two', 'three', 'four', 'five', 'here', 'go', 'from', 'yellow',
  'what', 'when', 'why', 'who', 'come', 'play', 'any', 'down', 'her', 'how',
  'away', 'give', 'little', 'funny', 'were', 'some', 'find', 'again', 'over', 'all',
  'now', 'pretty', 'brown', 'black', 'white', 'good', 'open', 'could', 'please', 'want',
  'every', 'be', 'saw', 'our', 'eat', 'soon', 'walk', 'into', 'there'
];

export const storage = new MemStorage();

// Initialize default sight words for the default user
storage.createSightWords({
  userId: "default",
  words: defaultWords,
  randomOrder: false,
  autoAdvance: false,
  speechEnabled: true,
  speechRate: "0.8",
  speechPitch: "1.0",
  speechVoice: undefined
});
