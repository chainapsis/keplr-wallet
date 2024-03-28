import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {useStyle} from '../../../../styles';
import {Box} from '../../../../components/box';
import {Text} from 'react-native';
import {FormattedMessage} from 'react-intl';
import {XAxis} from '../../../../components/axis';
import {Gutter} from '../../../../components/gutter';

export const SwapFeeInfo: FunctionComponent = observer(() => {
  const style = useStyle();

  return (
    <Box
      padding={16}
      borderRadius={6}
      backgroundColor={style.get('color-gray-600').color}>
      <XAxis alignY="center">
        <Text
          style={style.flatten([
            'subtitle3',
            'color-text-middle',
            'text-underline',
          ])}>
          <FormattedMessage id="page.ibc-swap.components.swap-fee-info.button.transaction-fee" />
        </Text>

        <Gutter size={4} />

        <Box
          width={6}
          height={6}
          borderRadius={3}
          backgroundColor={style.get('color-blue-400').color}
        />

        <Box style={{flex: 1}} />

        <Text style={style.flatten(['body2', 'color-text-low'])}>
          ($ 0.003)
        </Text>
        <Gutter size={4} />
        <Text style={style.flatten(['body2', 'color-text-high'])}>
          0.000234 ATOM
        </Text>
      </XAxis>

      <Gutter size={10} />

      <XAxis alignY="center">
        <Text style={style.flatten(['subtitle3', 'color-text-middle'])}>
          <FormattedMessage id="page.ibc-swap.components.swap-fee-info.button.service-fee" />
        </Text>

        <Box style={{flex: 1}} />

        <Text style={style.flatten(['body2', 'color-text-middle'])}>
          0 ATOM
        </Text>
      </XAxis>
    </Box>
  );
});
