import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import {
  useNavigation,
  StackActions,
  DrawerActions,
} from '@react-navigation/native';
import {Pressable, Text} from 'react-native';
import {useStyle} from '../../styles';
import {Box} from '../box';

import {Stack} from '../stack';
import {useStore} from '../../stores';

export const DrawerContent: FunctionComponent = observer(() => {
  const {keyRingStore} = useStore();
  const navigation = useNavigation();

  const style = useStyle();

  const handleLock = () => {
    keyRingStore.lock();
    drawerClose();
    navigation.dispatch(StackActions.replace('Locked'));
  };

  const drawerClose = () => {
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  return (
    <DrawerContentScrollView
      contentContainerStyle={[
        style.flatten([
          'height-full',
          'flex-column',
          'justify-between',
          'padding-x-20',
        ]),
      ]}
      style={{
        paddingTop: 58,
        paddingBottom: 58,
        paddingLeft: 20,
      }}>
      <Stack gutter={32}>
        <Pressable>
          <Text style={style.flatten(['h3', 'color-white'])}>
            Manage Chain Visibility
          </Text>
        </Pressable>
        <Box
          width={40}
          height={1}
          backgroundColor={style.get('color-gray-400').color}
        />
        <Stack gutter={36}>
          <Pressable>
            <Text style={style.flatten(['h3', 'color-white'])}>Contacts</Text>
          </Pressable>
          <Pressable>
            <Text style={style.flatten(['h3', 'color-white'])}>Add Token</Text>
          </Pressable>
        </Stack>
      </Stack>
      <Stack gutter={32}>
        <Pressable>
          <Text
            style={style.flatten(['h3', 'color-white'])}
            onPress={handleLock}>
            Lock Wallet
          </Text>
        </Pressable>
        <Box
          width={40}
          height={1}
          backgroundColor={style.get('color-gray-400').color}
        />
        <Stack gutter={36}>
          <Pressable>
            <Text style={style.flatten(['h3', 'color-white'])}>
              Add More Chains
            </Text>
          </Pressable>
        </Stack>
      </Stack>
    </DrawerContentScrollView>
  );
});
