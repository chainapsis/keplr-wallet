import React, {FunctionComponent, useMemo, useState} from 'react';
import {Box} from '../../../../components/box';

import {Button} from '../../../../components/button';
import {Column, Columns} from '../../../../components/column';
import {ChainImageFallback} from '../../../../components/image';
import {Stack} from '../../../../components/stack';
import {Checkbox} from '../../../../components/checkbox';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../../stores';
import {ChainIdHelper} from '@keplr-wallet/cosmos';
import {TokenScan} from '@keplr-wallet/background';
import {CoinPretty} from '@keplr-wallet/unit';
import {Gutter} from '../../../../components/gutter';
import {XAxis, YAxis} from '../../../../components/axis';
import {BaseModalHeader} from '../../../../components/modal';
import {Text} from 'react-native';
import {TextButton} from '../../../../components/text-button';
import {ArrowUpIcon} from '../../../../components/icon/arrow-up';
import {ArrowDownIcon} from '../../../../components/icon/arrow-down';
import {IconButton} from '../../../../components/icon-button';
import {useStyle} from '../../../../styles';
import {registerCardModal} from '../../../../components/modal/card';
import {StackNavProp} from '../../../../navigation';
import {ScrollView} from '../../../../components/scroll-view/common-scroll-view';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

export const TokenFoundModal = registerCardModal(
  observer<{setIsOpen: (isOpen: boolean) => void; navigation: StackNavProp}>(
    ({setIsOpen, navigation}) => {
      const {chainStore, keyRingStore} = useStore();
      const style = useStyle();

      const [checkedChainIdentifiers, setCheckedChainIdentifiers] = useState<
        string[]
      >([]);

      const numFoundToken = useMemo(() => {
        if (chainStore.tokenScans.length === 0) {
          return 0;
        }

        const set = new Set<string>();

        for (const tokenScan of chainStore.tokenScans) {
          for (const info of tokenScan.infos) {
            for (const asset of info.assets) {
              const key = `${
                ChainIdHelper.parse(tokenScan.chainId).identifier
              }/${asset.currency.coinMinimalDenom}`;
              set.add(key);
            }
          }
        }

        return Array.from(set).length;
      }, [chainStore.tokenScans]);

      const buttonClicked = async () => {
        if (!keyRingStore.selectedKeyInfo) {
          throw new Error('Unexpected error: no selected key ring');
        }

        const enables = checkedChainIdentifiers
          .filter(identifier => !chainStore.isEnabledChain(identifier))
          .filter(identifier => {
            return (
              chainStore.tokenScans.find(tokenScan => {
                return (
                  ChainIdHelper.parse(tokenScan.chainId).identifier ===
                  identifier
                );
              }) != null
            );
          });

        const needBIP44Selects: string[] = [];

        // chainStore.tokenScans는 체인이 enable되고 나면 그 체인은 사라진다.
        // 근데 로직상 enable 이후에 추가 로직이 있다.
        // 그래서 일단 얇은 복사를 하고 이 값을 사용한다.
        const tokenScans = chainStore.tokenScans.slice();

        for (const enable of enables) {
          if (
            keyRingStore.needKeyCoinTypeFinalize(
              keyRingStore.selectedKeyInfo.id,
              chainStore.getChain(enable),
            )
          ) {
            const tokenScan = tokenScans.find(tokenScan => {
              return (
                ChainIdHelper.parse(tokenScan.chainId).identifier === enable
              );
            });

            if (tokenScan && tokenScan.infos.length > 1) {
              needBIP44Selects.push(enable);
              enables.splice(enables.indexOf(enable), 1);
            }

            if (
              tokenScan &&
              tokenScan.infos.length === 1 &&
              tokenScan.infos[0].coinType != null
            ) {
              await keyRingStore.finalizeKeyCoinType(
                keyRingStore.selectedKeyInfo.id,
                enable,
                tokenScan.infos[0].coinType,
              );
            }
          }
        }

        if (enables.length > 0) {
          await chainStore.enableChainInfoInUI(...enables);
        }

        if (needBIP44Selects.length > 0) {
          navigation.navigate('Register.SelectDerivationPath', {
            chainIds: needBIP44Selects,
            totalCount: needBIP44Selects.length,
            vaultId: keyRingStore.selectedKeyInfo?.id,
            skipWelcome: true,
          });
        }

        setIsOpen(false);
      };
      return (
        <Box padding={12} paddingTop={1}>
          <BaseModalHeader title={`${numFoundToken} New Token(s) Found`} />
          <Gutter size={12} />
          <ScrollView isGestureScrollView={true} style={{maxHeight: 350}}>
            <Stack gutter={12}>
              {chainStore.tokenScans.map(tokenScan => {
                return (
                  <FoundChainView
                    key={tokenScan.chainId}
                    tokenScan={tokenScan}
                    checked={checkedChainIdentifiers.includes(
                      ChainIdHelper.parse(tokenScan.chainId).identifier,
                    )}
                    onCheckbox={checked => {
                      if (checked) {
                        setCheckedChainIdentifiers(ids => [
                          ...ids,
                          ChainIdHelper.parse(tokenScan.chainId).identifier,
                        ]);
                      } else {
                        setCheckedChainIdentifiers(ids =>
                          ids.filter(
                            id =>
                              id !==
                              ChainIdHelper.parse(tokenScan.chainId).identifier,
                          ),
                        );
                      }
                    }}
                  />
                );
              })}
            </Stack>
          </ScrollView>

          <Gutter size={12} />

          <YAxis alignX="center">
            <TouchableWithoutFeedback
              style={style.flatten(['flex-row', 'justify-center'])}
              onPress={() => {
                if (
                  chainStore.tokenScans.length ===
                  checkedChainIdentifiers.length
                ) {
                  setCheckedChainIdentifiers([]);
                } else {
                  setCheckedChainIdentifiers(
                    chainStore.tokenScans.map(tokenScan => {
                      return ChainIdHelper.parse(tokenScan.chainId).identifier;
                    }),
                  );
                }
              }}>
              <XAxis alignY="center">
                <Text style={style.flatten(['color-gray-300'])}>
                  Select All
                </Text>
                <Gutter size={4} />
                <Checkbox
                  size="small"
                  checked={
                    chainStore.tokenScans.length ===
                    checkedChainIdentifiers.length
                  }
                  onPress={() => {
                    if (
                      chainStore.tokenScans.length ===
                      checkedChainIdentifiers.length
                    ) {
                      setCheckedChainIdentifiers([]);
                    } else {
                      setCheckedChainIdentifiers(
                        chainStore.tokenScans.map(tokenScan => {
                          return ChainIdHelper.parse(tokenScan.chainId)
                            .identifier;
                        }),
                      );
                    }
                  }}
                />
              </XAxis>
            </TouchableWithoutFeedback>
          </YAxis>

          {keyRingStore.selectedKeyInfo?.type === 'ledger' ? (
            <React.Fragment>
              <Gutter size={12} />
              <Box alignX="center">
                <TextButton
                  textStyle={style.flatten(['text-button2'])}
                  text="Add tokens on Injective and Evmos"
                  onPress={() => {
                    if (keyRingStore.selectedKeyInfo) {
                      navigation.navigate('Register.EnableChain', {
                        vaultId: keyRingStore.selectedKeyInfo.id,
                        skipWelcome: true,
                      });
                      setIsOpen(false);
                    }
                  }}
                />
              </Box>
              <Gutter size={20} />
            </React.Fragment>
          ) : (
            <Gutter size={12} />
          )}

          <Button
            text="Add Chains"
            size="large"
            disabled={checkedChainIdentifiers.length === 0}
            onPress={buttonClicked}
          />
        </Box>
      );
    },
  ),
);

const FoundChainView: FunctionComponent<{
  checked: boolean;
  onCheckbox: (checked: boolean) => void;

  tokenScan: TokenScan;
}> = observer(({checked, onCheckbox, tokenScan}) => {
  const {chainStore} = useStore();

  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);

  const style = useStyle();
  const numTokens = useMemo(() => {
    const set = new Set<string>();

    for (const info of tokenScan.infos) {
      for (const asset of info.assets) {
        const key = `${ChainIdHelper.parse(tokenScan.chainId).identifier}/${
          asset.currency.coinMinimalDenom
        }`;
        set.add(key);
      }
    }

    return Array.from(set).length;
  }, [tokenScan]);

  return (
    <Box
      padding={14}
      backgroundColor={style.get('color-gray-500').color}
      borderRadius={6}>
      <Columns sum={1} gutter={8} alignY="center">
        <Box width={36} height={36}>
          <ChainImageFallback
            style={{
              width: 32,
              height: 32,
            }}
            alt="Token Found Modal Chain Image"
            src={chainStore.getChain(tokenScan.chainId).chainSymbolImageUrl}
          />
        </Box>

        <Stack gutter={4}>
          <Text style={style.flatten(['subtitle2', 'color-gray-10'])}>
            {chainStore.getChain(tokenScan.chainId).chainName}
          </Text>
          <Text style={style.flatten(['color-gray-300', 'body3'])}>
            {numTokens} Tokens
          </Text>
        </Stack>

        <Column weight={1} />

        <Checkbox
          checked={checked}
          onPress={checked => {
            onCheckbox(checked);
          }}
          size="large"
        />

        {/* TODO 나중에 IconButton 만들어지면 교체해야 됨 */}
        <IconButton
          containerStyle={style.flatten([
            'border-radius-64',
            'width-40',
            'height-40',
          ])}
          style={style.flatten(['border-radius-64'])}
          icon={
            isDetailOpen ? (
              <ArrowUpIcon
                size={24}
                color={style.get('color-gray-200').color}
              />
            ) : (
              <ArrowDownIcon
                size={24}
                color={style.get('color-gray-200').color}
              />
            )
          }
          onPress={() => setIsDetailOpen(!isDetailOpen)}
        />
      </Columns>

      {isDetailOpen ? (
        <Box
          backgroundColor={style.get('color-gray-400').color}
          borderRadius={6}
          paddingY={12}
          paddingX={16}
          marginTop={12}>
          <Stack gutter={8}>
            {tokenScan.infos.length > 0 &&
            tokenScan.infos[0].assets.length > 0 ? (
              <React.Fragment>
                {tokenScan.infos[0].assets.map(asset => {
                  return (
                    <FoundTokenView
                      key={asset.currency.coinMinimalDenom}
                      chainId={tokenScan.chainId}
                      asset={asset}
                    />
                  );
                })}
              </React.Fragment>
            ) : null}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
});

const FoundTokenView: FunctionComponent<{
  chainId: string;
  asset: TokenScan['infos'][0]['assets'][0];
}> = observer(({chainId, asset}) => {
  const {chainStore} = useStore();
  const style = useStyle();

  return (
    <Columns sum={1} gutter={8} alignY="center">
      <Box width={28} height={28}>
        <ChainImageFallback
          style={{width: 28, height: 28}}
          alt="Token Found Modal Token Image"
          src={asset.currency.coinImageUrl}
        />
      </Box>

      <Text style={style.flatten(['subtitle3', 'color-gray-50'])}>
        {
          chainStore
            .getChain(chainId)
            .forceFindCurrency(asset.currency.coinMinimalDenom).coinDenom
        }
      </Text>

      <Column weight={1} />
      <Text style={style.flatten(['subtitle3', 'color-gray-50'])}>
        {new CoinPretty(
          chainStore
            .getChain(chainId)
            .forceFindCurrency(asset.currency.coinMinimalDenom),
          asset.amount,
        )
          .shrink(true)
          .trim(true)
          .maxDecimals(6)
          .inequalitySymbol(true)
          .toString()}
      </Text>
    </Columns>
  );
});
