import { useState, useEffect } from "react";
import { useSightWord } from "@/context/SightWordContext";
import { useSpeech } from "@/hooks/useSpeech";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { X, Save, Volume2 } from "lucide-react";

// Default words when user wants to reset
const DEFAULT_WORDS = [
  'the', 'and', 'to', 'a', 'is', 'you', 'that', 'it', 'he', 'was',
  'for', 'on', 'are', 'as', 'with', 'his', 'they', 'at', 'be', 'this',
  'have', 'from', 'one', 'had', 'by', 'word'
];

export function SettingsModal() {
  const { 
    words, 
    randomOrder, 
    autoAdvance, 
    speechEnabled,
    speechRate,
    speechPitch,
    speechVoice,
    isSettingsOpen, 
    closeSettings, 
    saveSettings, 
    isSaving 
  } = useSightWord();

  // Get available voices from the speech hook
  const { voices, isSupported } = useSpeech();
  
  // Local state for form fields
  const [wordsText, setWordsText] = useState("");
  const [isRandomOrder, setIsRandomOrder] = useState(false);
  const [isAutoAdvance, setIsAutoAdvance] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [localSpeechRate, setLocalSpeechRate] = useState([0.8]);
  const [localSpeechPitch, setLocalSpeechPitch] = useState([1.0]);
  const [localSpeechVoice, setLocalSpeechVoice] = useState<string | undefined>(undefined);

  // Initialize form when modal opens
  useEffect(() => {
    if (isSettingsOpen) {
      setWordsText(words.join("\n"));
      setIsRandomOrder(randomOrder);
      setIsAutoAdvance(autoAdvance);
      setIsSpeechEnabled(speechEnabled);
      setLocalSpeechRate([parseFloat(speechRate)]);
      setLocalSpeechPitch([parseFloat(speechPitch)]);
      setLocalSpeechVoice(speechVoice || undefined);
    }
  }, [isSettingsOpen, words, randomOrder, autoAdvance, speechEnabled, speechRate, speechPitch, speechVoice]);

  // Handle form submission
  const handleSave = () => {
    // Parse words from textarea
    const wordsList = wordsText
      .split("\n")
      .map(word => word.trim())
      .filter(word => word.length > 0);
    
    saveSettings({
      words: wordsList,
      randomOrder: isRandomOrder,
      autoAdvance: isAutoAdvance,
      speechEnabled: isSpeechEnabled,
      speechRate: localSpeechRate[0].toString(),
      speechPitch: localSpeechPitch[0].toString(),
      speechVoice: localSpeechVoice,
    });
  };
  
  // Reset to default words
  const resetToDefault = () => {
    setWordsText(DEFAULT_WORDS.join("\n"));
  };

  return (
    <Dialog open={isSettingsOpen} onOpenChange={open => !open && closeSettings()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between">
            <span>Settings</span>
            <Button variant="ghost" size="icon" onClick={closeSettings}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="wordList" className="text-sm font-medium mb-2">
              Sight Words List
            </Label>
            <p className="text-sm text-gray-500 mb-3">
              Enter one word per line. These are the words that will be displayed during practice.
            </p>
            <Textarea
              id="wordList"
              value={wordsText}
              onChange={(e) => setWordsText(e.target.value)}
              rows={10}
              className="font-mono" // Monospace font is better for lists
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium mb-2">
              Display Options
            </Label>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="randomOrder" 
                  checked={isRandomOrder}
                  onCheckedChange={(checked) => setIsRandomOrder(!!checked)}
                />
                <Label htmlFor="randomOrder" className="text-sm text-gray-700 cursor-pointer">
                  Random order
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="autoAdvance" 
                  checked={isAutoAdvance}
                  onCheckedChange={(checked) => setIsAutoAdvance(!!checked)}
                />
                <Label htmlFor="autoAdvance" className="text-sm text-gray-700 cursor-pointer">
                  Auto-advance (3 seconds)
                </Label>
              </div>
            </div>
          </div>

          {isSupported && (
            <div>
              <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Speech Settings
              </Label>
              
              <div className="space-y-4 mt-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="speechEnabled" 
                    checked={isSpeechEnabled}
                    onCheckedChange={(checked) => setIsSpeechEnabled(!!checked)}
                  />
                  <Label htmlFor="speechEnabled" className="text-sm text-gray-700 cursor-pointer">
                    Read words aloud
                  </Label>
                </div>
                
                {isSpeechEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="speechRate" className="text-sm text-gray-700">
                        Speech Rate: {localSpeechRate[0].toFixed(1)}x
                      </Label>
                      <Slider
                        id="speechRate"
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        value={localSpeechRate}
                        onValueChange={setLocalSpeechRate}
                        className="w-full"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="speechPitch" className="text-sm text-gray-700">
                        Speech Pitch: {localSpeechPitch[0].toFixed(1)}
                      </Label>
                      <Slider
                        id="speechPitch"
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        value={localSpeechPitch}
                        onValueChange={setLocalSpeechPitch}
                        className="w-full"
                      />
                    </div>
                    
                    {voices.length > 0 && (
                      <div className="space-y-2">
                        <Label htmlFor="speechVoice" className="text-sm text-gray-700">
                          Voice
                        </Label>
                        <Select value={localSpeechVoice || ""} onValueChange={(value) => setLocalSpeechVoice(value || undefined)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a voice (default will be used if none selected)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">Default System Voice</SelectItem>
                            {voices.map((voice) => (
                              <SelectItem key={voice.name} value={voice.name}>
                                {voice.name} ({voice.lang})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="sm:justify-between flex-row-reverse sm:flex-row gap-2">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
          <Button 
            variant="outline" 
            onClick={resetToDefault}
          >
            Reset to Default
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
