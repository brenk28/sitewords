import { useCallback, useRef, useState, useEffect } from 'react';

export interface SpeechSettings {
  enabled: boolean;
  rate: number;
  pitch: number;
  volume: number;
  voice?: string;
}

export interface UseSpeechReturn {
  speak: (text: string) => Promise<void>;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  settings: SpeechSettings;
  updateSettings: (settings: Partial<SpeechSettings>) => void;
}

const DEFAULT_SETTINGS: SpeechSettings = {
  enabled: true,
  rate: 0.8, // Slightly slower for learning
  pitch: 1.0,
  volume: 0.8, // Slightly lower than max - some browsers have issues with 1.0
  voice: undefined, // Will use default system voice
};

export const useSpeech = (initialSettings?: Partial<SpeechSettings>): UseSpeechReturn => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<SpeechSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });

  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Check for browser support and load voices
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
      setIsSupported(supported);

      if (supported) {
        // Load voices with Firefox-specific handling
        const loadVoices = () => {
          const availableVoices = speechSynthesis.getVoices();
          console.log("Loading voices:", availableVoices.length, availableVoices.map(v => `${v.name} (${v.lang})`));
          setVoices(availableVoices);
        };

        // Browser detection for specific handling
        const isFirefox = /firefox/i.test(navigator.userAgent);
        const isChromium = /chromium/i.test(navigator.userAgent);
        
        // Load voices immediately
        loadVoices();
        
        if (isFirefox || isChromium) {
          // Firefox/Chromium: onvoiceschanged is unreliable, use timeout approach
          console.log(`${isFirefox ? 'Firefox' : 'Chromium'} detected: using timeout-based voice loading`);
          const timeouts = [50, 100, 250, 500, 1000, 2000];
          timeouts.forEach(delay => {
            setTimeout(loadVoices, delay);
          });
        } else {
          // Other browsers: use standard event
          if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
          }
        }

        // One-time warm-up to initialize the speech engine (fixes Chrome/Safari issues)
        setTimeout(() => {
          try {
            speechSynthesis.cancel();
            const warmupUtterance = new SpeechSynthesisUtterance('');
            warmupUtterance.volume = 0;
            speechSynthesis.speak(warmupUtterance);
            speechSynthesis.cancel();
            console.log("Speech engine warm-up completed");
          } catch (error) {
            console.warn("Speech engine warm-up failed:", error);
          }
        }, 100);

        // Browser voice availability check after loading attempts
        if (isFirefox || isChromium) {
          setTimeout(() => {
            const voices = speechSynthesis.getVoices();
            if (voices.length === 0) {
              if (isChromium) {
                console.warn("Chromium: No voices available. On Raspberry Pi, launch Chromium with: chromium-browser --enable-speech-dispatcher");
                console.warn("Also install: sudo apt-get install espeak espeak-ng speech-dispatcher");
              } else {
                console.warn("Firefox: No voices available. This may be due to missing system dependencies (speech-dispatcher, espeak-ng).");
                console.warn("Try using Chrome or Safari for better speech synthesis compatibility.");
              }
            }
          }, 3000); // Check after all loading attempts
        }
      }
    };

    checkSupport();
  }, []);

  const speak = useCallback(async (text: string): Promise<void> => {
    if (!isSupported || !settings.enabled || !text.trim()) {
      return Promise.resolve();
    }

    // Cancel any pending or speaking utterances
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
    }

    // Wait for voices to load if they haven't already
    let availableVoices = speechSynthesis.getVoices();
    if (availableVoices.length === 0) {
      console.log("Waiting for voices to load...");
      for (let i = 0; i < 20; i++) { // Wait up to 1 second
        await new Promise(resolve => setTimeout(resolve, 50));
        availableVoices = speechSynthesis.getVoices();
        if (availableVoices.length > 0) break;
      }
      setVoices(availableVoices);
    }

    return new Promise((resolve, reject) => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        currentUtterance.current = utterance;

        // Apply settings
        utterance.rate = settings.rate;
        utterance.pitch = settings.pitch;
        utterance.volume = settings.volume;

        // Set voice and language with Firefox fallbacks
        let selectedVoice = null;
        if (settings.voice && availableVoices.length > 0) {
          selectedVoice = availableVoices.find(voice => voice.name === settings.voice);
        }
        
        // Firefox fallback: if no specific voice selected, try to find an English voice
        if (!selectedVoice && availableVoices.length > 0) {
          selectedVoice = availableVoices.find(voice => 
            voice.lang.toLowerCase().startsWith('en')
          ) || availableVoices[0]; // Use first available as ultimate fallback
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang;
          console.log("Using voice:", selectedVoice.name, "language:", selectedVoice.lang);
        } else {
          // No voices available - let browser use default
          utterance.lang = navigator.language || 'en-US';
          console.log("Using default browser voice, language:", utterance.lang);
        }

        // Event handlers
        utterance.onstart = () => {
          setIsSpeaking(true);
          console.log("Speech started for:", text);
        };

        utterance.onend = () => {
          setIsSpeaking(false);
          currentUtterance.current = null;
          console.log("Speech ended for:", text);
          resolve();
        };

        utterance.onerror = (event) => {
          setIsSpeaking(false);
          currentUtterance.current = null;
          console.error('Speech synthesis error:', event);
          reject(new Error(`Speech synthesis failed: ${event.error}`));
        };

        // Speak the text
        console.log("Speaking with voice:", selectedVoice?.name || "default", "lang:", utterance.lang);
        speechSynthesis.speak(utterance);
      } catch (error) {
        setIsSpeaking(false);
        currentUtterance.current = null;
        reject(error);
      }
    });
  }, [isSupported, settings]);

  const stop = useCallback(() => {
    if (isSupported && (speechSynthesis.speaking || speechSynthesis.pending)) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      currentUtterance.current = null;
    }
  }, [isSupported]);

  const updateSettings = useCallback((newSettings: Partial<SpeechSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
    voices,
    settings,
    updateSettings,
  };
};