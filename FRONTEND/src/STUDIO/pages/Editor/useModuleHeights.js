import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to store and retrieve real rendered heights of modules
 * Heights are measured when modules are rendered in real mode
 * and used for proportional sizing in icon mode
 */
export const useModuleHeights = () => {
  const [moduleHeights, setModuleHeights] = useState({});

  const recordModuleHeight = useCallback((moduleType, height) => {
    setModuleHeights(prev => ({
      ...prev,
      [moduleType]: height
    }));
  }, []);

  const getModuleHeight = useCallback((moduleType, fallbackHeight = 600) => {
    return moduleHeights[moduleType] || fallbackHeight;
  }, [moduleHeights]);

  return { moduleHeights, recordModuleHeight, getModuleHeight };
};

