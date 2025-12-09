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
    console.log('Firebase database:', database);
    console.log('Connecting to Firebase...');
    
    const tempRef = ref(database, 'nhietdo');
    const gasRef = ref(database, 'khiga');
    const humidityRef = ref(database, 'DAT/GiaTri_Analog');

    let tempLoaded = false;
    let gasLoaded = false;
    let humidityLoaded = false;

    const checkLoading = () => {
      if (tempLoaded && gasLoaded && humidityLoaded) {
        setLoading(false);
      }
    };

    // Lắng nghe nhiệt độ
    const handleTemp = (snapshot: any) => {
      try {
        console.log('Temp snapshot exists:', snapshot.exists());
        console.log('Temp value:', snapshot.val());
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
        console.log('Gas snapshot exists:', snapshot.exists());
        console.log('Gas value:', snapshot.val());
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

    // Lắng nghe độ ẩm
    const handleHumidity = (snapshot: any) => {
      try {
        console.log('Humidity snapshot exists:', snapshot.exists());
        console.log('Humidity value:', snapshot.val());
        if (snapshot.exists()) {
          const value = snapshot.val();
          setData(prev => ({
            ...prev,
            humidity: typeof value === 'number' ? value : parseFloat(value) || 0
          }));
          setError(null);
        }
        humidityLoaded = true;
        checkLoading();
      } catch (err) {
        console.error('Firebase humidity error:', err);
        humidityLoaded = true;
        checkLoading();
      }
    };

    onValue(tempRef, handleTemp, handleError);
    onValue(gasRef, handleGas, handleError);
    onValue(humidityRef, handleHumidity, handleError);

    return () => {
      off(tempRef, 'value', handleTemp);
      off(gasRef, 'value', handleGas);
      off(humidityRef, 'value', handleHumidity);
    };
  }, []);

  return { data, loading, error };
};
