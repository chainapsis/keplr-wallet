import React, {FunctionComponent, useMemo} from 'react';
import {observer} from 'mobx-react-lite';
import {MsgHistory} from '../types.ts';
import {useStore} from '../../../stores';
import {ColorPalette, useStyle} from '../../../styles';
import {isValidCoinStr, parseCoinStr} from '@keplr-wallet/common';
import {CoinPretty, Dec, PricePretty} from '@keplr-wallet/unit';
import {AppCurrency} from '@keplr-wallet/types';
import {MsgItemBase} from './base.tsx';
import {Path, Svg} from 'react-native-svg';
import {Box} from '../../../components/box';
import {ArrowDownIcon} from '../../../components/icon/arrow-down.tsx';
import {ArrowUpIcon} from '../../../components/icon/arrow-up.tsx';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {RectButton} from '../../../components/rect-button';
import {XAxis, YAxis} from '../../../components/axis';
import {Text} from 'react-native';
import {Gutter} from '../../../components/gutter';
import {VerticalCollapseTransition} from '../../../components/transition';
import {ItemLogo} from './logo.tsx';
import {MessageClaimRewardIcon} from '../../../components/icon';

export const MsgRelationMergedClaimRewards: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  targetDenom: string;
  isInAllActivitiesPage: boolean | undefined;
}> = observer(({msg, prices, targetDenom, isInAllActivitiesPage}) => {
  const {chainStore} = useStore();

  const style = useStyle();
  const chainInfo = chainStore.getChain(msg.chainId);

  const amountPretty = useMemo(() => {
    const currency = chainInfo.forceFindCurrency(targetDenom);

    const rewards = msg.meta['rewards'];
    if (
      rewards &&
      Array.isArray(rewards) &&
      rewards.length > 0 &&
      typeof rewards[0] === 'string'
    ) {
      for (const coinStr of rewards) {
        if (isValidCoinStr(coinStr as string)) {
          const coin = parseCoinStr(coinStr as string);
          if (coin.denom === targetDenom) {
            return new CoinPretty(currency, coin.amount);
          }
        }
      }
    }

    return new CoinPretty(currency, '0');
  }, [chainInfo, msg.meta, targetDenom]);

  const otherKnownCurrencies = (() => {
    const res: AppCurrency[] = [];
    if (msg.denoms) {
      for (const denom of msg.denoms) {
        if (denom !== targetDenom) {
          const currency = chainInfo.findCurrency(denom);
          if (currency) {
            if (
              currency.coinMinimalDenom.startsWith('ibc/') &&
              (!('originCurrency' in currency) || !currency.originCurrency)
            ) {
              continue;
            }
            res.push(currency);
          }
        }
      }
    }
    return res;
  })();

  return (
    <MsgItemBase
      logo={
        <MessageClaimRewardIcon
          size={40}
          color={style.get('color-gray-200').color}
        />
      }
      chainId={msg.chainId}
      title="Claim Reward"
      amount={amountPretty}
      prices={prices || {}}
      msg={msg}
      targetDenom={targetDenom}
      amountDeco={{
        color: 'green',
        prefix: 'plus',
      }}
      bottom={(() => {
        if (isInAllActivitiesPage) {
          if (msg.code === 0 && otherKnownCurrencies.length > 0) {
            return (
              <BottomExpandableOtherRewarsOnAllActivitiesPage
                msg={msg}
                prices={prices}
                currencies={otherKnownCurrencies}
              />
            );
          }
        }
      })()}
      isInAllActivitiesPage={isInAllActivitiesPage}
    />
  );
});

export const CheckIcon: FunctionComponent = () => {
  return (
    <Svg width={32} height={32} viewBox="0 0 32 32" fill="none">
      <Path
        d="M25.08 12.14L13.8 23.42 7 16.62l2.24-2.24 4.56 4.56 9.04-9.04 2.24 2.24z"
        fill="#2DD98F"
      />
    </Svg>
  );
};

const BottomExpandableOtherRewarsOnAllActivitiesPage: FunctionComponent<{
  msg: MsgHistory;
  prices?: Record<string, Record<string, number | undefined> | undefined>;
  currencies: AppCurrency[];
}> = observer(({msg, prices, currencies}) => {
  const {priceStore} = useStore();

  const style = useStyle();

  const defaultVsCurrency = priceStore.defaultVsCurrency;

  const [isCollapsed, setIsCollapsed] = React.useState(true);

  return (
    <React.Fragment>
      <VerticalCollapseTransition collapsed={isCollapsed}>
        {currencies.map(currency => {
          const amountPretty = (() => {
            const rewards = msg.meta['rewards'];
            if (
              rewards &&
              Array.isArray(rewards) &&
              rewards.length > 0 &&
              typeof rewards[0] === 'string'
            ) {
              for (const coinStr of rewards) {
                if (isValidCoinStr(coinStr as string)) {
                  const coin = parseCoinStr(coinStr as string);
                  if (coin.denom === currency.coinMinimalDenom) {
                    return new CoinPretty(currency, coin.amount);
                  }
                }
              }
            }

            return new CoinPretty(currency, '0');
          })();

          const sendAmountPricePretty = (() => {
            if (currency && currency.coinGeckoId) {
              const price = (prices || {})[currency.coinGeckoId];
              if (price != null && price[defaultVsCurrency] != null) {
                const dec = amountPretty.toDec();
                const priceDec = new Dec(price[defaultVsCurrency]!.toString());
                const fiatCurrency =
                  priceStore.getFiatCurrency(defaultVsCurrency);
                if (fiatCurrency) {
                  return new PricePretty(fiatCurrency, dec.mul(priceDec));
                }
              }
            }
            return;
          })();

          return (
            <Box
              key={currency.coinMinimalDenom}
              paddingX={16}
              paddingY={14}
              alignY="center">
              <XAxis alignY="center">
                <ItemLogo center={<CheckIcon />} />

                <Gutter size={12} />

                <Text style={style.flatten(['subtitle3', 'color-gray-10'])}>
                  Claim Reward
                </Text>

                <Gutter size={4} />

                <Box style={style.flatten(['flex-1'])} />

                <YAxis alignX="right">
                  {(() => {
                    return (
                      <React.Fragment>
                        <Text
                          style={style.flatten([
                            'subtitle3',
                            'color-green-400',
                          ])}>
                          {amountPretty
                            .maxDecimals(2)
                            .shrink(true)
                            .hideIBCMetadata(true)
                            .inequalitySymbol(true)
                            .inequalitySymbolSeparator('')
                            .toString()}
                        </Text>
                        {sendAmountPricePretty ? (
                          <React.Fragment>
                            <Gutter size={4} />
                            <Text
                              style={style.flatten([
                                'subtitle3',
                                'color-gray-300',
                              ])}>
                              {sendAmountPricePretty.toString()}
                            </Text>
                          </React.Fragment>
                        ) : null}
                      </React.Fragment>
                    );
                  })()}
                </YAxis>
              </XAxis>
            </Box>
          );
        })}
      </VerticalCollapseTransition>
      <TouchableWithoutFeedback
        onPress={() => {
          setIsCollapsed(!isCollapsed);
        }}>
        <RectButton
          style={style.flatten(['padding-y-8', 'flex', 'items-center'])}
          onPress={() => setIsCollapsed(!isCollapsed)}>
          <XAxis alignY="center">
            <Text style={style.flatten(['text-button2', 'color-gray-300'])}>
              {isCollapsed ? 'Expand' : 'Collapse'}
            </Text>

            <Gutter size={4} />

            {isCollapsed ? (
              <ArrowDownIcon size={20} color={ColorPalette['gray-300']} />
            ) : (
              <ArrowUpIcon size={20} color={ColorPalette['gray-300']} />
            )}
          </XAxis>
        </RectButton>
      </TouchableWithoutFeedback>
    </React.Fragment>
  );
});
