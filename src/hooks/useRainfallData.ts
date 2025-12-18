import { useState, useEffect, useRef } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/config/firebase';
import { supabase } from '@/integrations/supabase/client';

export interface RainfallData {
  isRaining: boolean;
  rainIntensity: number; // 0-100%
  timestamp: string;
}

const SAVE_INTERVAL = 10 * 60 * 1000; // Save every 10 minutes

export const useRainfallData = () => {
  const [data, setData] = useState<RainfallData>({
    isRaining: false,
    rainIntensity: 0,
    timestamp: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastSaveRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);

  useEffect(() => {
    console.log('Connecting to Firebase for rain sensor...');
    
    // Path for rain sensor - giá trị 0 hoặc 1
    const rainRef = ref(database, 'mua');

    const handleRain = (snapshot: any) => {
      try {
        console.log('Rain snapshot exists:', snapshot.exists());
        console.log('Rain value:', snapshot.val());
        if (snapshot.exists()) {
          const rawValue = snapshot.val();
          // Giá trị 1 = có mưa, 0 = không mưa
          const isRaining = rawValue === 1 || rawValue === true;
          const rainIntensity = isRaining ? 100 : 0;
          
          console.log('Is raining:', isRaining);
          
          setData({
            isRaining,
            rainIntensity,
            timestamp: new Date().toLocaleTimeString('vi-VN')
          });
          setError(null);
        }
        setLoading(false);
      } catch (err) {
        console.error('Firebase rain error:', err);
        setLoading(false);
      }
    };

    const handleError = (error: any) => {
      setError('Lỗi kết nối cảm biến mưa');
      console.error('Firebase rain connection error:', error);
      setLoading(false);
    };

    onValue(rainRef, handleRain, handleError);

    return () => {
      off(rainRef, 'value', handleRain);
    };
  }, []);

  // Save rainfall data to database periodically
  useEffect(() => {
    if (loading || isSavingRef.current) return;

    const now = Date.now();
    if (now - lastSaveRef.current < SAVE_INTERVAL) return;

    const saveRainfall = async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        const { error } = await supabase
          .from('rainfall_history')
          .insert({
            is_raining: data.isRaining,
            rain_intensity: data.rainIntensity,
          });

        if (error) {
          console.error('Error saving rainfall:', error);
        } else {
          lastSaveRef.current = now;
          console.log('Rainfall saved:', data.isRaining, data.rainIntensity);
        }
      } catch (e) {
        console.error('Error saving rainfall:', e);
      } finally {
        isSavingRef.current = false;
      }
    };

    saveRainfall();
  }, [data, loading]);

  return { data, loading, error };
};

export const useRainfallHistory = () => {
  const fetchHistory = async (days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('rainfall_history')
      .select('*')
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) {
      console.error('Error fetching rainfall history:', error);
      return [];
    }

    return data || [];
  };

  const getStats = async (days: number = 30) => {
    const history = await fetchHistory(days);
    
    if (history.length === 0) {
      return null;
    }

    const rainyDays = new Set(
      history
        .filter(h => h.is_raining)
        .map(h => new Date(h.recorded_at).toDateString())
    ).size;

    const totalDays = new Set(
      history.map(h => new Date(h.recorded_at).toDateString())
    ).size;

    const avgIntensity = history.length > 0
      ? history.reduce((sum, h) => sum + (h.rain_intensity || 0), 0) / history.length
      : 0;

    return {
      rainyDays,
      totalDays,
      rainyDaysPercentage: totalDays > 0 ? (rainyDays / totalDays) * 100 : 0,
      avgIntensity,
      totalRecords: history.length,
      history,
    };
  };

  return { fetchHistory, getStats };
};
