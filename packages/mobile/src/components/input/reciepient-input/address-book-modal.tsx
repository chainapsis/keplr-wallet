import React, {useEffect, useState} from 'react';
import {BaseModalHeader} from '../../modal';
import {IMemoConfig, IRecipientConfig} from '@keplr-wallet/hooks';
import {observer} from 'mobx-react-lite';
import {Box} from '../../box';
import {FormattedMessage, useIntl} from 'react-intl';
import {RecentSendHistory} from '@keplr-wallet/background';
import {AppCurrency, Key} from '@keplr-wallet/types';
import {useStore} from '../../../stores';
import {HorizontalRadioGroup} from '../../radio-group';
import {YAxis} from '../../axis';
import {Stack} from '../../stack';
import {Text} from 'react-native';
import {AddressItem} from '../../address-item';
import {EmptyView, EmptyViewText} from '../../empty-view';
import {registerCardModal} from '../../modal/card';
import {ScrollView} from '../../scroll-view/common-scroll-view';
import {useStyle} from '../../../styles';
import {DenomHelper} from '@keplr-wallet/common';
import {Bech32Address} from '@keplr-wallet/cosmos';

type Type = 'recent' | 'contacts' | 'accounts';

export const AddressBookModal = registerCardModal(
  observer<{
    historyType: string;
    recipientConfig: IRecipientConfig;
    memoConfig: IMemoConfig;
    permitSelfKeyInfo?: boolean;
    setIsOpen: (isOpen: boolean) => void;
    currency: AppCurrency;
  }>(
    ({
      historyType,
      recipientConfig,
      memoConfig,
      permitSelfKeyInfo,
      setIsOpen,
      currency,
    }) => {
      const {uiConfigStore, keyRingStore, chainStore} = useStore();

      const intl = useIntl();
      const style = useStyle();

      const [type, setType] = useState<Type>('recent');
      const [recents, setRecents] = useState<RecentSendHistory[]>([]);
      const [accounts, setAccounts] = useState<
        (Key & {
          vaultId: string;
        })[]
      >([]);

      useEffect(() => {
        uiConfigStore.addressBookConfig
          .getRecentSendHistory(recipientConfig.chainId, historyType)
          .then(res => {
            setRecents(res);
          });
      }, [
        historyType,
        recipientConfig.chainId,
        uiConfigStore.addressBookConfig,
      ]);

      useEffect(() => {
        uiConfigStore.addressBookConfig
          .getVaultCosmosKeysSettled(
            recipientConfig.chainId,
            permitSelfKeyInfo ? undefined : keyRingStore.selectedKeyInfo?.id,
          )
          .then(keys => {
            setAccounts(
              keys
                .filter(res => {
                  return res.status === 'fulfilled';
                })
                .map(res => {
                  if (res.status === 'fulfilled') {
                    return res.value;
                  }
                  throw new Error('Unexpected status');
                }),
            );
          });
      }, [
        keyRingStore.selectedKeyInfo?.id,
        permitSelfKeyInfo,
        recipientConfig.chainId,
        uiConfigStore.addressBookConfig,
      ]);

      const chainInfo = chainStore.getChain(recipientConfig.chainId);
      const isEvmChain = chainInfo.evm !== undefined;
      const isErc20 =
        new DenomHelper(currency.coinMinimalDenom).type === 'erc20';

      const datas: {
        timestamp?: number;
        name?: string;
        address: string;
        memo?: string;

        isSelf?: boolean;
      }[] = (() => {
        switch (type) {
          case 'recent': {
            return recents
              .map(recent => {
                return {
                  timestamp: recent.timestamp,
                  address: recent.recipient,
                  memo: recent.memo,
                };
              })
              .filter(recent => {
                if (isErc20 && !recent.address.startsWith('0x')) {
                  return false;
                }

                return true;
              });
          }
          case 'contacts': {
            return uiConfigStore.addressBookConfig
              .getAddressBook(recipientConfig.chainId)
              .map(addressData => {
                return {
                  name: addressData.name,
                  address: addressData.address,
                  memo: addressData.memo,
                };
              })
              .filter(contact => {
                if (isErc20 && !contact.address.startsWith('0x')) {
                  return false;
                }

                return true;
              });
          }
          case 'accounts': {
            return accounts.reduce<
              {name: string; address: string; isSelf: boolean}[]
            >((acc, account) => {
              const isSelf =
                keyRingStore.selectedKeyInfo?.id === account.vaultId;

              if (!isErc20) {
                acc.push({
                  name: account.name,
                  address: account.bech32Address,
                  isSelf,
                });
              }

              if (isEvmChain) {
                const hexAddress = Bech32Address.fromBech32(
                  account.bech32Address,
                ).toHex(true);
                acc.push({
                  name: account.name,
                  address: hexAddress,
                  isSelf,
                });
              }

              return acc;
            }, []);
          }
          default: {
            return [];
          }
        }
      })();

      return (
        <Box paddingX={12} paddingBottom={12}>
          <BaseModalHeader
            title={intl.formatMessage({
              id: 'components.address-book-modal.title',
            })}
            titleStyle={style.flatten(['padding-bottom-6', 'text-left'])}
            style={style.flatten(['padding-left-8'])}
          />

          <YAxis alignX="left">
            <HorizontalRadioGroup
              selectedKey={type}
              size="large"
              items={[
                {
                  key: 'recent',
                  text: intl.formatMessage({
                    id: 'components.address-book-modal.recent-tab',
                  }),
                },
                {
                  key: 'contacts',
                  text: intl.formatMessage({
                    id: 'components.address-book-modal.contacts-tab',
                  }),
                },
                {
                  key: 'accounts',
                  text: intl.formatMessage({
                    id: 'components.address-book-modal.my-wallets-tab',
                  }),
                },
              ]}
              onSelect={key => {
                setType(key as Type);
              }}
              itemMinWidth={92}
            />
          </YAxis>

          <ScrollView isGestureScrollView={true} style={{height: 450}}>
            {datas.length > 0 ? (
              <Stack gutter={12}>
                {(() => {
                  if (type !== 'accounts' || !permitSelfKeyInfo) {
                    return datas.map((data, i) => {
                      return (
                        <AddressItem
                          key={i}
                          timestamp={data.timestamp}
                          name={data.name}
                          address={data.address}
                          memo={data.memo}
                          isShowMemo={type !== 'accounts'}
                          onClick={() => {
                            recipientConfig.setValue(data.address);
                            memoConfig.setValue(data.memo ?? '');
                            setIsOpen(false);
                          }}
                        />
                      );
                    });
                  }

                  const selfAccount = datas.find(data => data.isSelf);
                  const otherAccounts = datas.filter(data => !data.isSelf);

                  return (
                    <React.Fragment>
                      {selfAccount ? (
                        <React.Fragment>
                          <Text
                            style={{
                              fontSize: 12,
                              color: '#FEFEFE',
                              fontWeight: '600',
                            }}>
                            <FormattedMessage id="components.address-book-modal.current-wallet" />
                          </Text>
                          <AddressItem
                            name={selfAccount.name}
                            address={selfAccount.address}
                            isShowMemo={false}
                            onClick={() => {
                              recipientConfig.setValue(selfAccount.address);
                            }}
                            highlight={true}
                          />
                        </React.Fragment>
                      ) : null}

                      {otherAccounts.length > 0 ? (
                        <React.Fragment>
                          <Text
                            style={{
                              fontSize: 12,
                              color: '#FEFEFE',
                              fontWeight: '600',
                            }}>
                            <FormattedMessage id="components.address-book-modal.other-wallet" />
                          </Text>
                          {otherAccounts.map((data, i) => {
                            return (
                              <AddressItem
                                key={i}
                                name={data.name}
                                address={data.address}
                                isShowMemo={false}
                                onClick={() => {
                                  recipientConfig.setValue(data.address);
                                  setIsOpen(false);
                                }}
                              />
                            );
                          })}
                        </React.Fragment>
                      ) : null}
                    </React.Fragment>
                  );
                })()}
              </Stack>
            ) : (
              <Box alignX="center" alignY="center" height={400}>
                <EmptyView>
                  {(() => {
                    switch (type) {
                      case 'accounts':
                        return (
                          <EmptyViewText
                            text={intl.formatMessage({
                              id: 'components.address-book-modal.empty-view-accounts',
                            })}
                          />
                        );
                      default:
                        return (
                          <EmptyViewText
                            text={intl.formatMessage({
                              id: 'components.address-book-modal.empty-view-default',
                            })}
                          />
                        );
                    }
                  })()}
                </EmptyView>
              </Box>
            )}
          </ScrollView>
        </Box>
      );
    },
  ),
);
