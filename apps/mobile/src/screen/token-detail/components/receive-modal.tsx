import React from 'react';
import {registerCardModal} from '../../../components/modal/card';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../components/box';
import {Text} from 'react-native';
import {useStyle} from '../../../styles';
import {useStore} from '../../../stores';
import {ChainImageFallback} from '../../../components/image';
import {XAxis} from '../../../components/axis';
import {Gutter} from '../../../components/gutter';
import QRCode from 'react-native-qrcode-svg';
import {AddressChip} from './address-chip.tsx';
import {Button} from '../../../components/button';

export const ReceiveModal = registerCardModal<{
  chainId: string;
  setIsOpen: (isOpen: boolean) => void;
}>(
  observer(({chainId, setIsOpen}) => {
    const {chainStore, accountStore} = useStore();
    const style = useStyle();

    const chainInfo = chainStore.getChain(chainId);
    const account = accountStore.getAccount(chainId);

    return (
      <Box paddingX={12} paddingBottom={12}>
        <Box alignX="center">
          <Text style={style.flatten(['h4', 'color-white'])}>Copy Address</Text>

          <Gutter size={20} />

          <XAxis alignY="center">
            <ChainImageFallback
              style={{
                width: 32,
                height: 32,
              }}
              src={chainInfo.chainSymbolImageUrl}
              alt={chainInfo.chainName}
            />

            <Gutter size={8} />

            <Text style={style.flatten(['subtitle3', 'color-gray-10'])}>
              {chainInfo.chainName}
            </Text>
          </XAxis>

          <Gutter size={12} />
          <Box
            alignX="center"
            alignY="center"
            backgroundColor="white"
            borderRadius={20}
            padding={12}
            marginTop={20}>
            <QRCode
              value={account.bech32Address}
              size={176}
              backgroundColor="white"
              color="black"
              logo={require('../../../public/assets/logo-256.png')}
            />
          </Box>

          <Gutter size={20} />

          <AddressChip chainId={chainId} inModal={true} />
        </Box>

        <Gutter size={20} />

        <Button
          color="secondary"
          text="Close"
          size="large"
          onPress={() => setIsOpen(false)}
        />
      </Box>
    );
  }),
);
