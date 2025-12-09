import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useFirebaseData } from './useFirebaseData';

const SAVE_INTERVAL = 5 * 60 * 1000; // Save every 5 minutes

export const useTemperatureHistory = () => {
  const { data, loading } = useFirebaseData();
  const lastSaveRef = useRef<number>(0);
  const isSavingRef = useRef<boolean>(false);

  useEffect(() => {
    if (loading || isSavingRef.current) return;

    const now = Date.now();
    if (now - lastSaveRef.current < SAVE_INTERVAL) return;

    const saveTemperature = async () => {
      if (isSavingRef.current) return;
      isSavingRef.current = true;

      try {
        const { error } = await supabase
          .from('temperature_history')
          .insert({
            temperature: data.temperature,
            humidity: data.humidity,
            gas_level: data.gasLevel,
          });

        if (error) {
          console.error('Error saving temperature:', error);
        } else {
          lastSaveRef.current = now;
          console.log('Temperature saved:', data.temperature);
        }
      } catch (e) {
        console.error('Error saving temperature:', e);
      } finally {
        isSavingRef.current = false;
      }
    };

    saveTemperature();
  }, [data, loading]);

  return { data, loading };
};

export const useTemperatureHistoryData = () => {
  const fetchHistory = async (days: number = 7) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('temperature_history')
      .select('*')
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true });

    if (error) {
      console.error('Error fetching temperature history:', error);
      return [];
    }

    return data || [];
  };

  const getStats = async (days: number = 7) => {
    const history = await fetchHistory(days);
    
    if (history.length === 0) {
      return null;
    }

    const temps = history.map(h => Number(h.temperature));
    const humidities = history.filter(h => h.humidity).map(h => Number(h.humidity));
    const gasLevels = history.filter(h => h.gas_level).map(h => Number(h.gas_level));

    return {
      temperature: {
        min: Math.min(...temps),
        max: Math.max(...temps),
        avg: temps.reduce((a, b) => a + b, 0) / temps.length,
      },
      humidity: humidities.length > 0 ? {
        min: Math.min(...humidities),
        max: Math.max(...humidities),
        avg: humidities.reduce((a, b) => a + b, 0) / humidities.length,
      } : null,
      gasLevel: gasLevels.length > 0 ? {
        min: Math.min(...gasLevels),
        max: Math.max(...gasLevels),
        avg: gasLevels.reduce((a, b) => a + b, 0) / gasLevels.length,
      } : null,
      totalRecords: history.length,
      history,
    };
  };

  return { fetchHistory, getStats };
};
