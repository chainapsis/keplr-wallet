import React, {FunctionComponent, useLayoutEffect, useState} from 'react';
import {PlainObject} from '@keplr-wallet/background';
import {KeplrError} from '@keplr-wallet/router';

import {useIntl} from 'react-intl';
import {
  ErrCodeDeviceLocked,
  ErrFailedGetPublicKey,
  ErrFailedInit,
  ErrModuleLedgerSign,
  ErrPublicKeyUnmatched,
  ErrSignRejected,
} from '../../screen/sign/util/ledger-types';
import {GuideBox} from './guide-box';
import {VerticalCollapseTransition} from '../transition';

export const LedgerGuideBox: FunctionComponent<{
  data: {
    keyInsensitive: PlainObject;
    isEthereum: boolean;
  };
  isLedgerInteracting: boolean;
  ledgerInteractingError: Error | undefined;
}> = ({isLedgerInteracting, ledgerInteractingError, data}) => {
  const intl = useIntl();
  const [transportErrorCount, setTransportErrorCount] = useState(0);

  useLayoutEffect(() => {
    if (ledgerInteractingError) {
      if (
        ledgerInteractingError instanceof KeplrError &&
        ledgerInteractingError.module === ErrModuleLedgerSign
      ) {
        switch (ledgerInteractingError.code) {
          case ErrFailedInit:
            setTransportErrorCount(c => c + 1);
            break;
          default:
            setTransportErrorCount(0);
        }
      }
    }
  }, [ledgerInteractingError]);

  return (
    <VerticalCollapseTransition
      collapsed={!isLedgerInteracting && ledgerInteractingError == null}
      transitionAlign="bottom">
      {(() => {
        if (ledgerInteractingError) {
          if (
            ledgerInteractingError instanceof KeplrError &&
            ledgerInteractingError.module === ErrModuleLedgerSign
          ) {
            switch (ledgerInteractingError.code) {
              case ErrFailedInit:
                if (transportErrorCount < 3) {
                  return (
                    <GuideBox
                      color="warning"
                      title={intl.formatMessage({
                        id: 'page.sign.components.ledger-guide.box.error-title',
                      })}
                      paragraph={intl.formatMessage({
                        id: 'page.sign.components.ledger-guide.box.connect-and-unlock-ledger-paragraph',
                      })}
                    />
                  );
                }

                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: 'page.sign.components.ledger-guide.box.error-title',
                    })}
                    paragraph={intl.formatMessage({
                      id: 'page.sign.components.ledger-guide.box.usb-permission-unknown-paragraph-1',
                    })}
                  />
                );
              case ErrCodeDeviceLocked:
                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: 'page.sign.components.ledger-guide.box.error-title',
                    })}
                    paragraph={intl.formatMessage({
                      id: 'page.sign.components.ledger-guide.box.unlock-ledger-paragraph',
                    })}
                  />
                );
              case ErrFailedGetPublicKey: {
                let app = 'Cosmos';

                const appData = data.keyInsensitive;
                if (!appData) {
                  throw new Error('Invalid ledger app data');
                }
                if (typeof appData !== 'object') {
                  throw new Error('Invalid ledger app data');
                }
                if (appData['Terra']) {
                  app = 'Terra';
                }
                if (appData['Secret']) {
                  app = 'Secret';
                }

                if (data.isEthereum) {
                  if (appData['Ethereum']) {
                    app = 'Ethereum';
                  } else {
                    return (
                      <GuideBox
                        color="warning"
                        title={intl.formatMessage({
                          id: 'page.sign.components.ledger-guide.box.error-title',
                        })}
                        paragraph={intl.formatMessage({
                          id: 'page.sign.components.ledger-guide.box.initialize-ethereum-app-first-paragraph',
                        })}
                      />
                    );
                  }
                }

                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: 'page.sign.components.ledger-guide.box.error-title',
                    })}
                    paragraph={intl.formatMessage(
                      {
                        id: 'page.sign.components.ledger-guide.box.open-app-on-ledger-paragraph',
                      },
                      {app},
                    )}
                  />
                );
              }

              case ErrPublicKeyUnmatched:
                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: 'page.sign.components.ledger-guide.box.error-title',
                    })}
                    paragraph={intl.formatMessage({
                      id: 'page.sign.components.ledger-guide.box.try-again-with-same-ledger-paragraph',
                    })}
                  />
                );
              case ErrSignRejected:
                return (
                  <GuideBox
                    color="warning"
                    title={intl.formatMessage({
                      id: 'page.sign.components.ledger-guide.box.error-title',
                    })}
                    paragraph={intl.formatMessage({
                      id: 'page.sign.components.ledger-guide.box.rejected-signing-on-ledger-paragraph',
                    })}
                  />
                );
            }
          }

          return (
            <GuideBox
              color="warning"
              title={intl.formatMessage({
                id: 'page.sign.components.ledger-guide.box.unknown-error-title',
              })}
              paragraph={
                ledgerInteractingError.message ||
                ledgerInteractingError.toString()
              }
            />
          );
        }

        return (
          <GuideBox
            color="default"
            title={intl.formatMessage({
              id: 'page.sign.components.ledger-guide.box.sign-on-ledger-title',
            })}
            paragraph={intl.formatMessage({
              id: 'page.sign.components.ledger-guide.box.sign-on-ledger-paragraph',
            })}
          />
        );
      })()}
    </VerticalCollapseTransition>
  );
};
