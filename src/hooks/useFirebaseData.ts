import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/config/firebase';

export interface SensorData {
  temperature: number;
  gasLevel: number;
  humidity: number;
  timestamp: string;
}

export const useFirebaseData = () => {
  const [data, setData] = useState<SensorData>({
    temperature: 0,
    gasLevel: 0,
    humidity: 0,
    timestamp: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const tempRef = ref(database, 'nhathongminh/nhietdo');
    const gasRef = ref(database, 'nhathongminh/khiga');

    let tempLoaded = false;
    let gasLoaded = false;

    const checkLoading = () => {
      if (tempLoaded && gasLoaded) {
        setLoading(false);
      }
    };

    // Lắng nghe nhiệt độ
    const handleTemp = (snapshot: any) => {
      try {
        if (snapshot.exists()) {
          const value = snapshot.val();
          setData(prev => ({
            ...prev,
            temperature: typeof value === 'number' ? value : parseFloat(value) || 0
          }));
          setError(null);
        }
        tempLoaded = true;
        checkLoading();
      } catch (err) {
        console.error('Firebase temp error:', err);
        tempLoaded = true;
        checkLoading();
      }
    };

    // Lắng nghe khí gas
    const handleGas = (snapshot: any) => {
      try {
        if (snapshot.exists()) {
          const value = snapshot.val();
          setData(prev => ({
            ...prev,
            gasLevel: typeof value === 'number' ? value : parseFloat(value) || 0
          }));
          setError(null);
        }
        gasLoaded = true;
        checkLoading();
      } catch (err) {
        console.error('Firebase gas error:', err);
        gasLoaded = true;
        checkLoading();
      }
    };

    const handleError = (error: any) => {
      setError('Lỗi kết nối Firebase');
      console.error('Firebase connection error:', error);
      setLoading(false);
    };

    onValue(tempRef, handleTemp, handleError);
    onValue(gasRef, handleGas, handleError);

    return () => {
      off(tempRef, 'value', handleTemp);
      off(gasRef, 'value', handleGas);
    };
  }, []);

  return { data, loading, error };
};
