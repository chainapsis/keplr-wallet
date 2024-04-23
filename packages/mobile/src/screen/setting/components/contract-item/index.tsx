import React, {FunctionComponent} from 'react';
import {Bech32Address} from '@keplr-wallet/cosmos';
import {useIntl} from 'react-intl';
import {Box} from '../../../../components/box';
import {useStyle} from '../../../../styles';
import {RectButton} from '../../../../components/rect-button';
import {Column, Columns} from '../../../../components/column';
import {ChainImageFallback} from '../../../../components/image';
import {Text} from 'react-native';
import {Gutter} from '../../../../components/gutter';
import {TextButton} from '../../../../components/text-button';

export const ContractAddressItem: FunctionComponent<{
  name: string;
  address: string;
  imageUrl: string | undefined;
  afterSelect: (address: string) => void;
}> = ({name, address, imageUrl, afterSelect}) => {
  const intl = useIntl();
  const style = useStyle();

  return (
    <RectButton
      underlayColor={style.get('color-gray-550').color}
      rippleColor={style.get('color-gray-550').color}
      onPress={async () => {
        afterSelect(address);
      }}>
      <Box paddingY={14} paddingLeft={16} paddingRight={12} borderRadius={6}>
        <Columns sum={1} alignY="center" gutter={8}>
          <Box>
            <ChainImageFallback
              style={{
                width: 32,
                height: 32,
              }}
              src={imageUrl}
              alt="chain icon"
            />
          </Box>
          <Box maxWidth={'68%'}>
            <Text
              numberOfLines={1}
              style={style.flatten(['subtitle3', 'color-text-high'])}>
              {name}
            </Text>
            <Gutter size={4} />
            <Text
              numberOfLines={1}
              style={style.flatten([
                'text-caption1',
                'color-text-low',
                'flex-1',
              ])}>
              {Bech32Address.shortenAddress(address, 20)}
            </Text>
          </Box>
          <Column weight={1} />
          <TextButton
            onPress={() => {
              afterSelect(address);
            }}
            text={intl.formatMessage({
              id: 'page.setting.token.add.contract-item.select-button',
            })}
          />
        </Columns>
      </Box>
    </RectButton>
  );
};
