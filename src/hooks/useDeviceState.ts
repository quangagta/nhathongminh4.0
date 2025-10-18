import { useState, useEffect } from "react";

export const useDeviceState = (deviceKey: string, defaultValue: boolean = false) => {
  const [state, setState] = useState<boolean>(() => {
    const saved = localStorage.getItem(deviceKey);
    return saved ? JSON.parse(saved) : defaultValue;
  });

  useEffect(() => {
    localStorage.setItem(deviceKey, JSON.stringify(state));
  }, [deviceKey, state]);

  return [state, setState] as const;
};
