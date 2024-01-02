import React from 'react';
import {AppUpdate} from './types';

export const AppUpdateContext = React.createContext<AppUpdate | null>(null);

export const AppUpdateProvider = AppUpdateContext.Provider;
export const useAppUpdate = () => {
  const appUpdate = React.useContext(AppUpdateContext);
  if (!appUpdate) {
    throw new Error('useAppUpdate must be used within a AppUpdateProvider');
  }
  return appUpdate;
};
