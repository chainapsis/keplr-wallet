import {observer} from 'mobx-react-lite';
import React, {FunctionComponent} from 'react';
import {Text, View} from 'react-native';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {useStore} from '../../stores';

export const HomeScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const {accountStore} = useStore();
  console.log('accountStore', accountStore.hasAccount('cosmoshub-4'));
  return (
    <React.Fragment>
      <PageWithScrollView backgroundMode={'default'}>
        <View>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>

          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-white',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-red-100',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-red-100',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
          <Text
            style={style.flatten([
              'color-red-100',
              'font-extrabold',
              'font-medium',
              'h1',
            ])}>
            test
          </Text>
        </View>
      </PageWithScrollView>
    </React.Fragment>
  );
});
