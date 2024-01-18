import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {ScrollViewRegisterContainer} from '../components/scroll-view-register-container';
import {Image, Text, View} from 'react-native';
import {Box} from '../../../components/box';
import {Gutter} from '../../../components/gutter';
import {useStyle} from '../../../styles';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../navigation';
import {BIP44HDPath, PlainObject} from '@keplr-wallet/background';
import {AddressBookData} from '../../../stores/ui-config/address-book';
import {useStore} from '../../../stores';
import {NamePasswordInput} from '../components/name-password-input';
import {useForm} from 'react-hook-form';
import {SVGLoadingIcon} from '../../../components/spinner';
import {sortedJsonByKeyStringify} from '@keplr-wallet/common';
import {ChainIdHelper} from '@keplr-wallet/cosmos';

export const ImportFromExtensionScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  return (
    <ScrollViewRegisterContainer
      paddingLeft={12}
      paddingRight={12}
      contentContainerStyle={{
        flexGrow: 1,
      }}
      bottomButton={{
        text: 'Next',
        size: 'large',
        onPress: () => {
          navigation.navigate({
            name: 'Camera',
            params: {
              importFromExtensionOnly: true,
            },
          });
        },
      }}>
      <View
        style={{
          flex: 4,
        }}
      />
      <Box alignX="center">
        <Image
          source={require('../../../public/assets/img/register/import-from-extension.png')}
          style={{
            height: 242,
            aspectRatio: 1,
          }}
        />
        <Gutter size={22} />
        <Text style={style.flatten(['h4', 'color-text-high', 'text-center'])}>
          Scan QR code to connect
        </Text>
        <Gutter size={22} />
        <Text style={style.flatten(['body1', 'color-text-low', 'text-center'])}>
          Link your Keplr Extension wallet by going to 'Settings {`>`} General{' '}
          {`>`} Link Keplr Mobile' on Extension and scan the QR code.
        </Text>
      </Box>
      <View
        style={{
          flex: 5,
        }}
      />
    </ScrollViewRegisterContainer>
  );
});

interface ExportedKeyRingVault {
  type: 'mnemonic' | 'private-key';
  id: string;
  insensitive: PlainObject;
  sensitive: string;
}

export interface DecryptedKeyRingDatasResponse {
  vaults: ExportedKeyRingVault[];
  addressBooks: {[chainId: string]: AddressBookData[] | undefined};
  enabledChainIdentifiers: Record<string, string[] | undefined>;
}

export const FinalizeImportFromExtensionScreen: FunctionComponent = observer(
  () => {
    const {keyRingStore, chainStore, uiConfigStore} = useStore();

    const {data} =
      useRoute<
        RouteProp<RootStackParamList, 'Register.FinalizeImportFromExtension'>
      >().params;

    const [needPassword, setNeedPassword] = useState(
      keyRingStore.keyInfos.length === 0,
    );

    const {
      control,
      handleSubmit,
      setFocus,
      getValues,
      formState: {errors},
    } = useForm<{
      name: string;
      password: string;
      confirmPassword: string;
    }>({
      defaultValues: {
        name: '',
        password: '',
        confirmPassword: '',
      },
    });

    const navigation = useNavigation<StackNavProp>();

    const passwordRef = useRef<string | undefined>(undefined);
    const onSubmit = handleSubmit(async data => {
      passwordRef.current = data.password;

      setNeedPassword(false);
    });

    useEffect(() => {
      if (!needPassword) {
        (async () => {
          // background에서의 체인 정보의 변경사항 (keplr-chain-registry로부터의) 등을 sync 해야한다.
          // 사실 문제가 되는 부분은 유저가 install한 직후이다.
          // 유저가 install한 직후에 바로 register page를 열도록 background가 짜여져있기 때문에
          // 이 경우 background에서 chains service가 체인 정보를 업데이트하기 전에 register page가 열린다.
          // 그 결과 chain image가 제대로 표시되지 않는다.
          // 또한 background와 체인 정보가 맞지 않을 확률이 높기 때문에 잠재적으로도 문제가 될 수 있다.
          // 이 문제를 해결하기 위해서 밑의 한줄이 존재한다.
          await chainStore.updateChainInfosFromBackground();

          // Register key ring
          const prevDupKeyRing = new Map<string, boolean>();
          for (const keyInfo of keyRingStore.keyInfos) {
            if (
              'keyRingMeta' in keyInfo.insensitive &&
              keyInfo.insensitive['keyRingMeta'] &&
              'imported_id' in (keyInfo.insensitive['keyRingMeta'] as any) &&
              (keyInfo.insensitive['keyRingMeta'] as any)['imported_id']
            ) {
              prevDupKeyRing.set(
                (keyInfo.insensitive['keyRingMeta'] as any)['imported_id'],
                true,
              );
            }
          }
          for (const vault of data.vaults) {
            if (prevDupKeyRing.get(vault.id)) {
              continue;
            }

            let newVaultId: unknown;
            if (vault.type === 'mnemonic') {
              newVaultId = await keyRingStore.newMnemonicKey(
                vault.sensitive,
                vault.insensitive['bip44Path'] as BIP44HDPath,
                vault.insensitive['keyRingName'] as string,
                passwordRef.current,
                {
                  ...(vault.insensitive['keyRingMeta'] as object),
                  imported_id: vault.id,
                },
              );

              // Restore coin type per chain
              for (const chainInfo of chainStore.chainInfos) {
                if (
                  vault.insensitive[
                    `keyRing-${
                      ChainIdHelper.parse(chainInfo.chainId).identifier
                    }-coinType`
                  ]
                ) {
                  const coinType = vault.insensitive[
                    `keyRing-${
                      ChainIdHelper.parse(chainInfo.chainId).identifier
                    }-coinType`
                  ] as number;
                  if (
                    chainInfo.bip44.coinType !== coinType &&
                    !(chainInfo.alternativeBIP44s ?? []).find(
                      path => path.coinType === coinType,
                    )
                  ) {
                    // throw new Error('Coin type is not associated to chain');
                    continue;
                  }
                  if (newVaultId && typeof newVaultId === 'string') {
                    if (
                      keyRingStore.needKeyCoinTypeFinalize(
                        newVaultId,
                        chainInfo,
                      )
                    ) {
                      keyRingStore.finalizeKeyCoinType(
                        newVaultId,
                        chainInfo.chainId,
                        coinType,
                      );
                    }
                  }
                }
              }
            }
            if (vault.type === 'private-key') {
              newVaultId = await keyRingStore.newPrivateKeyKey(
                Buffer.from(vault.sensitive, 'hex'),
                {
                  ...(vault.insensitive['keyRingMeta'] as object),
                  imported_id: vault.id,
                },
                vault.insensitive['keyRingName'] as string,
                passwordRef.current,
              );
            }

            if (newVaultId && typeof newVaultId === 'string') {
              let enabledChainIdentifiers =
                data.enabledChainIdentifiers[vault.id];
              if (enabledChainIdentifiers) {
                enabledChainIdentifiers = enabledChainIdentifiers.filter(i =>
                  chainStore.hasChain(i),
                );
                const hasDefault =
                  enabledChainIdentifiers.find(
                    i => i === chainStore.chainInfos[0].chainIdentifier,
                  ) != null;
                await chainStore.enableChainInfoInUIWithVaultId(
                  newVaultId,
                  ...enabledChainIdentifiers,
                );
                if (!hasDefault) {
                  await chainStore.disableChainInfoInUIWithVaultId(
                    newVaultId,
                    chainStore.chainInfos[0].chainIdentifier,
                  );
                }
              }
            }
          }

          // Register address book
          for (const chainId of Object.keys(data.addressBooks)) {
            if (!chainStore.hasChain(chainId)) {
              continue;
            }

            const addressBook = data.addressBooks[chainId]!;

            const prevAddressBook =
              uiConfigStore.addressBookConfig.getAddressBook(chainId);

            // Prevent importing if the data is already imported.
            const duplicationCheck = new Map<string, boolean>();

            for (const addressBookData of prevAddressBook) {
              duplicationCheck.set(
                sortedJsonByKeyStringify(addressBookData),
                true,
              );
            }

            for (const addressBookData of addressBook) {
              if (
                !duplicationCheck.get(sortedJsonByKeyStringify(addressBookData))
              ) {
                uiConfigStore.addressBookConfig.addAddressBook(
                  chainId,
                  addressBookData,
                );
              }
            }
          }

          navigation.reset({
            routes: [
              {
                name: 'Register.Welcome',
                params: {password: passwordRef.current},
              },
            ],
          });
        })();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needPassword]);

    return (
      <ScrollViewRegisterContainer
        contentContainerStyle={{
          flexGrow: 1,
        }}
        bottomButton={
          needPassword
            ? {
                text: 'Next',
                size: 'large',
                onPress: onSubmit,
              }
            : undefined
        }>
        {needPassword ? (
          <NamePasswordInput
            control={control}
            errors={errors}
            getValues={getValues}
            setFocus={setFocus}
            onSubmit={onSubmit}
            disableNameInput={true}
          />
        ) : (
          <Box style={{flex: 1}} alignX="center" alignY="center">
            <SVGLoadingIcon size={32} color="white" />
          </Box>
        )}
      </ScrollViewRegisterContainer>
    );
  },
);
