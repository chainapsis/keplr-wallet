import React, {FunctionComponent, useRef, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {validURL} from '../util.ts';
import {useIntl} from 'react-intl';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, WebStackNavigation} from '../../../navigation.tsx';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {XAxis} from '../../../components/axis';
import {TextButton} from '../../../components/text-button';
import {NativeStackNavigationProp} from 'react-native-screens/native-stack';
import {RectButton} from '../../../components/rect-button';
import {InteractionManager, Text, TextInput} from 'react-native';
import {useStore} from '../../../stores';
import {TextInput as NativeTextInput} from 'react-native';
import {useEffectOnce} from '../../../hooks';
import Svg, {Path} from 'react-native-svg';
import {Gutter} from '../../../components/gutter';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';
import {SearchedUrl} from '../../../stores/webpage/types.ts';

export const SearchUrlScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const route = useRoute<RouteProp<RootStackParamList, 'Web.Search'>>();
  const navigation =
    useNavigation<NativeStackNavigationProp<WebStackNavigation>>();

  const {webpageStore} = useStore();

  const safeAreaInsets = useSafeAreaInsets();

  const [search, setSearch] = useState(route.params.url || '');

  const inputRef = useRef<NativeTextInput>(null);
  useEffectOnce(() => {
    // XXX: 병맛이지만 RN에서 스크린이 변할때 바로 mount에서 focus를 주면 안드로이드에서 키보드가 안뜬다.
    //      이 경우 settimeout을 쓰라지만... 그냥 스크린이 다 뜨면 포커스를 주는 것으로 한다.
    InteractionManager.runAfterInteractions(() => {
      inputRef.current?.focus();
    });
  });

  const moveWebPage = (uriOrKeyword: string) => {
    if (validURL(uriOrKeyword) || uriOrKeyword.includes('localhost')) {
      navigation.replace('Web.WebPage', {
        url: uriOrKeyword,
      });

      setSearch('');
    } else {
      navigation.replace('Web.WebPage', {
        url: `https://www.google.com/search?q=${encodeURI(uriOrKeyword)}`,
      });
    }
  };

  return (
    <Box
      backgroundColor={style.get('color-gray-700').color}
      style={style.flatten(['flex-1'])}>
      <Box
        paddingTop={safeAreaInsets.top + 6}
        paddingX={12}
        paddingY={6}
        height={safeAreaInsets.top + 58}
        backgroundColor={style.get('color-gray-600').color}>
        <XAxis alignY="center">
          <Box
            backgroundColor={style.get('color-gray-500').color}
            borderRadius={4}
            paddingX={12}
            style={{
              flex: 1,
            }}>
            <XAxis alignY="center">
              <TextInput
                returnKeyType="go"
                value={search}
                ref={inputRef}
                placeholder={intl.formatMessage({
                  id: 'page.browser.input-placeholder',
                })}
                placeholderTextColor={style.flatten(['color-gray-300']).color}
                style={style.flatten([
                  'color-gray-50',
                  'flex-1',
                  'min-height-44',
                ])}
                onChangeText={text => {
                  setSearch(text);
                }}
                onSubmitEditing={() => {
                  webpageStore.addSearchedUrl(search);

                  moveWebPage(search);
                }}
                autoCorrect={false}
                autoCapitalize="none"
                autoComplete="off"
              />

              <TouchableWithoutFeedback
                style={style.flatten(['padding-y-8'])}
                onPress={() => setSearch('')}>
                <XCircleIcon
                  size={16}
                  color={style.get('color-gray-200').color}
                />
              </TouchableWithoutFeedback>
            </XAxis>
          </Box>

          <TextButton text="Cancel" onPress={() => navigation.goBack()} />
        </XAxis>
      </Box>

      <Box>
        {webpageStore.searchedUrls.map((searchedUrl: SearchedUrl) => {
          return (
            <RectButton
              key={searchedUrl.url}
              onPress={() => moveWebPage(searchedUrl.url)}
              rippleColor={style.get('color-gray-600').color}
              underlayColor={style.get('color-gray-600').color}
              style={{
                ...style.flatten([
                  'background-color-gray-650',
                  'padding-x-24',
                  'padding-y-20',
                ]),
                borderBottomWidth: 1,
                borderBottomColor: style.get('color-gray-550').color,
              }}>
              <XAxis alignY="center">
                <HistoryIcon
                  size={20}
                  color={style.get('color-text-low').color}
                />

                <Gutter size={8} />

                <Text style={style.flatten(['body3', 'color-text-middle'])}>
                  {searchedUrl.url}
                </Text>
              </XAxis>
            </RectButton>
          );
        })}
      </Box>
    </Box>
  );
});

const HistoryIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({size = 20, color}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 20 20">
      <Path
        d="M10.0003 1.66651C14.6028 1.66651 18.3337 5.39734 18.3337 9.99984C18.3337 14.6023 14.6028 18.3332 10.0003 18.3332C5.39783 18.3332 1.66699 14.6023 1.66699 9.99984H3.33366C3.33378 11.5675 3.88638 13.0851 4.89435 14.2857C5.90232 15.4864 7.30119 16.2935 8.84518 16.5651C10.3892 16.8368 11.9795 16.5556 13.3367 15.771C14.694 14.9865 15.7313 13.7487 16.2665 12.2752C16.8017 10.8016 16.8004 9.18664 16.263 7.71394C15.7256 6.24123 14.6864 5.00503 13.3279 4.22252C11.9695 3.44002 10.3787 3.16127 8.83518 3.43526C7.29161 3.70925 5.89397 4.51845 4.88783 5.72068L6.66699 7.49984H1.66699V2.49984L3.70616 4.53818C4.48762 3.6357 5.45427 2.9121 6.54037 2.41658C7.62646 1.92105 8.80653 1.66523 10.0003 1.66651ZM10.8337 5.83318V9.65401L13.5362 12.3565L12.357 13.5357L9.16699 10.344V5.83318H10.8337Z"
        fill={color}
      />
    </Svg>
  );
};

const XCircleIcon: FunctionComponent<{
  size: number;
  color: string;
}> = ({size = 24, color}) => {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2.25C6.61522 2.25 2.25 6.61522 2.25 12C2.25 17.3848 6.61522 21.75 12 21.75C17.3848 21.75 21.75 17.3848 21.75 12C21.75 6.61522 17.3848 2.25 12 2.25ZM10.2803 9.21967C9.98744 8.92678 9.51256 8.92678 9.21967 9.21967C8.92678 9.51256 8.92678 9.98744 9.21967 10.2803L10.9393 12L9.21967 13.7197C8.92678 14.0126 8.92678 14.4874 9.21967 14.7803C9.51256 15.0732 9.98744 15.0732 10.2803 14.7803L12 13.0607L13.7197 14.7803C14.0126 15.0732 14.4874 15.0732 14.7803 14.7803C15.0732 14.4874 15.0732 14.0126 14.7803 13.7197L13.0607 12L14.7803 10.2803C15.0732 9.98744 15.0732 9.51256 14.7803 9.21967C14.4874 8.92678 14.0126 8.92678 13.7197 9.21967L12 10.9393L10.2803 9.21967Z"
        fill={color}
      />
    </Svg>
  );
};
