import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";
import { UpdateSightWords } from "@shared/schema";

interface SightWordContextType {
  words: string[];
  currentIndex: number;
  randomOrder: boolean;
  autoAdvance: boolean;
  speechEnabled: boolean;
  speechRate: string;
  speechPitch: string;
  speechVoice?: string;
  isLoading: boolean;
  isSettingsOpen: boolean;
  showNextWord: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  saveSettings: (data: UpdateSightWords) => void;
  isSaving: boolean;
}

const SightWordContext = createContext<SightWordContextType | undefined>(undefined);

interface SightWordProviderProps {
  children: ReactNode;
}

// Default words
const DEFAULT_WORDS = [
  'I', 'the', 'am', 'like', 'to', 'a', 'have', 'he', 'is', 'we',
  'my', 'make', 'for', 'me', 'with', 'are', 'that', 'of', 'they', 'you',
  'do', 'one', 'two', 'three', 'four', 'five', 'here', 'go', 'from', 'yellow',
  'what', 'when', 'why', 'who', 'come', 'play', 'any', 'down', 'her', 'how',
  'away', 'give', 'little', 'funny', 'were', 'some', 'find', 'again', 'over', 'all',
  'now', 'pretty', 'brown', 'black', 'white', 'good', 'open', 'could', 'please', 'want',
  'every', 'be', 'saw', 'our', 'eat', 'soon', 'walk', 'into', 'there'
];

const STORAGE_KEY = 'sightwords-settings';

// Load settings from localStorage
const loadSettings = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
  return {
    words: DEFAULT_WORDS,
    randomOrder: false,
    autoAdvance: false,
    speechEnabled: true,
    speechRate: "0.8",
    speechPitch: "1.0",
    speechVoice: undefined,
  };
};

export const SightWordProvider = ({ children }: SightWordProviderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Load settings from localStorage
  const [settings, setSettings] = useState(loadSettings);

  const words = settings.words;
  const randomOrder = settings.randomOrder;
  const autoAdvance = settings.autoAdvance;
  const speechEnabled = settings.speechEnabled;
  const speechRate = settings.speechRate;
  const speechPitch = settings.speechPitch;
  const speechVoice = settings.speechVoice;

  // Set up autoAdvance timer
  useEffect(() => {
    let timer: NodeJS.Timeout | undefined;
    
    if (autoAdvance && words.length > 0) {
      timer = setTimeout(() => {
        showNextWord();
      }, 3000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [currentIndex, autoAdvance, words]);

  // Save settings to localStorage
  const saveSettingsToStorage = (data: UpdateSightWords) => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setSettings(data);
      toast({
        title: "Settings saved",
        description: "Your sight words have been updated successfully.",
      });
      setIsSettingsOpen(false);
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast({
        title: "Failed to save settings",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const showNextWord = () => {
    if (words.length === 0) return;
    
    setCurrentIndex((prevIndex) => {
      // If random, generate a random index different from the current one
      if (randomOrder) {
        let newIndex = prevIndex;
        // Make sure we get a different index if there's more than one word
        if (words.length > 1) {
          while (newIndex === prevIndex) {
            newIndex = Math.floor(Math.random() * words.length);
          }
        }
        return newIndex;
      } else {
        // Otherwise just go to the next word in sequence
        return (prevIndex + 1) % words.length;
      }
    });
  };

  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  const saveSettings = (data: UpdateSightWords) => {
    saveSettingsToStorage(data);
    // Reset to the first word when settings change
    setCurrentIndex(0);
  };

  return (
    <SightWordContext.Provider
      value={{
        words,
        currentIndex,
        randomOrder,
        autoAdvance,
        speechEnabled,
        speechRate,
        speechPitch,
        speechVoice,
        isLoading: false,
        isSettingsOpen,
        showNextWord,
        openSettings,
        closeSettings,
        saveSettings,
        isSaving,
      }}
    >
      {children}
    </SightWordContext.Provider>
  );
};

export const useSightWord = () => {
  const context = useContext(SightWordContext);
  if (context === undefined) {
    throw new Error("useSightWord must be used within a SightWordProvider");
  }
  return context;
};
