import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {KeyInfo} from '@keplr-wallet/background';
import {useStore} from '../../../stores';
import {Box} from '../../../components/box';
import {XAxis, YAxis} from '../../../components/axis';
import {useStyle} from '../../../styles';
import {Gutter} from '../../../components/gutter';
import {Stack} from '../../../components/stack';
import {Column, Columns} from '../../../components/column';
import {CheckIcon} from '../../../components/icon';
import {Button} from '../../../components/button';
// import {useIntl} from 'react-intl';
import {App, AppCoinType} from '@keplr-wallet/ledger-cosmos';
import {PageWithScrollView} from '../../../components/page';
import {StyleSheet, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';

export const WalletSelectScreen: FunctionComponent = observer(() => {
  const {keyRingStore} = useStore();
  // const intl = useIntl();

  const mnemonicKeys = useMemo(() => {
    return keyRingStore.keyInfos.filter(keyInfo => {
      return keyInfo.type === 'mnemonic';
    });
  }, [keyRingStore.keyInfos]);

  const socialPrivateKeyInfos = useMemo(() => {
    return keyRingStore.keyInfos.filter(keyInfo => {
      if (
        keyInfo.type === 'private-key' &&
        typeof keyInfo.insensitive === 'object' &&
        keyInfo.insensitive['keyRingMeta'] &&
        typeof keyInfo.insensitive['keyRingMeta'] === 'object' &&
        keyInfo.insensitive['keyRingMeta']['web3Auth'] &&
        typeof keyInfo.insensitive['keyRingMeta']['web3Auth'] === 'object'
      ) {
        const web3Auth = keyInfo.insensitive['keyRingMeta']['web3Auth'];
        if (web3Auth['type'] && web3Auth['email']) {
          return true;
        }
      }

      return false;
    });
  }, [keyRingStore.keyInfos]);

  const privateKeyInfos = useMemo(() => {
    return keyRingStore.keyInfos.filter(keyInfo => {
      return (
        keyInfo.type === 'private-key' &&
        !socialPrivateKeyInfos.some(k => k.id === keyInfo.id)
      );
    });
  }, [keyRingStore.keyInfos, socialPrivateKeyInfos]);

  const ledgerKeys = useMemo(() => {
    return keyRingStore.keyInfos.filter(keyInfo => {
      return keyInfo.type === 'ledger';
    });
  }, [keyRingStore.keyInfos]);

  const keystoneKeys = useMemo(() => {
    return keyRingStore.keyInfos.filter(keyInfo => {
      return keyInfo.type === 'keystone';
    });
  }, [keyRingStore.keyInfos]);

  const unknownKeys = useMemo(() => {
    const knownKeys = mnemonicKeys
      .concat(ledgerKeys)
      .concat(privateKeyInfos)
      .concat(socialPrivateKeyInfos)
      .concat(keystoneKeys);
    return keyRingStore.keyInfos.filter(keyInfo => {
      return !knownKeys.find(k => k.id === keyInfo.id);
    });
  }, [
    keyRingStore.keyInfos,
    ledgerKeys,
    mnemonicKeys,
    privateKeyInfos,
    socialPrivateKeyInfos,
    keystoneKeys,
  ]);

  const socialPrivateKeyInfoByType: {
    type: string;
    keyInfos: KeyInfo[];
  }[] = useMemo(() => {
    const typeMap = new Map<string, KeyInfo[]>();

    socialPrivateKeyInfos.forEach(keyInfo => {
      if (
        keyInfo.type === 'private-key' &&
        typeof keyInfo.insensitive === 'object' &&
        keyInfo.insensitive['keyRingMeta'] &&
        typeof keyInfo.insensitive['keyRingMeta'] === 'object' &&
        keyInfo.insensitive['keyRingMeta']['web3Auth'] &&
        typeof keyInfo.insensitive['keyRingMeta']['web3Auth'] === 'object'
      ) {
        const web3Auth = keyInfo.insensitive['keyRingMeta']['web3Auth'];
        if (
          web3Auth['type'] &&
          web3Auth['email'] &&
          typeof web3Auth['type'] === 'string' &&
          typeof web3Auth['email'] === 'string'
        ) {
          const type = web3Auth['type'];

          const arr = typeMap.get(type) || [];
          arr.push(keyInfo);

          typeMap.set(type, arr);
        }
      }
    });

    const res: {
      type: string;
      keyInfos: KeyInfo[];
    }[] = [];

    for (const [type, keyInfos] of typeMap.entries()) {
      res.push({
        type,
        keyInfos,
      });
    }

    return res;
  }, [socialPrivateKeyInfos]);

  return (
    <PageWithScrollView backgroundMode={'default'}>
      <Box padding={12}>
        <Box position="absolute" style={{top: 74, right: 12}}>
          <Button
            // text={intl.formatMessage({id: 'page.wallet.add-wallet-button'})}
            text={'Add Wallet'}
            size="extra-small"
            color="secondary"
            onPress={async () => {
              await browser.tabs.create({
                url: '/register.html',
              });
            }}
          />
        </Box>
        <Stack gutter={20}>
          {mnemonicKeys.length > 0 ? (
            <KeyInfoList
              // title={intl.formatMessage({
              //   id: 'page.wallet.recovery-phrase-title',
              // })}
              title={'Recovery Phrase'}
              keyInfos={mnemonicKeys}
            />
          ) : null}

          {socialPrivateKeyInfoByType.map(info => {
            return (
              <KeyInfoList
                key={info.type}
                // title={intl.formatMessage(
                //   {id: 'page.wallet.connect-with-social-account-title'},
                title={`Connected with ${
                  info.type.length > 0
                    ? info.type[0].toUpperCase() + info.type.slice(1)
                    : info.type
                } Account`}
                keyInfos={info.keyInfos}
              />
            );
          })}

          {privateKeyInfos.length > 0 ? (
            <KeyInfoList
              title={'Private key'}
              // title={intl.formatMessage({
              //   id: 'page.wallet.private-key-title',
              // })}
              keyInfos={privateKeyInfos}
            />
          ) : null}

          {ledgerKeys.length > 0 ? (
            <KeyInfoList
              // title={intl.formatMessage({id: 'page.wallet.ledger-title'})}
              title={'Ledger'}
              keyInfos={ledgerKeys}
            />
          ) : null}

          {keystoneKeys.length > 0 ? (
            <KeyInfoList title="Keystone" keyInfos={keystoneKeys} />
          ) : null}

          {unknownKeys.length > 0 ? (
            <KeyInfoList
              // title={intl.formatMessage({id: 'page.wallet.unknown-title'})}
              title={'Unknown'}
              keyInfos={unknownKeys}
            />
          ) : null}
        </Stack>
      </Box>
    </PageWithScrollView>
  );
});

const KeyInfoList: FunctionComponent<{
  title: string;
  keyInfos: KeyInfo[];
}> = observer(({title, keyInfos}) => {
  const style = useStyle();
  return (
    <Box>
      <YAxis>
        <Text
          style={style.flatten([
            'subtitle4',
            'color-gray-300',
            'padding-left-8',
          ])}>
          {title}
        </Text>
        <Gutter size={8} />
        <Stack gutter={8}>
          {keyInfos.map(keyInfo => {
            return <KeyringItem key={keyInfo.id} keyInfo={keyInfo} />;
          })}
        </Stack>
      </YAxis>
    </Box>
  );
});

const KeyringItem: FunctionComponent<{
  keyInfo: KeyInfo;
}> = observer(({keyInfo}) => {
  const {chainStore, keyRingStore} = useStore();

  const navigate = useNavigation();

  // const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const style = useStyle();

  const paragraph = useMemo(() => {
    if (keyInfo.insensitive['bip44Path']) {
      const bip44Path = keyInfo.insensitive['bip44Path'] as any;

      // -1 means it can be multiple coin type.
      let coinType = -1;
      if (keyInfo.type === 'ledger') {
        const ledgerAppCandidate: (App | 'Ethereum')[] = [
          'Cosmos',
          'Terra',
          'Secret',
          'Ethereum',
        ];

        const app: (App | 'Ethereum')[] = [];
        for (const ledgerApp of ledgerAppCandidate) {
          if (keyInfo.insensitive[ledgerApp] != null) {
            app.push(ledgerApp);
          }
        }

        if (app.length === 0 || app.length >= 2) {
          coinType = -1;
        } else if (app[0] === 'Ethereum') {
          coinType = 60;
        } else {
          const c = AppCoinType[app[0]];
          if (c != null) {
            coinType = c;
          } else {
            coinType = -1;
          }
        }

        if (
          app.length === 1 &&
          app.includes('Cosmos') &&
          bip44Path.account === 0 &&
          bip44Path.change === 0 &&
          bip44Path.addressIndex === 0
        ) {
          return;
        }

        return `m/44'/${coinType >= 0 ? coinType : '-'}'/${
          bip44Path.account
        }'/${bip44Path.change}/${bip44Path.addressIndex}${(() => {
          if (app.length === 1) {
            if (app[0] !== 'Cosmos' && app[0] !== 'Ethereum') {
              // return ` ${intl.formatMessage({
              //   id: `page.wallet.keyring-item.bip44-path-${app[0]}-text`,
              // })}`;
              return `tes1`;
            }
          }

          return '';
        })()}`;
      }

      if (
        bip44Path.account === 0 &&
        bip44Path.change === 0 &&
        bip44Path.addressIndex === 0
      ) {
        return;
      }

      return `m/44'/${coinType >= 0 ? coinType : '-'}'/${bip44Path.account}'/${
        bip44Path.change
      }/${bip44Path.addressIndex}`;
    }

    if (
      keyInfo.type === 'private-key' &&
      typeof keyInfo.insensitive === 'object' &&
      keyInfo.insensitive['keyRingMeta'] &&
      typeof keyInfo.insensitive['keyRingMeta'] === 'object' &&
      keyInfo.insensitive['keyRingMeta']['web3Auth'] &&
      typeof keyInfo.insensitive['keyRingMeta']['web3Auth'] === 'object'
    ) {
      const web3Auth = keyInfo.insensitive['keyRingMeta']['web3Auth'];
      if (
        web3Auth['type'] &&
        web3Auth['email'] &&
        typeof web3Auth['type'] === 'string' &&
        typeof web3Auth['email'] === 'string'
      ) {
        return web3Auth['email'];
      }
    }
    // }, [intl, keyInfo.insensitive, keyInfo.type]);
  }, [keyInfo.insensitive, keyInfo.type]);

  // const dropdownItems = (() => {
  //   const defaults = [
  //     {
  //       key: 'change-wallet-name',
  //       label: intl.formatMessage({
  //         id: 'page.wallet.keyring-item.dropdown.change-wallet-name-title',
  //       }),
  //       onSelect: () => navigate(`/wallet/change-name?id=${keyInfo.id}`),
  //     },
  //     {
  //       key: 'delete-wallet',
  //       label: intl.formatMessage({
  //         id: 'page.wallet.keyring-item.dropdown.delete-wallet-title',
  //       }),
  //       onSelect: () => navigate(`/wallet/delete?id=${keyInfo.id}`),
  //     },
  //   ];

  //   switch (keyInfo.type) {
  //     case 'mnemonic': {
  //       defaults.unshift({
  //         key: 'view-recovery-phrase',
  //         label: intl.formatMessage({
  //           id: 'page.wallet.keyring-item.dropdown.view-recovery-path-title',
  //         }),
  //         onSelect: () => navigate(`/wallet/show-sensitive?id=${keyInfo.id}`),
  //       });
  //       break;
  //     }
  //     case 'private-key': {
  //       defaults.unshift({
  //         key: 'view-recovery-phrase',
  //         label: intl.formatMessage({
  //           id: 'page.wallet.keyring-item.dropdown.view-private-key-title',
  //         }),
  //         onSelect: () => navigate(`/wallet/show-sensitive?id=${keyInfo.id}`),
  //       });
  //       break;
  //     }
  //   }

  //   return defaults;
  // })();

  const isSelected = keyRingStore.selectedKeyInfo?.id === keyInfo.id;

  return (
    <Box
      padding={16}
      minHeight={74}
      borderRadius={6}
      alignY="center"
      onClick={async () => {
        if (isSelected) {
          return;
        }

        await keyRingStore.selectKeyRing(keyInfo.id);
        await chainStore.waitSyncedEnabledChains();

        navigate.goBack();
      }}
      style={StyleSheet.flatten([
        style.flatten(['background-color-gray-600']),
        isSelected &&
          style.flatten([
            'border-width-1',
            'border-color-gray-200',
            'border-solid',
          ]),
      ])}>
      <Columns sum={1} alignY="center">
        <YAxis>
          <XAxis alignY="center">
            {isSelected ? (
              <React.Fragment>
                <CheckIcon
                  size={20}
                  color={style.get('color-gray-200').color}
                />
                <Gutter size={4} />
              </React.Fragment>
            ) : null}
            <Text
              style={style.flatten([
                'subtitle2',
                'dark:color-gray-700',
                'color-gray-10',
              ])}>
              {keyInfo.name}
            </Text>
          </XAxis>
          {paragraph ? (
            <React.Fragment>
              <Gutter size={6} />
              <Text style={style.flatten(['body2', 'color-gray-300'])}>
                {paragraph}
              </Text>
            </React.Fragment>
          ) : null}
        </YAxis>
        <Column weight={1} />
        <XAxis alignY="center">
          <Box
            cursor="pointer"
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
            }}>
            {/* <FloatingDropdown
              isOpen={isMenuOpen}
              close={() => setIsMenuOpen(false)}
              items={dropdownItems}>
              <Box
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{color: ColorPalette['gray-10']}}>
                <EllipsisIcon
                  width="1.5rem"
                  height="1.5rem"
                  color={
                    theme.mode === 'light'
                      ? ColorPalette['gray-200']
                      : ColorPalette['gray-10']
                  }
                />
              </Box>
            </FloatingDropdown> */}
          </Box>
        </XAxis>
      </Columns>
    </Box>
  );
});
