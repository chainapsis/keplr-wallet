import React, {FunctionComponent, useEffect, useMemo, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {RNMessageRequesterInternal} from '../../../router';
import {BACKGROUND_PORT} from '@keplr-wallet/router';
import {GetLegacyKeyRingInfosMsg} from '@keplr-wallet/background';
import {
  KeyStore,
  MultiKeyStoreInfoElem,
} from '@keplr-wallet/background/src/keyring/legacy';
import {StyleSheet, Text} from 'react-native';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {XAxis, YAxis} from '../../../components/axis';
import {Gutter} from '../../../components/gutter';
import {Stack} from '../../../components/stack';
import {useIntl} from 'react-intl';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Column, Columns} from '../../../components/column';
import {ArrowRightIcon} from '../../../components/icon/arrow-right';
import {GuideBox} from '../../../components/guide-box';
import {ScrollViewRegisterContainer} from '../../register/components/scroll-view-register-container';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../navigation';

export const BackupAccountListScreen: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'Migration.Backup.AccountList'>>();

  const [keyInfos, setKeyInfos] = useState<KeyStore[]>([]);

  const googleTorusKeyStores = useMemo(() => {
    return keyInfos.filter(
      keyStore =>
        keyStore.type === 'privateKey' &&
        keyStore.meta &&
        keyStore.meta['email'] &&
        (!keyStore.meta['socialType'] ||
          keyStore.meta['socialType'] === 'google'),
    );
  }, [keyInfos]);

  const appleTorusKeyStores = useMemo(() => {
    return keyInfos.filter(
      keyStore =>
        keyStore.type === 'privateKey' &&
        keyStore.meta &&
        keyStore.meta['email'] &&
        keyStore.meta['socialType'] === 'apple',
    );
  }, [keyInfos]);

  const mnemonicKeyStores = useMemo(() => {
    return keyInfos.filter(
      keyStore => !keyStore.type || keyStore.type === 'mnemonic',
    );
  }, [keyInfos]);

  const ledgerKeyStores = useMemo(() => {
    return keyInfos.filter(keyStore => keyStore.type === 'ledger');
  }, [keyInfos]);

  const privateKeyStores = useMemo(() => {
    return keyInfos.filter(
      keyStore => keyStore.type === 'privateKey' && !keyStore.meta?.['email'],
    );
  }, [keyInfos]);

  useEffect(() => {
    (async () => {
      const requester = new RNMessageRequesterInternal();

      const legacyKeyringInfos = await requester.sendMessage(
        BACKGROUND_PORT,
        new GetLegacyKeyRingInfosMsg(),
      );

      if (legacyKeyringInfos) {
        setKeyInfos(legacyKeyringInfos);
      }
    })();
  }, []);

  return (
    <ScrollViewRegisterContainer
      bottomButton={{
        text: intl.formatMessage({
          id: 'page.migration.start-button',
        }),
        size: 'large',
        onPress: () => {
          navigation.reset({
            routes: [
              {
                name: 'Migration',
                params: {password: route.params.password},
              },
            ],
          });
        },
      }}>
      <Box padding={12} style={{gap: 20}}>
        <GuideBox
          color="warning"
          title={intl.formatMessage({
            id: 'page.migration.backup.warning.title',
          })}
          paragraph={intl.formatMessage({
            id: 'page.migration.backup.warning.paragraph',
          })}
        />

        {mnemonicKeyStores.length > 0 ? (
          <KeyInfoList
            title={intl.formatMessage({
              id: 'page.wallet.recovery-phrase-title',
            })}
            keyInfos={mnemonicKeyStores}
          />
        ) : null}

        {googleTorusKeyStores.length > 0 ? (
          <KeyInfoList
            title={intl.formatMessage(
              {
                id: 'page.wallet.connect-with-social-account-title',
              },
              {social: 'Google'},
            )}
            keyInfos={googleTorusKeyStores}
          />
        ) : null}

        {appleTorusKeyStores.length > 0 ? (
          <KeyInfoList
            title={intl.formatMessage(
              {
                id: 'page.wallet.connect-with-social-account-title',
              },
              {social: 'Apple'},
            )}
            keyInfos={appleTorusKeyStores}
          />
        ) : null}

        {privateKeyStores.length > 0 ? (
          <KeyInfoList
            title={intl.formatMessage({
              id: 'page.wallet.private-key-title',
            })}
            keyInfos={privateKeyStores}
          />
        ) : null}

        {ledgerKeyStores.length > 0 ? (
          <Box>
            <YAxis>
              <Text
                style={style.flatten([
                  'subtitle4',
                  'color-gray-300',
                  'padding-left-8',
                ])}>
                Ledger
              </Text>
              <Gutter size={8} />

              <Box
                padding={16}
                minHeight={74}
                borderRadius={6}
                alignY="center"
                style={style.flatten(['background-color-card-default'])}>
                <Text style={style.flatten(['subtitle3', 'color-text-low'])}>
                  You will need to re-import your Ledger accounts after the
                  migration.
                </Text>
              </Box>
            </YAxis>
          </Box>
        ) : null}
      </Box>
    </ScrollViewRegisterContainer>
  );
};

const KeyInfoList: FunctionComponent<{
  title: string;
  keyInfos: KeyStore[];
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
            return (
              <KeyringItem
                key={`${keyInfo.type}-${keyInfo.meta?.['__id__']}`}
                keyInfo={keyInfo}
              />
            );
          })}
        </Stack>
      </YAxis>
    </Box>
  );
});

const getKeyStoreParagraph = (keyStore: MultiKeyStoreInfoElem) => {
  const bip44HDPath = keyStore.bip44HDPath
    ? keyStore.bip44HDPath
    : {
        account: 0,
        change: 0,
        addressIndex: 0,
      };

  switch (keyStore.type) {
    case 'mnemonic':
      if (
        bip44HDPath.account !== 0 ||
        bip44HDPath.change !== 0 ||
        bip44HDPath.addressIndex !== 0
      ) {
        return `Mnemonic - m/44'/-/${bip44HDPath.account}'${
          bip44HDPath.change !== 0 || bip44HDPath.addressIndex !== 0
            ? `/${bip44HDPath.change}/${bip44HDPath.addressIndex}`
            : ''
        }`;
      }
      return;
    case 'privateKey':
      // Torus key
      if (keyStore.meta?.['email']) {
        return keyStore.meta?.['email'];
      }
      return;
  }
};

const KeyringItem: FunctionComponent<{
  keyInfo: KeyStore;
}> = observer(({keyInfo}) => {
  const navigate = useNavigation<StackNavProp>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'Migration.Backup.AccountList'>>();

  const style = useStyle();
  const paragraph = getKeyStoreParagraph(keyInfo);

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        navigate.navigate('Migration.Backup.ShowSensitive', {
          index: keyInfo.meta?.['__id__'] ?? '0',
          password: route.params.password,
          type: keyInfo.type,
        });
      }}>
      <Box
        padding={16}
        minHeight={74}
        borderRadius={6}
        alignY="center"
        style={style.flatten(['background-color-card-default'])}>
        <Columns sum={1} alignY="center">
          <Box width={'85%'}>
            <XAxis alignY="center">
              <Text
                numberOfLines={1}
                style={StyleSheet.flatten([
                  style.flatten(['subtitle2', 'color-gray-10']),
                  {maxWidth: '80%'},
                ])}>
                {keyInfo.meta?.['name']}
              </Text>
            </XAxis>
            {paragraph ? (
              <Text style={style.flatten(['body2', 'color-gray-300'])}>
                {paragraph}
              </Text>
            ) : null}
          </Box>
          <Column weight={1} />
          <ArrowRightIcon size={24} color={style.get('color-text-low').color} />
        </Columns>
      </Box>
    </TouchableWithoutFeedback>
  );
});
