import React, {FunctionComponent, useState} from 'react';
import {IIBCChannelConfig, IRecipientConfig} from '@keplr-wallet/hooks';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../../components/box';
import {Text} from 'react-native';
import {registerCardModal} from '../../../../components/modal/card';
import {useStore} from '../../../../stores';
import {useStyle} from '../../../../styles';
import {TextInput} from '../../../../components/input';
import {SearchIcon} from '../../../../components/icon';
import {FormattedMessage, useIntl} from 'react-intl';
import {ScrollView} from '../../../../components/scroll-view/common-scroll-view';

import {XAxis} from '../../../../components/axis';
import {ChainImageFallback} from '../../../../components/image';
import {RectButton} from '../../../../components/rect-button';
import {WalletStatus} from '@keplr-wallet/stores';
import {Gutter} from '../../../../components/gutter';
import Svg, {Path} from 'react-native-svg';

export const IBCTransferSelectDestinationModal = registerCardModal<{
  chainId: string;
  denom: string;
  recipientConfig: IRecipientConfig;
  ibcChannelConfig: IIBCChannelConfig;
  setIsIBCTransfer: (value: boolean) => void;

  // 이 컴포넌트는 사실 send page에서만 쓰이기 때문에 사용하는 쪽에서 필요한 로직을 위해서 몇몇 이상한(?) prop을 넘겨준다.
  // setAutomaticRecipient는 send page에서 recipient가 자동으로 설정되었을때 유저에게 UI를 보여주기 위해서 필요하다.
  setAutomaticRecipient: (address: string) => void;
  // setIBCChannelsInfoFluent는 send page에서 analytics로 넘길 정보를 전달하기 위해서 필요하다.
  setIBCChannelsInfoFluent: (channel: {
    destinationChainId: string;
    originDenom: string;
    originChainId: string;

    channels: {
      portId: string;
      channelId: string;

      counterpartyChainId: string;
    }[];
  }) => void;
  setIsOpen: (isOpen: boolean) => void;
}>(
  observer(
    ({
      chainId,
      denom,
      recipientConfig,
      ibcChannelConfig,
      setIsIBCTransfer,
      setAutomaticRecipient,
      setIBCChannelsInfoFluent,
      setIsOpen,
    }) => {
      const intl = useIntl();
      const style = useStyle();
      const {accountStore, chainStore, skipQueriesStore} = useStore();

      const channels =
        skipQueriesStore.queryIBCPacketForwardingTransfer.getIBCChannels(
          chainId,
          denom,
        );

      const [search, setSearch] = useState('');

      const filteredChannels = channels.filter(c => {
        const chainInfo = chainStore.getChain(c.destinationChainId);
        return chainInfo.chainName
          .trim()
          .toLowerCase()
          .includes(search.trim().toLowerCase());
      });

      return (
        <Box backgroundColor={style.get('color-gray-600').color}>
          <Box paddingX={12}>
            <TextInput
              left={color => <SearchIcon size={20} color={color} />}
              value={search}
              onChange={e => {
                setSearch(e.nativeEvent.text);
              }}
              placeholder={intl.formatMessage({
                id: 'page.main.components.deposit-modal.search-placeholder',
              })}
            />
          </Box>

          <ScrollView
            isGestureScrollView={true}
            style={{height: 250, paddingHorizontal: 16}}>
            {filteredChannels
              .sort((a, b) => {
                const aIsToOrigin = a.destinationChainId === a.originChainId;
                const bIsToOrigin = b.destinationChainId === b.originChainId;

                if (aIsToOrigin && !bIsToOrigin) {
                  return -1;
                }

                if (!aIsToOrigin && bIsToOrigin) {
                  return 1;
                }

                return 0;
              })
              .map(channel => {
                const isToOrigin =
                  channel.destinationChainId === channel.originChainId;

                const chainInfo = chainStore.getChain(
                  channel.destinationChainId,
                );

                return (
                  <RectButton
                    key={chainInfo.chainId}
                    underlayColor={style.get('color-gray-550').color}
                    rippleColor={style.get('color-gray-550').color}
                    activeOpacity={1}
                    style={style.flatten(['background-color-gray-600'])}
                    onPress={async () => {
                      if (channel.channels.length > 0) {
                        const lastChainId =
                          channel.channels[channel.channels.length - 1]
                            .counterpartyChainId;

                        const account = accountStore.getAccount(lastChainId);

                        if (account.walletStatus === WalletStatus.NotInit) {
                          await account.init();
                        }

                        setIsIBCTransfer(true);
                        ibcChannelConfig.setChannels(channel.channels);
                        setIBCChannelsInfoFluent(channel);
                        // ledger에서 evmos, injective같은 경우는 유저가 먼저 ethereum app을 init 해놓지 않으면 주소를 가져올 수 없음.
                        // 이런 경우 때문에 채널은 무조건 설정해주고 account는 loaded됐을때만 주소를 설정한다.
                        if (account.walletStatus === WalletStatus.Loaded) {
                          recipientConfig.setValue(account.bech32Address);
                          setAutomaticRecipient(account.bech32Address);
                        }
                      }

                      setIsOpen(false);
                    }}>
                    <Box
                      paddingY={14}
                      paddingLeft={16}
                      paddingRight={16}
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
                          src={chainInfo.chainSymbolImageUrl}
                          alt="chain icon"
                        />

                        <Gutter size={12} />

                        <Box style={{flex: 1}}>
                          <Text
                            style={style.flatten([
                              'subtitle3',
                              'color-text-high',
                            ])}>
                            {chainInfo.chainName}
                          </Text>

                          {isToOrigin ? (
                            <XAxis alignY="center">
                              <Text
                                style={style.flatten([
                                  'body3',
                                  'color-text-middle',
                                ])}>
                                <FormattedMessage id="page.send.amount.ibc-transfer.modal.origin-chain" />
                              </Text>

                              <Gutter size={4} />

                              <HomeIcon
                                size={16}
                                color={
                                  style.flatten(['color-text-middle']).color
                                }
                              />
                            </XAxis>
                          ) : null}
                        </Box>
                      </XAxis>
                    </Box>
                  </RectButton>
                );
              })}
          </ScrollView>
        </Box>
      );
    },
  ),
);

const HomeIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({size = 32, color}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 16 17">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.43431 2.33429C7.74673 2.02187 8.25327 2.02187 8.56568 2.33429L14.1657 7.93429C14.3945 8.16309 14.4629 8.50718 14.3391 8.80612C14.2153 9.10506 13.9236 9.29998 13.6 9.29998H12.8V14.1C12.8 14.5418 12.4418 14.9 12 14.9H10.4C9.95817 14.9 9.6 14.5418 9.6 14.1V11.7C9.6 11.2581 9.24183 10.9 8.8 10.9H7.2C6.75817 10.9 6.4 11.2581 6.4 11.7V14.1C6.4 14.5418 6.04183 14.9 5.6 14.9H4C3.55817 14.9 3.2 14.5418 3.2 14.1V9.29998H2.4C2.07643 9.29998 1.78472 9.10506 1.6609 8.80612C1.53707 8.50718 1.60552 8.16309 1.83431 7.93429L7.43431 2.33429Z"
        fill={color}
      />
    </Svg>
  );
};
