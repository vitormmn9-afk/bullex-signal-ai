import { useState, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { soundSystem } from "@/lib/soundSystem";

export function SoundToggle() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('soundEnabled');
    return saved !== 'false';
  });

  useEffect(() => {
    soundSystem.setEnabled(soundEnabled);
    localStorage.setItem('soundEnabled', String(soundEnabled));
  }, [soundEnabled]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setSoundEnabled(!soundEnabled)}
      className="gap-2"
    >
      {soundEnabled ? (
        <>
          <Volume2 className="w-4 h-4" />
          <span className="text-xs">Som ativo</span>
        </>
      ) : (
        <>
          <VolumeX className="w-4 h-4" />
          <span className="text-xs">Som desativado</span>
        </>
      )}
    </Button>
  );
}
