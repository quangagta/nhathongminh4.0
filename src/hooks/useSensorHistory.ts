import { useState, useEffect, useRef } from 'react';
import { useFirebaseData } from './useFirebaseData';
import { useAlertSettings } from './useAlertSettings';
import { useEmailAlert } from './useEmailAlert';
import { toast } from 'sonner';

export interface SensorHistoryPoint {
  time: string;
  temperature: number;
  gasLevel: number;
  humidity: number;
}

const MAX_HISTORY_POINTS = 20;

export const useSensorHistory = () => {
  const { data, loading, error } = useFirebaseData();
  const { settings } = useAlertSettings();
  const { sendAlertEmail } = useEmailAlert();
  const [history, setHistory] = useState<SensorHistoryPoint[]>([]);
  const lastAlertRef = useRef<{ gas: number; temp: number; humidity: number }>({ gas: 0, temp: 0, humidity: 0 });

  useEffect(() => {
    if (loading || error) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setHistory(prev => {
      const newPoint: SensorHistoryPoint = {
        time: timeStr,
        temperature: data.temperature,
        gasLevel: data.gasLevel,
        humidity: data.humidity,
      };

      const newHistory = [...prev, newPoint];
      if (newHistory.length > MAX_HISTORY_POINTS) {
        return newHistory.slice(-MAX_HISTORY_POINTS);
      }
      return newHistory;
    });

    // Check alerts with cooldown (30 seconds)
    const now_ms = Date.now();
    
    // Gas alert
    if (data.gasLevel > settings.gasThreshold && now_ms - lastAlertRef.current.gas > 30000) {
      toast.error(`⚠️ Cảnh báo khí gas: ${data.gasLevel} ppm vượt ngưỡng ${settings.gasThreshold} ppm!`, {
        duration: 5000,
      });
      lastAlertRef.current.gas = now_ms;
      if (settings.soundEnabled) {
        playAlertSound();
      }
      // Send email alert
      if (settings.emailEnabled && settings.alertEmail) {
        sendAlertEmail(
          settings.alertEmail,
          'gas',
          data.gasLevel,
          settings.gasThreshold,
          { temperature: data.temperature }
        );
      }
    }

    // Temperature alert
    if (data.temperature > settings.tempThreshold && now_ms - lastAlertRef.current.temp > 30000) {
      toast.error(`⚠️ Cảnh báo nhiệt độ: ${data.temperature}°C vượt ngưỡng ${settings.tempThreshold}°C!`, {
        duration: 5000,
      });
      lastAlertRef.current.temp = now_ms;
      if (settings.soundEnabled) {
        playAlertSound();
      }
      // Send email alert
      if (settings.emailEnabled && settings.alertEmail) {
        sendAlertEmail(
          settings.alertEmail,
          'temperature',
          data.temperature,
          settings.tempThreshold,
          { gasLevel: data.gasLevel }
        );
      }
    }

    // Fire risk alert - both gas AND temperature are high
    if (data.gasLevel > settings.gasThreshold && data.temperature > settings.tempThreshold) {
      if (settings.emailEnabled && settings.alertEmail) {
        sendAlertEmail(
          settings.alertEmail,
          'fire',
          data.gasLevel,
          settings.gasThreshold,
          { gasLevel: data.gasLevel, temperature: data.temperature }
        );
      }
    }

    if (data.humidity > 80 && now_ms - lastAlertRef.current.humidity > 30000) {
      toast.warning(`💧 Độ ẩm cao: ${data.humidity}%`, {
        duration: 5000,
      });
      lastAlertRef.current.humidity = now_ms;
    }
  }, [data, loading, error, settings, sendAlertEmail]);

  return { history, currentData: data, loading, error, settings };
};

const playAlertSound = () => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    setTimeout(() => {
      oscillator.stop();
      audioContext.close();
    }, 500);
  } catch (e) {
    console.error('Could not play alert sound:', e);
  }
};
