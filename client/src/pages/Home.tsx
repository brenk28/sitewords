import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SightWordDisplay } from "@/components/SightWordDisplay";
import { SettingsModal } from "@/components/SettingsModal";
import { useSightWord } from "@/context/SightWordContext";

export default function Home() {
  const { openSettings } = useSightWord();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-slate-50">
      {/* Header with title and settings button */}
      <header className="w-full max-w-4xl flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-indigo-600 sm:text-3xl">Sight Words</h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={openSettings}
          className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors rounded-full"
        >
          <Settings className="h-6 w-6" />
        </Button>
      </header>

      {/* Main word display area */}
      <main className="flex-grow w-full max-w-4xl">
        <SightWordDisplay />
      </main>

      {/* Settings modal */}
      <SettingsModal />
    </div>
  );
}
