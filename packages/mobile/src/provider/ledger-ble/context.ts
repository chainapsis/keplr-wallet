import React from 'react';
import Transport from '@ledgerhq/hw-transport';

export interface LedgerBLE {
  getTransport: () => Promise<Transport>;
}

export const LedgerBLEContext = React.createContext<LedgerBLE | null>(null);

export const useLedgerBLE = () => {
  const context = React.useContext(LedgerBLEContext);
  if (!context) {
    throw new Error('useLedgerBLE must be used within a LedgerBLEProvider');
  }
  return context;
};
