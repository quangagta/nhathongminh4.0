import { useState, useEffect } from 'react';

export interface AlertSettings {
  gasThreshold: number;
  tempThreshold: number;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: AlertSettings = {
  gasThreshold: 50,
  tempThreshold: 40,
  soundEnabled: true,
};

const STORAGE_KEY = 'smart_home_alert_settings';

export const useAlertSettings = () => {
  const [settings, setSettings] = useState<AlertSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AlertSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return { settings, updateSettings, resetSettings };
};
