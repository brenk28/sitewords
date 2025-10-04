import { useEffect, useState } from "react";
import { useSightWord } from "@/context/SightWordContext";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSpeech } from "@/hooks/useSpeech";

export function SightWordDisplay() {
  const { 
    words, 
    currentIndex, 
    showNextWord, 
    isLoading, 
    speechEnabled, 
    speechRate, 
    speechPitch, 
    speechVoice 
  } = useSightWord();

  // Track user interaction to enable speech (browsers require user interaction)
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Initialize speech hook
  const { speak, isSupported, updateSettings, settings } = useSpeech();


  // Update speech settings when context values change
  useEffect(() => {
    updateSettings({
      enabled: speechEnabled,
      rate: parseFloat(speechRate),
      pitch: parseFloat(speechPitch),
      voice: speechVoice,
    });
  }, [speechEnabled, speechRate, speechPitch, speechVoice, updateSettings]);

  // Set up keyboard handler for space bar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault(); // Prevent page scroll
        setHasUserInteracted(true); // Mark user interaction for speech
        showNextWord();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showNextWord]);

  // Speak the current word when it changes (only after user interaction)
  useEffect(() => {
    if (words.length > 0 && speechEnabled && isSupported && hasUserInteracted) {
      const currentWord = words[currentIndex];
      if (currentWord) {
        console.log("Speaking word:", currentWord);
        speak(currentWord).catch((error) => {
          console.error("Failed to speak word:", currentWord, error);
          console.error("Speech synthesis state:", {
            speaking: speechSynthesis.speaking,
            pending: speechSynthesis.pending,
            paused: speechSynthesis.paused
          });
        });
      }
    }
  }, [currentIndex, words, speechEnabled, speak, isSupported, hasUserInteracted]);

  // Render loading state or empty state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow w-full">
        <Card className="bg-white rounded-xl shadow-lg p-10 sm:p-16 w-full max-w-4xl flex items-center justify-center transition-all duration-300 hover:shadow-xl">
          <Skeleton className="h-24 w-3/4" />
        </Card>
        <div className="mt-8 text-gray-500 text-sm sm:text-base flex items-center">
          <Skeleton className="h-6 w-64" />
        </div>
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-grow w-full">
        <Card className="bg-white rounded-xl shadow-lg p-10 sm:p-16 w-full max-w-4xl flex items-center justify-center transition-all duration-300 hover:shadow-xl">
          <div className="text-2xl sm:text-3xl text-gray-500 text-center">
            No words added yet. Click settings to add some words!
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-center flex-grow w-full cursor-pointer"
      onClick={() => {
        setHasUserInteracted(true); // Mark user interaction for speech
        showNextWord();
      }}
    >
      <Card className="bg-white rounded-xl shadow-lg p-10 sm:p-16 w-full max-w-4xl flex items-center justify-center transition-all duration-300 hover:shadow-xl">
        <div
          key={currentIndex} // Key helps with animation when word changes
          className="text-6xl sm:text-8xl font-bold text-center animate-in fade-in duration-300"
        >
          {words[currentIndex]}
        </div>
      </Card>
      
      <div className="mt-8 text-gray-500 text-sm sm:text-base flex items-center">
        <span>
          {!hasUserInteracted && speechEnabled && isSupported
            ? "Click anywhere or press spacebar to start (with speech)"
            : "Click anywhere or press spacebar to continue"}
        </span>
      </div>
      
      <div className="mt-4 text-gray-400 text-sm">
        Word {currentIndex + 1} of {words.length}
      </div>
    </div>
  );
}
