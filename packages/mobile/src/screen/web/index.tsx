import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useState} from 'react';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {StyleSheet, Text} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {TextInput} from '../../components/input';
import {validURL} from './util';
import {Gutter} from '../../components/gutter';
import {StackActions, useNavigation} from '@react-navigation/native';

// TODO: 디자인 반영해서 적용
export const WebScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const navigation = useNavigation();

  // const dAppPageUrl = 'https://explore.keplr.app';
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
        placeholder="Search or type URL"
        placeholderTextColor={style.flatten(['color-gray-200']).color}
        onChangeText={text => {
          setURI(text);
          setURIError('');
        }}
        onSubmitEditing={() => {
          if (validURL(uri) || uri.includes('localhost')) {
            setURIError('');
            navigation.dispatch(StackActions.push('Web', {url: uri}));
            setURI('');
          } else {
            setURIError('Invalid URL');
          }
        }}
        autoCorrect={false}
        autoCapitalize="none"
        autoComplete="off"
      />

      <Gutter size={20} />
    </PageWithScrollView>
  );
});
