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
import { AlertTriangle } from "lucide-react";

interface GasAlertDialogProps {
  gasLevel: number;
  threshold?: number;
}

export const GasAlertDialog = ({ gasLevel, threshold = 50 }: GasAlertDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasAlerted, setHasAlerted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Tạo âm thanh cảnh báo bằng Web Audio API
  const playAlertSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      
      oscillator.start(ctx.currentTime);
      
      // Beep pattern: on-off-on-off-on
      const beepDuration = 0.2;
      const pauseDuration = 0.1;
      
      for (let i = 0; i < 5; i++) {
        const startTime = ctx.currentTime + i * (beepDuration + pauseDuration);
        gainNode.gain.setValueAtTime(0.3, startTime);
        gainNode.gain.setValueAtTime(0, startTime + beepDuration);
      }
      
      oscillator.stop(ctx.currentTime + 5 * (beepDuration + pauseDuration));
    } catch (error) {
      console.error('Error playing alert sound:', error);
    }
  };

  useEffect(() => {
    const isAboveThreshold = gasLevel > threshold;
    
    if (isAboveThreshold && !hasAlerted) {
      setIsOpen(true);
      setHasAlerted(true);
      playAlertSound();
    } else if (!isAboveThreshold && hasAlerted) {
      // Reset alert khi gas về mức an toàn
      setHasAlerted(false);
    }
  }, [gasLevel, threshold, hasAlerted]);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="border-red-500 bg-red-950/90 max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 animate-ping bg-red-500 rounded-full opacity-50" />
              <AlertTriangle className="h-16 w-16 text-red-500 relative z-10 animate-pulse" />
            </div>
          </div>
          <AlertDialogTitle className="text-2xl text-center text-red-400">
            ⚠️ CẢNH BÁO KHÍ GAS ⚠️
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg">
            <div className="space-y-3 mt-4">
              <p className="text-red-300 font-semibold">
                Phát hiện nồng độ khí gas cao!
              </p>
              <div className="bg-red-900/50 rounded-lg p-4 border border-red-500/50">
                <p className="text-3xl font-bold text-red-400">
                  {gasLevel} <span className="text-xl">ppm</span>
                </p>
                <p className="text-sm text-red-300/70 mt-1">
                  Ngưỡng an toàn: {threshold} ppm
                </p>
              </div>
              <p className="text-yellow-300 text-sm">
                Vui lòng kiểm tra và thông gió ngay lập tức!
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogAction 
            onClick={handleClose}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Đã hiểu, đóng cảnh báo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
