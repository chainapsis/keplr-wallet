import React, {FunctionComponent, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Text} from 'react-native';

import {useStyle} from '../../../../styles';
import {Gutter} from '../../../../components/gutter';
import {SearchTextInput} from '../../../../components/input/search-text-input';
import {Box} from '../../../../components/box';
import {RectButton} from '../../../../components/rect-button';
import {Column, Columns} from '../../../../components/column';
import {ChainImageFallback} from '../../../../components/image';
import {ViewToken} from '../..';
import {useStore} from '../../../../stores';
import {Stack} from '../../../../components/stack';
import {IntPretty} from '@keplr-wallet/unit';
import {formatAprString} from '../../utils';
import {AprItem} from '../../../../stores/aprs';
import {ArrowRightIcon} from '../../../../components/icon/arrow-right';
import {registerCardModal} from '../../../../components/modal/card';
import {BaseModalHeader} from '../../../../components/modal';
import {EmptyView, EmptyViewText} from '../../../../components/empty-view';
import {useIntl} from 'react-intl';
import {ScrollView} from '../../../../components/scroll-view/common-scroll-view';

export interface SelectStakingChainModalItem {
  key: string;
  viewToken: ViewToken;
}

export const SelectStakingChainModal = registerCardModal(
  observer<{
    items: SelectStakingChainModalItem[];
    placeholder?: string;
    aprList: AprItem[];
    onSelect: (item: SelectStakingChainModalItem) => void;
  }>(({items, placeholder, aprList, onSelect}) => {
    const [search, setSearch] = useState('');
    const style = useStyle();
    const intl = useIntl();

    const filtered = search
      ? items.filter(item => {
          const trimmedSearchText = search.trim();

          if (trimmedSearchText.length > 0) {
            return (
              typeof item.viewToken.chainInfo.chainName === 'string' &&
              item.viewToken.chainInfo.chainName
                .toLowerCase()
                .includes(trimmedSearchText.toLowerCase())
            );
          }
        })
      : items;

    return (
      <Box>
        <Box paddingX={16}>
          <BaseModalHeader
            titleStyle={style.flatten(['text-left', 'padding-left-8'])}
            title={intl.formatMessage({
              id: 'page.main.components.staking-chain-modal.title',
            })}
          />
          <Gutter size={12} />
          <SearchTextInput
            value={search}
            onChange={e => {
              e.preventDefault();
              setSearch(e.nativeEvent.text);
            }}
            placeholder={placeholder}
          />

          <Gutter size={12} />
        </Box>
        <ScrollView
          isGestureScrollView={true}
          style={{height: 250, paddingHorizontal: 16}}>
          <Box>
            {filtered.map(item => {
              return (
                <TokenItem
                  key={item.key}
                  viewToken={item.viewToken}
                  onSelect={onSelect}
                  apr={
                    aprList.filter(
                      ({chainId}) =>
                        chainId === item.viewToken.chainInfo.chainId,
                    )[0]?.apr
                  }
                />
              );
            })}
            {!filtered.length ? (
              <Box style={style.flatten(['padding-16'])}>
                <Gutter size={40} />
                <EmptyView>
                  <Box alignX="center" width={312}>
                    <EmptyViewText text="No Available Assets" />
                    <Gutter size={12} />
                    <EmptyViewText
                      text={intl.formatMessage({
                        id: 'page.main.components.staking-chain-modal.empty-text',
                      })}
                    />
                  </Box>
                </EmptyView>
              </Box>
            ) : null}
          </Box>
        </ScrollView>
      </Box>
    );
  }),
);

const TokenItem: FunctionComponent<{
  viewToken: ViewToken;
  onSelect: (item: SelectStakingChainModalItem) => void;
  apr?: IntPretty;
}> = observer(({viewToken, onSelect, apr}) => {
  const {priceStore} = useStore();
  const style = useStyle();
  const pricePretty = priceStore.calculatePrice(viewToken.token);
  const coinDenom = (() => {
    if (
      'originCurrency' in viewToken.token.currency &&
      viewToken.token.currency.originCurrency
    ) {
      return viewToken.token.currency.originCurrency.coinDenom;
    }
    return viewToken.token.currency.coinDenom;
  })();

  return (
    <RectButton
      underlayColor={style.get('color-gray-550').color}
      rippleColor={style.get('color-gray-550').color}
      activeOpacity={1}
      style={style.flatten(['background-color-gray-600'])}
      onPress={async () => {
        onSelect({key: viewToken.chainInfo.chainId, viewToken});
      }}>
      <Box
        padding={16}
        paddingRight={8}
        borderRadius={6}
        height={74}
        alignY="center"
        alignX="center">
        <Columns sum={1} alignY="center" gutter={12}>
          <Box>
            <ChainImageFallback
              style={{
                width: 32,
                height: 32,
              }}
              src={viewToken.chainInfo.chainSymbolImageUrl}
              alt="chain icon"
            />
          </Box>
          <Stack gutter={4}>
            <Text style={style.flatten(['subtitle2', 'color-text-high'])}>
              {coinDenom}
            </Text>
            <Text style={style.flatten(['body3', 'color-text-low'])}>
              APR {formatAprString(apr, 2)}%
            </Text>
          </Stack>
          <Column weight={2} />
          <Stack alignX="right" gutter={4}>
            <Text style={style.flatten(['subtitle1', 'color-text-high'])}>
              {viewToken.token
                .hideDenom(true)
                .maxDecimals(4)
                .inequalitySymbol(true)
                .shrink(true)
                .toString()}
            </Text>
            <Text style={style.flatten(['subtitle2', 'color-text-low'])}>
              {pricePretty
                ? pricePretty.inequalitySymbol(true).toString()
                : '-'}
            </Text>
          </Stack>
          <Gutter size={4} />
          <ArrowRightIcon size={24} color={style.get('color-gray-400').color} />
        </Columns>
      </Box>
    </RectButton>
  );
});
