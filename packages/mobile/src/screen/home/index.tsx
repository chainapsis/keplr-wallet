import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useMemo} from 'react';
import {Text, View} from 'react-native';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {useStore} from '../../stores';
import {PricePretty} from '@keplr-wallet/unit';
import {useEffectOnce} from '../../hooks';
import {WalletStatus} from '@keplr-wallet/stores';

export const HomeScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const {
    hugeQueriesStore,
    chainStore,
    accountStore,
    keyRingStore,
    queriesStore,
  } = useStore();

  //TODO 임시로직 나중에 제거 해야함
  useEffectOnce(() => {
    (async () => {
      await chainStore.waitUntilInitialized();
      const keyInfo = keyRingStore.keyInfos[0];
      const {id: vaultId} = keyInfo;
      let promises: Promise<unknown>[] = [];

      for (const chainInfo of chainStore.chainInfos) {
        // If mnemonic is fresh, there is no way that additional coin type account has value to select.
        console.log(chainInfo.chainId);
        promises.push(
          (async () => {
            await keyRingStore.finalizeMnemonicKeyCoinType(
              vaultId,
              chainInfo.chainId,
              chainInfo.bip44.coinType,
            );
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

      console.log(candidateAddresses);

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
            await chainStore.enableChainInfoInUIWithVaultId(
              vaultId,
              ...enabledChainIdentifiers,
            );
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

  console.log(availableTotalPrice?.toString());

  return (
    <React.Fragment>
      <PageWithScrollView backgroundMode={'default'}>
        <View>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>

          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-red-100',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-red-100',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-red-100',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
        </View>
      </PageWithScrollView>
    </React.Fragment>
  );
});
