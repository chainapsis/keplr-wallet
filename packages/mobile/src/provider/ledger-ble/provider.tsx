import React, {FunctionComponent, PropsWithChildren, useState} from 'react';
import {LedgerBLEContext} from './context';
import Transport from '@ledgerhq/hw-transport';
import {LedgerBLETransportModal} from './modal';

export const LedgerBLEProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [transportRequest, setTransportRequest] = useState<{
    promise: Promise<Transport>;
    resolve: (transport: Transport) => void;
    reject: (error: Error) => void;
  } | null>(null);

  return (
    <LedgerBLEContext.Provider
      value={{
        getTransport: () => {
          if (transportRequest) {
            return transportRequest.promise;
          }

          let _resolve: (transport: Transport) => void;
          let _reject: (error: Error) => void;
          const p = new Promise<Transport>((resolve, reject) => {
            _resolve = resolve;
            _reject = reject;
          });

          setTransportRequest({
            promise: p,
            resolve: _resolve!,
            reject: _reject!,
          });

          return p;
        },
      }}>
      {children}
      <LedgerBLETransportModal
        isOpen={transportRequest != null}
        resolver={transportRequest?.resolve}
        rejecter={transportRequest?.reject}
        setIsOpen={isOpen => {
          if (!isOpen) {
            transportRequest?.reject(new Error('User canceled'));
            setTransportRequest(null);
          }
        }}
      />
    </LedgerBLEContext.Provider>
  );
};
