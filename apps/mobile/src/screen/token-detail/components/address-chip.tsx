import React, {FunctionComponent, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../stores';
import {RectButton} from '../../../components/rect-button';
import {Text} from 'react-native';
import {useStyle} from '../../../styles';
import {Bech32Address} from '@keplr-wallet/cosmos';
import {CopyOutlineIcon} from '../../../components/icon';
import {Gutter} from '../../../components/gutter';
import {XAxis} from '../../../components/axis';
import * as Clipboard from 'expo-clipboard';
import LottieView from 'lottie-react-native';

export const AddressChip: FunctionComponent<{
  chainId: string;

  // modal 안에서는 색상 문제로 안보여서
  // modal 안에서는 배경색을 바꿈
  inModal?: boolean;
}> = observer(({chainId, inModal}) => {
  const {accountStore} = useStore();
  const style = useStyle();

  const account = accountStore.getAccount(chainId);

  const [hasCopied, setHasCopied] = useState(false);

  return (
    <RectButton
      rippleColor={style.get('color-gray-550').color}
      underlayColor={style.get('color-gray-550').color}
      style={{
        ...style.flatten([
          'padding-x-10',
          'padding-y-8',
          inModal ? 'background-color-gray-500' : 'background-color-gray-600',
        ]),
        borderRadius: 48,
      }}
      onPress={async () => {
        await Clipboard.setStringAsync(account.bech32Address);
        setHasCopied(true);

        setTimeout(() => {
          setHasCopied(false);
        }, 1000);
      }}>
      <XAxis alignY="center">
        <Text style={style.flatten(['color-gray-200', 'body3'])}>
          {Bech32Address.shortenAddress(account.bech32Address, 16)}
        </Text>

        <Gutter size={4} />
        {hasCopied ? (
          <LottieView
            source={require('../../../public/assets/lottie/register/check-circle-icon.json')}
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
  );
});
