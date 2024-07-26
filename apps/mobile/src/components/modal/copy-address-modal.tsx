import {registerCardModal} from './card';
import {BaseModalHeader} from './modal.tsx';
import React, {useState} from 'react';
import {Box} from '../box';
import {Gutter} from '../gutter';
import {Button} from '../button';
import {RectButton} from '../rect-button';
import {XAxis} from '../axis';
import {Text} from 'react-native';
import {CopyOutlineIcon} from '../icon';
import {useStyle} from '../../styles';
import LottieView from 'lottie-react-native';
import * as Clipboard from 'expo-clipboard';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {Bech32Address} from '@keplr-wallet/cosmos';

export const CopyAddressModal = registerCardModal(
  observer<{
    chainId: string;
    setIsOpen: (isOpen: boolean) => void;
  }>(({chainId, setIsOpen}) => {
    const style = useStyle();
    const [isCopied, setIsCopied] = useState(false);

    const {accountStore, chainStore} = useStore();
    const accountInfo = accountStore.getAccount(chainId);
    const bech32Address = accountInfo.bech32Address;

    const chainInfo = chainStore.getChain(chainId);

    return (
      <Box paddingX={12} alignX="center">
        <BaseModalHeader title={`Copy Your ${chainInfo.chainName} Address`} />

        <Gutter size={12} />

        <RectButton
          underlayColor={style.get('color-gray-400').color}
          rippleColor={style.get('color-gray-400').color}
          style={{
            borderRadius: 48,
            ...style.flatten([
              'background-color-gray-500',
              'padding-x-10',
              'padding-y-8',
            ]),
          }}
          onPress={async () => {
            setIsCopied(true);

            await Clipboard.setStringAsync(bech32Address);

            setTimeout(() => {
              setIsCopied(false);
            }, 1000);
          }}>
          <XAxis alignY="center">
            <Text style={style.flatten(['body3', 'color-gray-200'])}>
              {Bech32Address.shortenAddress(bech32Address, 20)}
            </Text>

            <Gutter size={4} />

            {isCopied ? (
              <LottieView
                source={require('../../public/assets/lottie/register/check-circle-icon.json')}
                loop={false}
                autoPlay
                style={style.flatten(['width-16', 'height-16'])}
              />
            ) : (
              <CopyOutlineIcon
                size={16}
                color={style.get('color-gray-300').color}
              />
            )}
          </XAxis>
        </RectButton>

        <Gutter size={20} />

        <Text
          style={style.flatten(['body2', 'color-text-middle', 'text-center'])}>
          Once copied, go back to your Coinbase app or mobile webpage to send
          the {chainInfo.currencies[0].coinDenom} tokens to this address.
        </Text>

        <Gutter size={30} />

        <Button
          text={'Close'}
          size="large"
          color="secondary"
          containerStyle={{width: '100%'}}
          onPress={() => setIsOpen(false)}
        />

        <Gutter size={30} />
      </Box>
    );
  }),
);
