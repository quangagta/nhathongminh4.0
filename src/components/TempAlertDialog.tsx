import { useEffect, useRef, useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Thermometer } from "lucide-react";

interface TempAlertDialogProps {
  temperature: number;
  threshold?: number;
  soundEnabled?: boolean;
  soundDuration?: number;
}

export const TempAlertDialog = ({ temperature, threshold = 40, soundEnabled = true, soundDuration = 3 }: TempAlertDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playAlertSound = () => {
    if (!soundEnabled) return;
    
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 600;
      oscillator.type = 'sawtooth';
      
      // Continuous alarm sound with slight volume modulation for urgency
      gainNode.gain.setValueAtTime(0.25, ctx.currentTime);
      
      // Add slight wobble effect for alarm feel
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 4; // 4Hz wobble
      lfoGain.gain.value = 0.1;
      lfo.connect(lfoGain);
      lfoGain.connect(gainNode.gain);
      
      oscillator.start(ctx.currentTime);
      lfo.start(ctx.currentTime);
      
      oscillator.stop(ctx.currentTime + soundDuration);
      lfo.stop(ctx.currentTime + soundDuration);
    } catch (error) {
      console.error('Error playing alert sound:', error);
    }
  };

  useEffect(() => {
    const isAboveThreshold = temperature > threshold;
    
    if (isAboveThreshold && !hasAlerted) {
      setIsOpen(true);
      setHasAlerted(true);
      playAlertSound();
    } else if (!isAboveThreshold && hasAlerted) {
      setHasAlerted(false);
    }
  }, [temperature, threshold, hasAlerted, soundEnabled]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="border-orange-500 bg-orange-950/90 max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-orange-500 rounded-full opacity-50" />
              <Thermometer className="h-16 w-16 text-orange-500 relative z-10 animate-pulse" />
            </div>
          </div>
          <AlertDialogTitle className="text-2xl text-center text-orange-400">
            🌡️ CẢNH BÁO NHIỆT ĐỘ 🌡️
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg">
            <div className="space-y-3 mt-4">
              <p className="text-orange-300 font-semibold">
                Nhiệt độ trong nhà quá cao!
              </p>
              <div className="bg-orange-900/50 rounded-lg p-4 border border-orange-500/50">
                <p className="text-3xl font-bold text-orange-400">
                  {temperature} <span className="text-xl">°C</span>
                </p>
                <p className="text-sm text-orange-300/70 mt-1">
                  Ngưỡng an toàn: {threshold}°C
                </p>
              </div>
              <p className="text-yellow-300 text-sm">
                Vui lòng bật quạt hoặc điều hòa!
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogAction 
            onClick={handleClose}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            Đã hiểu, đóng cảnh báo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
