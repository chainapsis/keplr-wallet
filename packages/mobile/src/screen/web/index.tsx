import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useState} from 'react';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {Dimensions, Image, StyleSheet, Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TextInput} from '../../components/input';
import {validURL} from './util';
import {Gutter} from '../../components/gutter';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../navigation';
import {Columns} from '../../components/column';
import {useStore} from '../../stores';
import {RectButton} from '../../components/rect-button';
import {GlobeIcon} from '../../components/icon/globe';
import {Box} from '../../components/box';
import {TrashCanIcon} from '../../components/icon';
import {EmptyView} from '../../components/empty-view';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {RectButton as NativeRectButton} from 'react-native-gesture-handler';

// TODO: 디자인 반영해서 적용
export const WebScreen: FunctionComponent = observer(() => {
  const {favoriteWebpageStore} = useStore();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  const dAppPageUrl = 'https://explore.keplr.app';
  const safeAreaInsets = useSafeAreaInsets();

  const [uri, setURI] = useState('');
  const [uriError, setURIError] = useState('');

  return (
    <PageWithScrollView
      backgroundMode="default"
      contentContainerStyle={style.get('flex-grow-1')}
      style={StyleSheet.flatten([
        style.flatten(['padding-x-20']),
        {
          marginTop: safeAreaInsets.top,
        },
      ])}>
      <Text style={style.flatten(['h3', 'color-text-high'])}>
        Discover Apps
      </Text>

      <Gutter size={20} />

      <TextInput
        returnKeyType="go"
        value={uri}
        error={uriError}
        placeholder="Search for a chain"
        placeholderTextColor={style.flatten(['color-gray-300']).color}
        onChangeText={text => {
          setURI(text);
          setURIError('');
        }}
        onSubmitEditing={() => {
          if (validURL(uri) || uri.includes('localhost')) {
            setURIError('');
            navigation.navigate('WebTab', {
              screen: 'Web.WebPage',
              params: {url: uri},
            });
            setURI('');
          } else {
            setURIError('Invalid URL');
          }
        }}
        style={style.flatten([
          'background-color-white',
          'border-radius-6',
          'color-black',
        ])}
        autoCorrect={false}
        autoCapitalize="none"
        autoComplete="off"
      />

      <Gutter size={20} />
      <Box
        style={style.flatten([
          'relative',
          'margin-bottom-12',
          'border-radius-8',
          'overflow-hidden',
        ])}>
        <Image
          source={require('../../public/assets/img/webpage/dapp-banner.png')}
          style={{
            width: Dimensions.get('screen').width - 40,
            height: (Dimensions.get('screen').width - 40) / 4.7925,
          }}
          fadeDuration={0}
        />
        <Box style={style.flatten(['absolute-fill', 'flex'])}>
          <NativeRectButton
            style={style.flatten(['flex-1'])}
            rippleColor={style.get('color-rect-button-default-ripple').color}
            underlayColor={
              style.get('color-rect-button-default-underlay').color
            }
            activeOpacity={0.2}
            onPress={() => {
              navigation.navigate('WebTab', {
                screen: 'Web.WebPage',
                params: {url: dAppPageUrl},
              });
            }}
          />
        </Box>
      </Box>

      <Gutter size={31} />
      <Columns sum={1} alignY="center">
        <Text
          style={style.flatten([
            'body3',
            'margin-right-4',
            'color-text-middle',
          ])}>
          Favorite
        </Text>
        <Text
          style={style.flatten([
            'subtitle2',
            'margin-right-4',
            'color-blue-400',
          ])}>
          {favoriteWebpageStore.urls.length}
        </Text>
      </Columns>
      <Gutter size={12} />

      {favoriteWebpageStore.urls.length > 0 ? (
        favoriteWebpageStore.urls.map(url => {
          return (
            <RectButton
              key={url}
              style={style.flatten([
                'flex-row',
                'items-center',
                'padding-16',
                'margin-bottom-8',
                'border-radius-8',
                'background-color-gray-600',
              ])}
              onPress={() => {
                navigation.navigate('WebTab', {
                  screen: 'Web.WebPage',
                  params: {url},
                });
              }}>
              <Box marginRight={16}>
                <GlobeIcon
                  size={24}
                  color={style.flatten(['color-blue-400']).color}
                />
              </Box>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={style.flatten([
                  'subtitle3',
                  'color-text-high',
                  'flex-1',
                ])}>
                {url
                  .replace('https://', '')
                  .replace('http://', '')
                  .replace('www.', '')}
              </Text>
              <TouchableOpacity
                style={style.flatten(['padding-12'])}
                onPress={() => {
                  favoriteWebpageStore.removeUrl(url);
                }}>
                <TrashCanIcon
                  color={style.get('color-text-low').color}
                  size={24}
                />
              </TouchableOpacity>
            </RectButton>
          );
        })
      ) : (
        <Box>
          <EmptyView subject="Favorites" />
        </Box>
      )}

      <Gutter size={20} />
    </PageWithScrollView>
  );
});
