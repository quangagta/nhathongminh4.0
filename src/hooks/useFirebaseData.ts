import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { database } from '@/config/firebase';

export interface SensorData {
  temperature: number;
  gasLevel: number;
  humidity: number;
  timestamp: string;
}

export const useFirebaseData = (path: string = 'sensorData') => {
  const [data, setData] = useState<SensorData>({
    temperature: 0,
    gasLevel: 0,
    humidity: 0,
    timestamp: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dataRef = ref(database, path);

    const handleData = (snapshot: any) => {
      try {
        if (snapshot.exists()) {
          const value = snapshot.val();
          setData({
            temperature: value.temperature || 0,
            gasLevel: value.gasLevel || 0,
            humidity: value.humidity || 0,
            timestamp: value.timestamp || ''
          });
          setError(null);
        } else {
          setError('Không có dữ liệu');
        }
      } catch (err) {
        setError('Lỗi khi đọc dữ liệu');
        console.error('Firebase error:', err);
      } finally {
        setLoading(false);
      }
    };

    const handleError = (error: any) => {
      setError('Lỗi kết nối Firebase');
      console.error('Firebase connection error:', error);
      setLoading(false);
    };

    // Lắng nghe thay đổi dữ liệu thời gian thực
    onValue(dataRef, handleData, handleError);

    // Cleanup khi component unmount
    return () => {
      off(dataRef, 'value', handleData);
    };
  }, [path]);

  return { data, loading, error };
};
