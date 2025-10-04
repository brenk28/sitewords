import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SightWords, UpdateSightWords } from "@shared/schema";

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

export const SightWordProvider = ({ children }: SightWordProviderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { toast } = useToast();

  // Fetch sight words data
  const { data, isLoading } = useQuery({
    queryKey: ["/api/sight-words"],
    retry: 1,
  });

  const sightWordsData = data as SightWords | undefined;
  
  // Default words if data is not loaded yet
  const words = sightWordsData?.words || [];
  const randomOrder = sightWordsData?.randomOrder || false;
  const autoAdvance = sightWordsData?.autoAdvance || false;
  const speechEnabled = sightWordsData?.speechEnabled ?? true;
  const speechRate = sightWordsData?.speechRate || "0.8";
  const speechPitch = sightWordsData?.speechPitch || "1.0";
  const speechVoice = sightWordsData?.speechVoice || undefined;

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

  // Update settings mutation
  const { mutate, isPending: isSaving } = useMutation({
    mutationFn: async (data: UpdateSightWords) => {
      return apiRequest("POST", "/api/sight-words", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sight-words"] });
      toast({
        title: "Settings saved",
        description: "Your sight words have been updated successfully.",
      });
      setIsSettingsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Failed to save settings",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

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
    mutate(data);
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
        isLoading,
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
