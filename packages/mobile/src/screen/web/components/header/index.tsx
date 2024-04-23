import React, {FunctionComponent} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useStyle} from '../../../../styles';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Svg, {Path} from 'react-native-svg';
import {RectButton} from '../../../../components/rect-button';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../../stores';
import {useWebViewState} from '../../context';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../../navigation';
import {Box} from '../../../../components/box';
import {Columns} from '../../../../components/column';

const ArrowLeftIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({size = 32, color}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 32 32">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M20.5 25l-9-9 9-9"
      />
    </Svg>
  );
};

const ArrowRightIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({size = 32, color}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 32 32">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M11.5 7l9 9-9 9"
      />
    </Svg>
  );
};

const RefreshIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({size = 20, color}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 20 20">
      <Path
        stroke={color}
        strokeLinecap="round"
        strokeWidth="2"
        d="M16.536 10.06A6.518 6.518 0 1114.77 5.6"
      />
      <Path fill={color} d="M16.149 7.303l-4.803-.61L16.093 2.5l.056 4.803z" />
    </Svg>
  );
};

const StarIcon: FunctionComponent<{size: number; color: string}> = ({
  size = 32,
  color,
}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 32 32">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.3841 4.28107C14.9819 2.84381 17.0179 2.84381 17.6157 4.28107L20.3917 10.9554L27.5972 11.533C29.1488 11.6574 29.778 13.5938 28.5958 14.6065L23.106 19.3091L24.7832 26.3404C25.1444 27.8545 23.4972 29.0513 22.1688 28.2399L15.9999 24.4719L9.83105 28.2399C8.50263 29.0513 6.85544 27.8545 7.21661 26.3404L8.89384 19.3091L3.40404 14.6065C2.22185 13.5938 2.85102 11.6574 4.40267 11.533L11.6081 10.9554L14.3841 4.28107Z"
        fill={color}
      />
    </Svg>
  );
};

const HomeIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({size = 32, color}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 32 32">
      <Path
        stroke={color}
        strokeWidth="2"
        d="M27.429 16.033v8.626c0 1.53-1.216 2.77-2.715 2.77h-3.023a1.5 1.5 0 01-1.5-1.5v-5.887a.914.914 0 00-.905-.923h-5.429c-.5 0-.905.413-.905.923v5.886a1.5 1.5 0 01-1.5 1.5H8.43c-1.5 0-2.715-1.24-2.715-2.77v-8.625c0-.98.382-1.92 1.06-2.612l7.878-8.038a2.676 2.676 0 013.839 0l7.878 8.038a3.732 3.732 0 011.06 2.612z"
      />
    </Svg>
  );
};

export const OnScreenWebpageScreenHeader: FunctionComponent = observer(() => {
  const style = useStyle();
  const {favoriteWebpageStore} = useStore();
  const safeAreaInsets = useSafeAreaInsets();
  const headerHeight = 48;
  const navigation = useNavigation<StackNavProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Web'>>();
  const {isExternal} = route.params;

  const webViewState = useWebViewState();
  return (
    <Box
      paddingTop={safeAreaInsets.top + 6}
      paddingX={12}
      height={headerHeight + safeAreaInsets.top}
      paddingBottom={6}
      alignY="center"
      alignX="center"
      backgroundColor={style.get('color-gray-600').color}>
      <View
        style={style.flatten(['flex-row', 'justify-between', 'width-full'])}>
        <Columns sum={1} alignY="center" gutter={12}>
          <RectButton
            style={style.flatten(['border-radius-4'])}
            rippleColor={style.get('color-gray-550').color}
            underlayColor={style.get('color-gray-550').color}
            activeOpacity={1}
            onPress={() => {
              if (!webViewState.canGoBack) {
                navigation.goBack();
              } else if (webViewState.webView) {
                webViewState.webView.goBack();
              }
            }}>
            <ArrowLeftIcon
              size={32}
              color={style.flatten(['color-gray-100']).color}
            />
          </RectButton>
          <RectButton
            style={style.flatten(['border-radius-4'])}
            rippleColor={style.get('color-gray-550').color}
            underlayColor={style.get('color-gray-550').color}
            activeOpacity={1}
            onPress={() => {
              if (webViewState.webView) {
                webViewState.webView.goForward();
              }
            }}>
            <ArrowRightIcon
              size={32}
              color={style.flatten(['color-gray-100']).color}
            />
          </RectButton>
        </Columns>
        <RectButton
          rippleColor={style.get('color-gray-550').color}
          underlayColor={style.get('color-gray-550').color}
          activeOpacity={1}
          style={style.flatten([
            'border-radius-4',
            'flex-1',
            'padding-x-12',
            'height-36',
            'justify-center',
          ])}
          onPress={() => {
            if (webViewState.webView) {
              webViewState.webView.reload();
            }
          }}>
          <Columns sum={1} alignY="center" gutter={8} columnAlign="center">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={StyleSheet.flatten([
                style.flatten(['subtitle3', 'color-gray-50']),
                {maxWidth: '87%'},
              ])}>
              {webViewState.name}
            </Text>
            <RefreshIcon
              size={20}
              color={style.flatten(['color-gray-300']).color}
            />
          </Columns>
        </RectButton>

        <Columns sum={1} alignY="center" gutter={12}>
          <RectButton
            style={style.flatten(['border-radius-4'])}
            rippleColor={style.get('color-gray-550').color}
            underlayColor={style.get('color-gray-550').color}
            activeOpacity={1}
            onPress={() => {
              if (favoriteWebpageStore.isSaved(webViewState.url)) {
                favoriteWebpageStore.removeUrl(webViewState.url);
              } else {
                favoriteWebpageStore.addUrl(webViewState.url);
              }
            }}>
            <StarIcon
              size={32}
              color={
                style.flatten([
                  favoriteWebpageStore.isSaved(webViewState.url)
                    ? 'color-blue-400'
                    : 'color-gray-300',
                ]).color
              }
            />
          </RectButton>
          {!isExternal ? (
            <RectButton
              style={style.flatten(['border-radius-4'])}
              rippleColor={style.get('color-gray-550').color}
              underlayColor={style.get('color-gray-550').color}
              activeOpacity={1}
              onPress={() => {
                navigation.navigate('WebTab', {screen: 'Web.Intro'});
              }}>
              <HomeIcon
                size={32}
                color={style.flatten(['color-gray-100']).color}
              />
            </RectButton>
          ) : null}
        </Columns>
      </View>
    </Box>
  );
});
