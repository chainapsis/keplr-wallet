import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useMemo, useRef, useState} from 'react';
import {Text, TextInput as NativeTextInput} from 'react-native';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {useStore} from '../../stores';
import {CoinPretty, PricePretty} from '@keplr-wallet/unit';
import {useEffectOnce} from '../../hooks';
import {QueryError, WalletStatus} from '@keplr-wallet/stores';
import {Button} from '../../components/button';
import {Gutter} from '../../components/gutter';
import {LayeredHorizontalRadioGroup} from '../../components/radio-group';
import {YAxis} from '../../components/axis';
import {Stack} from '../../components/stack';
import {Columns} from '../../components/column';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Modal} from '../../components/modal';
import {TextButton} from '../../components/text-button';
import {DepositModal} from './components/deposit-modal/deposit-modal';
import {BuyModal} from './buy-modal';
import {StackActions, useNavigation} from '@react-navigation/native';
import {SearchTextInput} from '../../components/input/search-text-input';
import {AvailableTabView} from './available';
import {ChainInfo} from '@keplr-wallet/types';

export interface ViewToken {
  token: CoinPretty;
  chainInfo: ChainInfo;
  isFetching: boolean;
  error: QueryError<any> | undefined;
}

type TabStatus = 'available' | 'staked';

export const useIsNotReady = () => {
  const {chainStore, queriesStore} = useStore();
  const query = queriesStore.get(chainStore.chainInfos[0].chainId).cosmos
    .queryRPCStatus;
  return query.response == null && query.error == null;
};

export const HomeScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const searchRef = useRef<NativeTextInput | null>(null);
  const [search, setSearch] = useState('');

  const isNotReady = useIsNotReady();

  const {
    hugeQueriesStore,
    chainStore,
    accountStore,
    keyRingStore,
    queriesStore,
  } = useStore();

  const navigation = useNavigation();

  const [tabStatus, setTabStatus] = React.useState<TabStatus>('available');
  const buyModalRef = useRef<BottomSheetModal>(null);
  const copyAddressModalRef = useRef<BottomSheetModal>(null);

  // TODO 임시로직 나중에 제거 해야함
  useEffectOnce(() => {
    (async () => {
      await chainStore.waitUntilInitialized();
      const keyInfo = keyRingStore.keyInfos[0];
      const {id: vaultId} = keyInfo;
      let promises: Promise<unknown>[] = [];

      for (const chainInfo of chainStore.chainInfos) {
        // If mnemonic is fresh, there is no way that additional coin type account has value to select.
        promises.push(
          (async () => {
            if (keyRingStore.needKeyCoinTypeFinalize(vaultId, chainInfo)) {
              await keyRingStore.finalizeKeyCoinType(
                vaultId,
                chainInfo.chainId,
                chainInfo.bip44.coinType,
              );
            }
          })(),
        );
      }

      await Promise.allSettled(promises);
      const candidateAddresses: {
        chainId: string;
        bech32Addresses: {
          coinType: number;
          address: string;
        }[];
      }[] = [];
      promises = [];

      for (const chainInfo of chainStore.chainInfos) {
        const account = accountStore.getAccount(chainInfo.chainId);
        promises.push(
          (async () => {
            if (account.walletStatus !== WalletStatus.Loaded) {
              await account.init();
            }

            if (account.bech32Address) {
              candidateAddresses.push({
                chainId: chainInfo.chainId,
                bech32Addresses: [
                  {
                    coinType: chainInfo.bip44.coinType,
                    address: account.bech32Address,
                  },
                ],
              });
            }
          })(),
        );
      }

      await Promise.allSettled(promises);

      promises = [];

      for (const candidateAddress of candidateAddresses) {
        const queries = queriesStore.get(candidateAddress.chainId);
        for (const bech32Address of candidateAddress.bech32Addresses) {
          // Prepare queries state to avoid UI flicker on next scene.
          promises.push(
            queries.cosmos.queryAccount
              .getQueryBech32Address(bech32Address.address)
              .waitFreshResponse(),
          );
          promises.push(
            queries.queryBalances
              .getQueryBech32Address(bech32Address.address)
              .stakable.waitFreshResponse(),
          );
          promises.push(
            queries.cosmos.queryDelegations
              .getQueryBech32Address(bech32Address.address)
              .waitFreshResponse(),
          );
        }
      }

      await Promise.allSettled(promises);

      //NOTE - 전체 체인 enable 하는 과정
      const enabledChainIdentifiers: string[] =
        chainStore.enabledChainIdentifiers;

      for (const candidateAddress of candidateAddresses) {
        const queries = queriesStore.get(candidateAddress.chainId);
        const chainInfo = chainStore.getChain(candidateAddress.chainId);

        // If the chain is already enabled, skip.
        if (chainStore.isEnabledChain(candidateAddress.chainId)) {
          continue;
        }

        // If the chain is not enabled, check that the account exists.
        // If the account exists, turn on the chain.
        for (const bech32Address of candidateAddress.bech32Addresses) {
          // Check that the account has some assets or delegations.
          // If so, enable it by default
          const queryBalance = queries.queryBalances.getQueryBech32Address(
            bech32Address.address,
          ).stakable;

          if (queryBalance.response?.data) {
            // A bit tricky. The stake coin is currently only native, and in this case,
            // we can check whether the asset exists or not by checking the response.
            const data = queryBalance.response.data as any;
            if (
              data.balances &&
              Array.isArray(data.balances) &&
              data.balances.length > 0
            ) {
              enabledChainIdentifiers.push(chainInfo.chainIdentifier);
              break;
            }
          }

          const queryDelegations =
            queries.cosmos.queryDelegations.getQueryBech32Address(
              bech32Address.address,
            );
          if (queryDelegations.delegationBalances.length > 0) {
            enabledChainIdentifiers.push(chainInfo.chainIdentifier);
            break;
          }
        }
      }

      await Promise.all([
        (async () => {
          if (enabledChainIdentifiers.length > 0) {
            // await chainStore.enableChainInfoInUIWithVaultId(
            //   vaultId,
            //   ...enabledChainIdentifiers,
            // );
          }
        })(),
      ]);
    })();
  });

  const availableTotalPrice = useMemo(() => {
    let result: PricePretty | undefined;
    for (const bal of hugeQueriesStore.allKnownBalances) {
      if (bal.price) {
        if (!result) {
          result = bal.price;
        } else {
          result = result.add(bal.price);
        }
      }
    }
    return result;
  }, [hugeQueriesStore.allKnownBalances]);

  return (
    <React.Fragment>
      <PageWithScrollView backgroundMode={'default'}>
        <Stack gutter={10}>
          <YAxis alignX="center">
            <LayeredHorizontalRadioGroup
              selectedKey={tabStatus}
              items={[
                {
                  key: 'available',
                  text: 'available',
                },
                {
                  key: 'staked',
                  text: 'staked',
                },
              ]}
              onSelect={key => {
                setTabStatus(key as TabStatus);
              }}
              itemMinWidth={92}
            />
          </YAxis>
          <TextButton
            text="copy address"
            onPress={() => {
              copyAddressModalRef.current?.present();
            }}
          />
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            {availableTotalPrice?.toString()}
          </Text>
          <Columns sum={1} gutter={10}>
            <Button
              text="Deposit"
              size="large"
              color="secondary"
              containerStyle={style.flatten(['flex-1'])}
            />
            <Button
              text="Buy"
              size="large"
              color="secondary"
              containerStyle={style.flatten(['flex-1'])}
              onPress={() => {
                buyModalRef.current?.present();
              }}
            />
            <Button
              text="Send"
              size="large"
              containerStyle={style.flatten(['flex-1'])}
              onPress={() => {
                navigation.dispatch({
                  ...StackActions.push('Send'),
                });
              }}
            />
          </Columns>
          <Gutter size={12} />
          {!isNotReady ? (
            <Stack gutter={12}>
              {tabStatus === 'available' ? (
                <SearchTextInput
                  ref={searchRef}
                  value={search}
                  onChange={e => {
                    e.preventDefault();
                    setSearch(e.nativeEvent.text);
                  }}
                  placeholder="Search for asset or chain (i.e. ATOM, Cosmos)"
                />
              ) : null}
            </Stack>
          ) : null}

          {tabStatus === 'available' ? (
            <AvailableTabView
              search={search}
              isNotReady={isNotReady}
              onClickGetStarted={() => {
                copyAddressModalRef.current?.present();
              }}
            />
          ) : null}
        </Stack>
      </PageWithScrollView>

      <Modal ref={copyAddressModalRef} snapPoints={['60%']}>
        <DepositModal />
      </Modal>
      <Modal ref={buyModalRef} snapPoints={['32%']}>
        <BuyModal />
      </Modal>
    </React.Fragment>
  );
});
