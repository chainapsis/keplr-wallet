import {useNavigation} from '@react-navigation/native';
import React, {FunctionComponent} from 'react';
import {Button, Text, View} from 'react-native';
import {StackNavProp} from '../../navigation';
import {PageWithScrollView} from '../../components/page';

export const SettingScreen: FunctionComponent = () => {
  const nav = useNavigation<StackNavProp>();
  return (
    <PageWithScrollView backgroundMode={'default'}>
      <View>
        <Text>setting</Text>
        <Button
          title="General"
          onPress={() => nav.navigate('Setting.General')}
        />
      </View>
    </PageWithScrollView>
  );
};
