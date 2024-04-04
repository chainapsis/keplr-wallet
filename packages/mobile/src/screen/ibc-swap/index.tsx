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
import {IconProps} from '../../components/icon/types.ts';
import {Path, Svg} from 'react-native-svg';
import {SwapFeeInfo} from './components/swap-fee-info';
import {WarningGuideBox} from './components/warning-guide-box';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../navigation.tsx';
import {SlippageModal} from './components/slippage-modal';

export const IBCSwapScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();

  const navigation = useNavigation<StackNavProp>();

  // const route = useRoute<RouteProp<RootStackParamList, 'Swap'>>();

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

      <Box paddingY={6} alignX="center" alignY="center" zIndex={10}>
        <Box
          position="absolute"
          padding={6}
          borderRadius={999}
          backgroundColor={style.get('color-gray-500').color}
          style={{top: -12}}>
          <ArrowsUpDownIcon
            size={24}
            color={style.get('color-gray-10').color}
          />
        </Box>
      </Box>

      <SwapAssetInfo type="to" />

      <Gutter size={12} />

      <SwapFeeInfo />

      <Gutter size={12} />

      <WarningGuideBox />

      <Gutter size={12} />

      <Button
        size="large"
        text={intl.formatMessage({id: 'page.ibc-swap.button.next'})}
        onPress={() => {
          navigation.navigate('Swap.SelectAsset');
        }}
      />

      <SlippageModal isOpen={false} setIsOpen={() => {}} />
    </PageWithScrollView>
  );
});

const ArrowsUpDownIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.68756 8.15966C3.0518 8.49788 3.62126 8.47679 3.95948 8.11255L6.29997 5.59203L6.29997 15.9001C6.29997 16.3972 6.70291 16.8001 7.19997 16.8001C7.69702 16.8001 8.09997 16.3972 8.09997 15.9001V5.59203L10.4405 8.11255C10.7787 8.47679 11.3481 8.49788 11.7124 8.15966C12.0766 7.82144 12.0977 7.25198 11.7595 6.88774L7.85948 2.68774C7.68919 2.50435 7.45023 2.40015 7.19997 2.40015C6.9497 2.40015 6.71074 2.50435 6.54045 2.68774L2.64045 6.88774C2.30223 7.25198 2.32332 7.82144 2.68756 8.15966ZM12.2876 15.8406C11.9233 16.1789 11.9022 16.7483 12.2405 17.1126L16.1405 21.3126C16.3107 21.4959 16.5497 21.6001 16.8 21.6001C17.0502 21.6001 17.2892 21.4959 17.4595 21.3126L21.3595 17.1126C21.6977 16.7483 21.6766 16.1789 21.3124 15.8406C20.9481 15.5024 20.3787 15.5235 20.0405 15.8877L17.7 18.4083V8.10015C17.7 7.60309 17.297 7.20015 16.8 7.20015C16.3029 7.20015 15.9 7.60309 15.9 8.10015V18.4083L13.5595 15.8877C13.2213 15.5235 12.6518 15.5024 12.2876 15.8406Z"
        fill={color || 'currentColor'}
      />
    </Svg>
  );
};
