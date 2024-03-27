import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {PageWithScrollView} from '../../components/page';
import {useStyle} from '../../styles';
import {XAxis} from '../../components/axis';
import {Text} from 'react-native';
import {FormattedMessage, useIntl} from 'react-intl';
import {SettingIcon} from '../../components/icon';
import {IconButton} from '../../components/icon-button';
import {Box} from '../../components/box';
import {Gutter} from '../../components/gutter';
import {Button} from '../../components/button';
import {SwapAssetInfo} from './components/swap-asset-info';

export const IBCSwapScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      contentContainerStyle={style.flatten(['padding-x-12', 'padding-y-8'])}>
      <Box paddingX={6} paddingY={7}>
        <XAxis alignY="center">
          <Text style={style.flatten(['h4', 'color-text-high'])}>
            <FormattedMessage id="page.ibc-swap.title.swap" />
          </Text>

          <Gutter size={4} />

          <Box
            backgroundColor={style.get('color-gray-500').color}
            paddingX={5}
            paddingY={2.5}
            borderRadius={4}>
            <Text style={style.flatten(['text-caption2', 'color-gray-100'])}>
              Beta
            </Text>
          </Box>

          <Gutter size={8} />

          <Text style={style.flatten(['text-caption2', 'color-text-low'])}>
            Powered by Skip API
          </Text>

          <Box style={{flex: 1}} />

          <IconButton
            icon={
              <SettingIcon size={24} color={style.get('color-gray-10').color} />
            }
          />
        </XAxis>
      </Box>

      <Gutter size={12} />

      <SwapAssetInfo type="from" />

      <Button
        size="large"
        text={intl.formatMessage({id: 'page.ibc-swap.button.next'})}
        onPress={() => {}}
      />
    </PageWithScrollView>
  );
});
