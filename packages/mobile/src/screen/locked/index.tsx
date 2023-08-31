import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useState} from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useStore} from '../../stores';
import {TextInput} from '../../components/input';
import {Button} from '../../components/button';
import {StackActions, useNavigation} from '@react-navigation/native';

export const LockedScreen: FunctionComponent = observer(() => {
  const {keyRingStore} = useStore();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [isFailed, setIsFailed] = useState(false);
  const [password, setPassword] = useState('');

  const doUnlock = async () => {
    try {
      await keyRingStore.unlock(password);
      navigation.dispatch({
        ...StackActions.replace('Home'),
      });
    } catch (error) {
      setIsFailed(true);
    }
  };

  return (
    <React.Fragment>
      <View
        style={{
          paddingTop: insets.top,
        }}>
        <TextInput
          label="password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          returnKeyType="done"
          onSubmitEditing={() => {
            doUnlock();
          }}
          error={isFailed ? 'Invalid Password' : undefined}
        />
        <Button text="unlock" size="large" onPress={doUnlock} />
      </View>
    </React.Fragment>
  );
});
