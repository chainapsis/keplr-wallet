import React, {useState} from 'react';
import {IBCSwapAmountConfig} from '../../../../hooks/ibc-swap';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../../components/box';
import {useStyle} from '../../../../styles';
import {TextInput} from '../../../../components/input';
import {SearchIcon} from '../../../../components/icon';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStore} from '../../../../stores';
import {RectButton} from '../../../../components/rect-button';
import {XAxis} from '../../../../components/axis';
import {ChainImageFallback} from '../../../../components/image';
import {Gutter} from '../../../../components/gutter';
import {Text} from 'react-native';
import {ScrollView} from '../../../../components/scroll-view/common-scroll-view.tsx';
import {registerCardModal} from '../../../../components/modal/card';

export const SelectDestinationChainModal = registerCardModal<{
  amountConfig: IBCSwapAmountConfig;
  onDestinationChainSelect: (chainId: string, coinMinimalDenom: string) => void;
  setIsOpen: (isOpen: boolean) => void;
}>(
  observer(({amountConfig, onDestinationChainSelect, setIsOpen}) => {
    const intl = useIntl();
    const style = useStyle();

    const {chainStore, skipQueriesStore} = useStore();

    const [search, setSearch] = useState('');

    const channels: {
      chainId: string;
      denom: string;
    }[] =
      skipQueriesStore.queryIBCSwap.getSwapDestinationCurrencyAlternativeChains(
        chainStore.getChain(amountConfig.outChainId),
        amountConfig.outCurrency,
      );

    const filteredChannels = (() => {
      const trim = search.trim().toLowerCase();
      if (trim.length === 0) {
        return channels;
      }

      return channels.filter(channel => {
        return chainStore
          .getChain(channel.chainId)
          .chainName.toLowerCase()
          .includes(trim);
      });
    })();

    return (
      <Box backgroundColor={style.get('color-gray-600').color}>
        <Box paddingX={12}>
          <Box paddingY={12}>
            <Text style={style.flatten(['h4', 'color-text-high'])}>
              <FormattedMessage id="page.ibc-swap.components.swap-asset-info.modal.select-destination-chain.title" />
            </Text>
          </Box>

          <TextInput
            left={color => <SearchIcon size={20} color={color} />}
            value={search}
            onChange={e => {
              setSearch(e.nativeEvent.text);
            }}
            placeholder={intl.formatMessage({
              id: 'page.ibc-swap.components.swap-asset-info.modal.search.placeholder',
            })}
          />

          <Gutter size={12} />

          <ScrollView isGestureScrollView={true} style={{height: 250}}>
            {filteredChannels.map(channel => {
              return (
                <RectButton
                  key={channel.chainId + '/' + channel.denom}
                  underlayColor={style.get('color-gray-550').color}
                  rippleColor={style.get('color-gray-550').color}
                  activeOpacity={1}
                  style={style.flatten(['background-color-gray-600'])}
                  onPress={() => {
                    onDestinationChainSelect(channel.chainId, channel.denom);

                    setIsOpen(false);
                  }}>
                  <Box
                    paddingX={16}
                    paddingY={14}
                    borderRadius={6}
                    height={74}
                    alignY="center"
                    alignX="center">
                    <XAxis alignY="center">
                      <ChainImageFallback
                        style={{
                          width: 32,
                          height: 32,
                        }}
                        src={
                          chainStore.getChain(channel.chainId)
                            .chainSymbolImageUrl
                        }
                        alt="chain icon"
                      />

                      <Gutter size={12} />

                      <Box style={{flex: 1}}>
                        <Text
                          style={style.flatten([
                            'subtitle3',
                            'color-text-high',
                          ])}>
                          {chainStore.getChain(channel.chainId).chainName}
                        </Text>
                      </Box>
                    </XAxis>
                  </Box>
                </RectButton>
              );
            })}
          </ScrollView>
        </Box>
      </Box>
    );
  }),
);
