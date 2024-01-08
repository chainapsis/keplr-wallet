import React, {
  FunctionComponent,
  PropsWithChildren,
  useRef,
  useState,
} from 'react';
import {LedgerBLEContext} from './context';
import Transport from '@ledgerhq/hw-transport';
import {LedgerBLETransportModal} from './modal';
import TransportBLE from '@ledgerhq/react-native-hw-transport-ble';

export const LedgerBLEProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const [transportRequest, setTransportRequest] = useState<{
    promise: Promise<Transport>;
    resolve: (transport: Transport) => void;
    reject: (error: Error) => void;
  } | null>(null);
  const notRenderedTransportRequest = useRef<{
    promise: Promise<Transport>;
  } | null>(null);

  const lastUsedDeviceId = useRef<string | null>(null);

  const createAndSetModalResolver = () => {
    let _resolve: (transport: Transport) => void;
    let _reject: (error: Error) => void;
    let once = false;
    const p = new Promise<Transport>((resolve, reject) => {
      _resolve = t => {
        if (!once) {
          once = true;
          if (t instanceof TransportBLE) {
            lastUsedDeviceId.current = t.id;
          } else {
            lastUsedDeviceId.current = null;
          }
        }

        resolve(t);
      };
      _reject = e => {
        if (!once) {
          once = true;
          lastUsedDeviceId.current = null;
        }
        reject(e);
      };
    });

    setTransportRequest({
      promise: p,
      resolve: _resolve!,
      reject: _reject!,
    });

    return p;
  };

  return (
    <LedgerBLEContext.Provider
      value={{
        getTransport: () => {
          if (transportRequest) {
            return transportRequest.promise;
          }

          if (notRenderedTransportRequest.current) {
            return notRenderedTransportRequest.current.promise;
          }

          if (lastUsedDeviceId.current) {
            const p = new Promise<Transport>((resolve, reject) => {
              TransportBLE.open(lastUsedDeviceId.current)
                .then(transportBLE => {
                  resolve(transportBLE);
                })
                .catch(e => {
                  console.log(e);
                  lastUsedDeviceId.current = null;
                  createAndSetModalResolver()
                    .then(transport => {
                      resolve(transport);
                    })
                    .catch(e => {
                      reject(e);
                    });
                })
                .finally(() => {
                  notRenderedTransportRequest.current = null;
                });
            });

            notRenderedTransportRequest.current = {
              promise: p,
            };

            return p;
          }

          return createAndSetModalResolver();
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
