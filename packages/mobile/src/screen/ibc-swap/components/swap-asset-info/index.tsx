import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../../components/box';
import {Text, TextInput} from 'react-native';
import {useStyle} from '../../../../styles';
import {FormattedMessage} from 'react-intl';
import {XAxis} from '../../../../components/axis';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {Gutter} from '../../../../components/gutter';

export const SwapAssetInfo: FunctionComponent<{
  type: 'from' | 'to';
}> = observer(({type}) => {
  const style = useStyle();

  return (
    <Box
      paddingX={16}
      paddingTop={16}
      paddingBottom={12}
      borderRadius={6}
      backgroundColor={style.get('color-gray-600').color}>
      <XAxis alignY="center">
        <Text style={style.flatten(['subtitle3', 'color-text-middle'])}>
          {type === 'from' ? (
            <FormattedMessage id="page.ibc-swap.components.swap-asset-info.from" />
          ) : (
            <FormattedMessage id="page.ibc-swap.components.swap-asset-info.to" />
          )}
        </Text>

        <Box style={{flex: 1}} />

        <TouchableWithoutFeedback onPress={() => {}}>
          <Box padding={6}>
            <Text style={style.flatten(['body2', 'color-text-middle'])}>
              Max: 234.3456 ATOM
            </Text>
          </Box>
        </TouchableWithoutFeedback>
      </XAxis>

      <Gutter size={12} />

      <XAxis alignY="center">
        <Box style={{flex: 1}}>
          <TextInput placeholder={'0'} />
        </Box>

        <Gutter size={8} />

        <Box
          paddingY={8}
          paddingLeft={12}
          paddingRight={10}
          borderRadius={44}
          backgroundColor={style.get('color-gray-500').color}>
          <Text>ATOM</Text>
        </Box>
      </XAxis>
    </Box>
  );
});
