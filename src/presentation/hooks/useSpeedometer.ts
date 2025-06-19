import { useState, useEffect } from 'react';
import { SpeedInfo } from '../../domain/models/SpeedInfo';

export const useSpeedometer = () => {
  const [speedInfo, setSpeedInfo] = useState<SpeedInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); 

  useEffect(() => {
    setIsLoading(true);
    function handleSpeedUpdate(message: any) {
      if (message.action === 'speedUpdate') {
        setSpeedInfo(message.speedInfo);
        setIsLoading(false);
      }
    }
    chrome.runtime.onMessage.addListener(handleSpeedUpdate);
    return () => {
      chrome.runtime.onMessage.removeListener(handleSpeedUpdate);
    };
  }, []);

  return { speedInfo, isLoadingSpeed: isLoading };
};
