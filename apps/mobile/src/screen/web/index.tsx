import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useState} from 'react';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {Dimensions, Image, Platform, StyleSheet, Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Gutter} from '../../components/gutter';
import {useNavigation} from '@react-navigation/native';
import {Columns} from '../../components/column';
import {useStore} from '../../stores';
import {RectButton} from '../../components/rect-button';
import {Box} from '../../components/box';
import {SearchIcon, StarIcon} from '../../components/icon';
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import {RectButton as NativeRectButton} from 'react-native-gesture-handler';
import {FormattedMessage, useIntl} from 'react-intl';
import {EllipsisIcon} from '../../components/icon/ellipsis.tsx';
import {MenuModal} from '../../components/modal/menu-modal.tsx';
import {StackNavProp} from '../../navigation.tsx';
import {XAxis} from '../../components/axis';
import {FavoriteUrl} from '../../stores/webpage/types.ts';

export const WebScreen: FunctionComponent = observer(() => {
  const {webpageStore} = useStore();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();
  const intl = useIntl();

  const dAppPageUrl = 'https://explore.keplr.app';
  const safeAreaInsets = useSafeAreaInsets();

  const [isOpenMenuModal, setIsOpenMenuModal] = useState(false);
  const [selectedFavoriteUrl, setSelectedFavoriteUrl] =
    useState<FavoriteUrl | null>(null);

  return (
    <PageWithScrollView
      backgroundMode="default"
      contentContainerStyle={style.get('flex-grow-1')}
      style={StyleSheet.flatten([
        style.flatten(['padding-x-20']),
        {
          marginTop: (() => {
            if (Platform.OS === 'android') {
              return safeAreaInsets.top + 40;
            }
            return safeAreaInsets.top;
          })(),
        },
      ])}>
      <Text style={style.flatten(['mobile-h3', 'color-text-high'])}>
        <FormattedMessage id="page.browser.main-title" />
      </Text>

      <Gutter size={20} />

      <TouchableWithoutFeedback
        onPress={() =>
          navigation.navigate('WebTab', {
            screen: 'Web.Search',
            params: {},
          })
        }>
        <Box
          borderRadius={8}
          style={style.flatten([
            'background-color-white',
            'padding-x-16',
            'padding-y-12',
          ])}>
          <XAxis alignY="center">
            <Text style={style.flatten(['body2', 'color-gray-300'])}>
              <FormattedMessage id="page.browser.input-placeholder" />
            </Text>

            <Box style={style.flatten(['flex-1'])} />

            <Box padding={6}>
              <SearchIcon size={15} color={style.get('color-gray-100').color} />
            </Box>
          </XAxis>
        </Box>
      </TouchableWithoutFeedback>

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
          <FormattedMessage id="page.browser.favorite-label" />
        </Text>
        <Text
          style={style.flatten([
            'subtitle2',
            'margin-right-4',
            'color-blue-400',
          ])}>
          {webpageStore.favoriteUrls.length}
        </Text>
      </Columns>
      <Gutter size={12} />

      {webpageStore.favoriteUrls.length > 0 ? (
        webpageStore.favoriteUrls.map(favoriteUrl => {
          return (
            <RectButton
              key={favoriteUrl.url}
              style={style.flatten([
                'flex-row',
                'items-center',
                'padding-16',
                'margin-bottom-8',
                'border-radius-8',
                'background-color-card-default',
              ])}
              onPress={() => {
                navigation.navigate('WebTab', {
                  screen: 'Web.WebPage',
                  params: {url: favoriteUrl.url},
                });
              }}>
              <Box marginRight={16}>
                <StarIcon
                  size={20}
                  color={style.flatten(['color-blue-300']).color}
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
                {favoriteUrl.name}
              </Text>
              <TouchableOpacity
                style={style.flatten(['padding-12'])}
                onPress={() => {
                  setSelectedFavoriteUrl(favoriteUrl);
                  setIsOpenMenuModal(true);
                }}>
                <EllipsisIcon
                  size={24}
                  color={style.get('color-gray-10').color}
                />
              </TouchableOpacity>
            </RectButton>
          );
        })
      ) : (
        <Box alignX="center">
          <Gutter size={5} />
          <StarIcon size={84} color={style.get('color-gray-400').color} />
          <Box alignX="center">
            <Text
              style={style.flatten([
                'subtitle3',
                'color-gray-400',
                'text-center',
              ])}>
              <FormattedMessage id="page.browser.favorite-empty-text-1" />
            </Text>
            <Gutter size={12} />
            <Text
              style={style.flatten([
                'subtitle3',
                'color-gray-400',
                'text-center',
              ])}>
              <FormattedMessage id="page.browser.favorite-empty-text-2" />
            </Text>
          </Box>
        </Box>
      )}

      <Gutter size={20} />

      <MenuModal
        isOpen={isOpenMenuModal}
        setIsOpen={setIsOpenMenuModal}
        modalMenuItems={[
          {
            key: 'favorite-url-edit',
            label: intl.formatMessage({
              id: 'page.browser.menu-favorite.modal.edit-item.label',
            }),
            onSelect: () => {
              if (selectedFavoriteUrl) {
                navigation.navigate('WebTab', {
                  screen: 'Web.EditFavorite',
                  params: {
                    url: selectedFavoriteUrl,
                  },
                });
              }

              setIsOpenMenuModal(false);
            },
          },
          {
            key: 'favorite-url-delete',
            label: intl.formatMessage({
              id: 'page.browser.menu-favorite.modal.delete-item.label',
            }),
            onSelect: () => {
              if (selectedFavoriteUrl && selectedFavoriteUrl.url) {
                webpageStore.removeFavoriteUrl(selectedFavoriteUrl.url);
              }
              setIsOpenMenuModal(false);
            },
          },
        ]}
      />
    </PageWithScrollView>
  );
});
