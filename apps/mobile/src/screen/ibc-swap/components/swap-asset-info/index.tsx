import React, {FunctionComponent, useEffect, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../../components/box';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import {useStyle} from '../../../../styles';
import {FormattedMessage, useIntl} from 'react-intl';
import {XAxis} from '../../../../components/axis';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Gutter} from '../../../../components/gutter';
import {ChainImageFallback} from '../../../../components/image';
import {ArrowDownFillIcon} from '../../../../components/icon/arrow-donw-fill.tsx';
import {SettingIcon} from '../../../../components/icon';
import {ISenderConfig} from '@keplr-wallet/hooks';
import {IBCSwapAmountConfig} from '@keplr-wallet/hooks-internal';
import {useStore} from '../../../../stores';
import {AppCurrency} from '@keplr-wallet/types';
import {useEffectOnce} from '../../../../hooks';
import {CoinPretty, Dec, DecUtils} from '@keplr-wallet/unit';
import {SVGLoadingIcon} from '../../../../components/spinner';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../../navigation.tsx';
import Svg, {Path} from 'react-native-svg';
import {IconProps} from '../../../../components/icon/types.ts';
import {VerticalCollapseTransition} from '../../../../components/transition';
import {SelectDestinationChainModal} from '../select-destination-chain-modal';
import {InformationOutlinedIcon} from '../../../../components/icon/information-outlined.tsx';
import {InformationModal} from '../../../../components/modal/infoModal.tsx';

export const SwapAssetInfo: FunctionComponent<{
  type: 'from' | 'to';
  senderConfig: ISenderConfig;
  amountConfig: IBCSwapAmountConfig;

  onDestinationChainSelect?: (
    chainId: string,
    coinMinimalDenom: string,
  ) => void;
}> = observer(
  ({type, senderConfig, amountConfig, onDestinationChainSelect}) => {
    const intl = useIntl();
    const style = useStyle();
    const navigation = useNavigation<StackNavProp>();
    const route = useRoute<RouteProp<RootStackParamList, 'Swap'>>();

    const {priceStore, chainStore, queriesStore} = useStore();

    const price = (() => {
      return priceStore.calculatePrice(amountConfig.amount[0]);
    })();
    const [priceValue, setPriceValue] = useState('');
    const [isPriceBased, setIsPriceBased] = useState(false);

    // Price symbol의 collapsed transition을 기다리기 위해서 사용됨.
    const [renderPriceSymbol, setRenderPriceSymbol] = useState(isPriceBased);
    useEffect(() => {
      if (isPriceBased) {
        setRenderPriceSymbol(true);
      }
    }, [isPriceBased]);

    const fromChainInfo = chainStore.getChain(amountConfig.chainId);
    const fromCurrency: AppCurrency | undefined = (() => {
      if (amountConfig.amount.length === 0) {
        return;
      }

      return amountConfig.amount[0].currency;
    })();

    const toChainInfo = chainStore.getChain(amountConfig.outChainId);
    const outCurrency: AppCurrency = amountConfig.outCurrency;

    const textInputRef = useRef<TextInput | null>(null);
    useEffectOnce(() => {
      if (type === 'from') {
        if (textInputRef.current) {
          textInputRef.current.focus();
        }
      }
    });

    const [isSelectDestinationModalOpen, setIsSelectDestinationModalOpen] =
      useState(false);
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

    return (
      <Box
        paddingX={16}
        paddingTop={16}
        paddingBottom={12}
        borderRadius={6}
        backgroundColor={style.get('color-gray-600').color}>
        <XAxis alignY="center">
          <XAxis alignY="center">
            <Text style={style.flatten(['subtitle3', 'color-text-middle'])}>
              {type === 'from' ? (
                <FormattedMessage id="page.ibc-swap.components.swap-asset-info.from" />
              ) : (
                <FormattedMessage id="page.ibc-swap.components.swap-asset-info.to" />
              )}
            </Text>

            {type === 'to' ? (
              <TouchableWithoutFeedback
                hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}
                onPress={() => {
                  setIsInfoModalOpen(true);
                }}>
                <InformationOutlinedIcon
                  size={20}
                  color={style.get('color-gray-300').color}
                />
              </TouchableWithoutFeedback>
            ) : null}

            <Gutter size={4} />

            {(() => {
              if (type === 'to') {
                if (amountConfig.isFetching) {
                  return (
                    <View
                      style={style.flatten(['justify-center', 'items-center'])}>
                      <SVGLoadingIcon
                        color={style.get('color-text-middle').color}
                        size={16}
                      />
                    </View>
                  );
                }
              }
            })()}
          </XAxis>

          <Box style={{flex: 1}} />

          {type === 'from' ? (
            <TouchableWithoutFeedback
              onPress={() => {
                amountConfig.setFraction(1);
              }}
              style={style.flatten(['padding-y-4'])}>
              <Box paddingX={6} paddingY={2}>
                <Text style={style.flatten(['body2', 'color-text-middle'])}>
                  <FormattedMessage
                    id="page.ibc-swap.components.swap-asset-info.max-asset"
                    values={{
                      asset: (() => {
                        const bal = queriesStore
                          .get(senderConfig.chainId)
                          .queryBalances.getQueryBech32Address(
                            senderConfig.sender,
                          )
                          .getBalance(amountConfig.currency);

                        if (!bal) {
                          return `0 ${amountConfig.currency.coinDenom}`;
                        }

                        return bal.balance
                          .maxDecimals(6)
                          .trim(true)
                          .shrink(true)
                          .inequalitySymbol(true)
                          .hideIBCMetadata(true)
                          .toString();
                      })(),
                    }}
                  />
                </Text>
              </Box>
            </TouchableWithoutFeedback>
          ) : null}
        </XAxis>

        <Gutter size={12} />

        <XAxis alignY="center">
          <Box style={{flex: 1}}>
            <XAxis alignY="center">
              {renderPriceSymbol ? (
                <PriceSymbol
                  show={isPriceBased}
                  onTransitionEnd={() => {
                    if (!isPriceBased) {
                      setRenderPriceSymbol(false);
                    }
                  }}
                />
              ) : null}
              <TextInput
                ref={textInputRef}
                placeholder={'0'}
                editable={type === 'from'}
                placeholderTextColor={style.get('color-text-low').color}
                style={StyleSheet.flatten([
                  style.flatten([
                    'h3',
                    'color-text-high',
                    'padding-x-4',
                    'padding-y-8',
                  ]),
                ])}
                value={
                  type === 'from'
                    ? (() => {
                        if (isPriceBased) {
                          if (amountConfig.fraction != 0) {
                            return price
                              ?.toDec()
                              .toString(price?.options.maxDecimals);
                          }
                          return priceValue;
                        } else {
                          return amountConfig.value;
                        }
                      })()
                    : amountConfig.outAmount
                        .maxDecimals(6)
                        .trim(true)
                        .shrink(true)
                        .inequalitySymbol(true)
                        .hideDenom(true)
                        .toString()
                }
                keyboardType="decimal-pad"
                autoCapitalize="none"
                onChangeText={text => {
                  if (type === 'from') {
                    if (isPriceBased) {
                      if (price) {
                        let value = text;
                        if (value.startsWith('.')) {
                          value = '0' + value;
                        }
                        if (value.trim().length === 0) {
                          amountConfig.setValue('');
                          setPriceValue(value);
                          return;
                        }
                        if (/^\d+(\.\d+)*$/.test(value)) {
                          let dec: Dec;
                          try {
                            dec = new Dec(value);
                          } catch (e) {
                            console.log(e);
                            return;
                          }
                          if (dec.lte(new Dec(0))) {
                            setPriceValue(value);
                            return;
                          }

                          const onePrice = priceStore.calculatePrice(
                            new CoinPretty(
                              amountConfig.amount[0].currency,
                              DecUtils.getTenExponentN(
                                amountConfig.amount[0].currency.coinDecimals,
                              ),
                            ),
                          );

                          if (!onePrice) {
                            // Can't be happen
                            return;
                          }
                          const onePriceDec = onePrice.toDec();
                          const expectedAmount = dec.quo(onePriceDec);

                          setPriceValue(value);
                          amountConfig.setValue(
                            expectedAmount.toString(
                              amountConfig.amount[0].currency.coinDecimals,
                            ),
                          );
                        }
                      }
                    } else {
                      amountConfig.setValue(text);
                    }
                  }
                }}
              />
            </XAxis>
          </Box>

          <Gutter size={8} />

          <TouchableWithoutFeedback
            onPress={() => {
              if (type === 'from') {
                navigation.navigate('Send.SelectAsset', {
                  isIBCSwap: true,
                  outChainId: route.params.outChainId,
                  outCoinMinimalDenom: route.params.outCoinMinimalDenom,
                });
              } else {
                const excludeKey = (() => {
                  if (amountConfig.amount.length === 1) {
                    return `${amountConfig.chainInfo.chainIdentifier}/${amountConfig.amount[0].currency.coinMinimalDenom}`;
                  }

                  return '';
                })();

                navigation.navigate('Swap.SelectAsset', {
                  ...route.params,
                  excludeKey,
                });
              }
            }}>
            <Box
              paddingY={8}
              paddingLeft={12}
              paddingRight={10}
              borderRadius={44}
              backgroundColor={style.get('color-gray-500').color}>
              <XAxis alignY="center">
                {(() => {
                  const currency = type === 'from' ? fromCurrency : outCurrency;

                  if (type === 'to') {
                    if (
                      chainStore
                        .getChain(amountConfig.outChainId)
                        .findCurrency(outCurrency.coinMinimalDenom) == null
                    ) {
                      return (
                        <View
                          style={style.flatten([
                            'justify-center',
                            'items-center',
                          ])}>
                          <SVGLoadingIcon
                            color={style.get('color-text-middle').color}
                            size={16}
                          />
                        </View>
                      );
                    }
                  }

                  return (
                    <React.Fragment>
                      <ChainImageFallback
                        style={{
                          width: 20,
                          height: 20,
                        }}
                        src={currency?.coinImageUrl}
                        alt={''}
                      />

                      <Gutter size={8} />

                      <Text
                        style={style.flatten(['subtitle2', 'color-gray-10'])}>
                        {(() => {
                          if (currency) {
                            if (
                              'originCurrency' in currency &&
                              currency.originCurrency
                            ) {
                              // XXX: 솔직히 이거 왜 타입 추론 제대로 안되는지 모르겠다... 일단 대충 처리
                              return (currency.originCurrency as any).coinDenom;
                            }

                            return currency.coinDenom;
                          }
                          return 'Unknown';
                        })()}
                      </Text>

                      <Gutter size={4} />

                      <ArrowDownFillIcon
                        size={16}
                        color={style.get('color-gray-10').color}
                      />
                    </React.Fragment>
                  );
                })()}
              </XAxis>
            </Box>
          </TouchableWithoutFeedback>
        </XAxis>

        <Gutter size={8} />

        <XAxis alignY="center">
          <TouchableWithoutFeedback
            onPress={() => {
              if (type !== 'from') {
                return;
              }

              if (!isPriceBased) {
                if (price!.toDec().lte(new Dec(0))) {
                  setPriceValue('');
                } else {
                  setPriceValue(
                    price!
                      .toDec()
                      .toString(price!.options.maxDecimals)
                      .toString(),
                  );
                }
              }
              setIsPriceBased(!isPriceBased);

              textInputRef.current?.focus();
            }}>
            <XAxis alignY="center">
              {type === 'from' ? (
                <React.Fragment>
                  <SwitchPriceIcon
                    size={20}
                    color={style.get('color-text-low').color}
                  />
                  <Gutter size={4} />
                </React.Fragment>
              ) : null}

              {(() => {
                if (type === 'from' && !price) {
                  return null;
                }
                if (type === 'to') {
                  if (!priceStore.calculatePrice(amountConfig.outAmount)) {
                    return null;
                  }
                }

                return (
                  <Text style={style.flatten(['body2', 'color-text-low'])}>
                    {(() => {
                      if (isPriceBased) {
                        return amountConfig.amount[0]
                          .trim(true)
                          .maxDecimals(6)
                          .inequalitySymbol(true)
                          .shrink(true)
                          .hideIBCMetadata(true)
                          .toString();
                      } else {
                        if (type === 'from') {
                          return price!.toString();
                        } else {
                          const p = priceStore.calculatePrice(
                            amountConfig.outAmount,
                          );
                          if (!p) {
                            return null;
                          }
                          return p.toString();
                        }
                      }
                    })()}
                  </Text>
                );
              })()}
            </XAxis>
          </TouchableWithoutFeedback>

          <Box style={{flex: 1}} />

          <TouchableWithoutFeedback
            onPress={() => {
              if (type === 'to') {
                setIsSelectDestinationModalOpen(true);
              }
            }}>
            <XAxis alignY="center">
              <Text style={style.flatten(['body2', 'color-text-low'])}>
                <FormattedMessage
                  id="page.ibc-swap.components.swap-asset-info.on-chain-name"
                  values={{
                    chainName: (() => {
                      const chainInfo =
                        type === 'from' ? fromChainInfo : toChainInfo;
                      return chainInfo.chainName;
                    })(),
                  }}
                />
              </Text>

              {type === 'to' ? (
                <React.Fragment>
                  <Gutter size={2} />
                  <SettingIcon
                    size={14}
                    color={style.get('color-text-low').color}
                  />
                </React.Fragment>
              ) : null}
            </XAxis>
          </TouchableWithoutFeedback>
        </XAxis>

        <SelectDestinationChainModal
          isOpen={isSelectDestinationModalOpen}
          setIsOpen={setIsSelectDestinationModalOpen}
          amountConfig={amountConfig}
          onDestinationChainSelect={
            onDestinationChainSelect ||
            (() => {
              // noop
            })
          }
        />

        <InformationModal
          isOpen={isInfoModalOpen}
          setIsOpen={setIsInfoModalOpen}
          title={intl.formatMessage({
            id: 'page.ibc-swap.components.swap-asset-info.quote-slippage-information-title',
          })}
          paragraph={intl.formatMessage({
            id: 'page.ibc-swap.components.swap-asset-info.quote-slippage-information-paragraph',
          })}
        />
      </Box>
    );
  },
);

const PriceSymbol: FunctionComponent<{
  show: boolean;
  onTransitionEnd: () => void;
}> = observer(({show, onTransitionEnd}) => {
  const style = useStyle();

  const {priceStore} = useStore();

  // VerticalCollapseTransition의 문제때메... 초기에는 transition이 안되는 문제가 있어서
  // 초기에는 transition을 하지 않도록 해야함.
  const [hasInit, setHasInit] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    if (hasInit) {
      setCollapsed(!show);
    }
  }, [hasInit, show]);

  const fiatCurrency = priceStore.getFiatCurrency(priceStore.defaultVsCurrency);

  if (!fiatCurrency) {
    return null;
  }

  return (
    <Box>
      <Text
        style={StyleSheet.flatten([
          style.flatten(['h3', 'color-text-high']),
          {opacity: 0},
        ])}>
        {fiatCurrency.symbol}
      </Text>
      <Box position="absolute" width="100%">
        <VerticalCollapseTransition
          transitionAlign="center"
          collapsed={collapsed}
          onResize={() => {
            setHasInit(true);
          }}
          onTransitionEnd={onTransitionEnd}>
          <Text style={style.flatten(['h3', 'color-text-high'])}>
            {fiatCurrency.symbol}
          </Text>
        </VerticalCollapseTransition>
      </Box>
    </Box>
  );
});

const SwitchPriceIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.7429 3.34801C12.5013 3.60818 12.5163 4.01493 12.7765 4.25652L14.5769 5.92829L7.21395 5.9283C6.85891 5.9283 6.57109 6.21611 6.57109 6.57115C6.57109 6.92619 6.85891 7.21401 7.21395 7.21401L14.5769 7.21401L12.7765 8.88579C12.5163 9.12737 12.5013 9.53413 12.7429 9.7943C12.9845 10.0545 13.3912 10.0695 13.6514 9.82795L16.6514 7.04223C16.7824 6.9206 16.8568 6.74991 16.8568 6.57115C16.8568 6.39239 16.7824 6.22171 16.6514 6.10007L13.6514 3.31436C13.3912 3.07277 12.9845 3.08783 12.7429 3.34801ZM7.25646 10.2051C7.01487 9.94498 6.60811 9.92991 6.34794 10.1715L3.34794 12.9572C3.21695 13.0788 3.14252 13.2495 3.14252 13.4283C3.14252 13.6071 3.21695 13.7777 3.34794 13.8994L6.34794 16.6851C6.60811 16.9267 7.01487 16.9116 7.25646 16.6514C7.49804 16.3913 7.48298 15.9845 7.22281 15.7429L5.42243 14.0712H12.7854C13.1404 14.0712 13.4282 13.7833 13.4282 13.4283C13.4282 13.0733 13.1404 12.7854 12.7854 12.7854H5.42243L7.22281 11.1137C7.48298 10.8721 7.49804 10.4653 7.25646 10.2051Z"
        fill={color || 'currentColor'}
      />
    </Svg>
  );
};
