import {observer} from 'mobx-react-lite';
import React, {FunctionComponent, useState} from 'react';
import {useStore} from '../../stores';
import {Button} from '../../components/button';
import {StackActions, useNavigation} from '@react-navigation/native';
import {TextInput} from '../../components/input';
import {useSetFocusedScreen} from '../../components/page/utils';
import {Box} from '../../components/box';
import {useStyle} from '../../styles';

export const LockedScreen: FunctionComponent = observer(() => {
  const {keyRingStore} = useStore();
  const navigation = useNavigation();
  const [isFailed, setIsFailed] = useState(false);
  const [password, setPassword] = useState('');
  const style = useStyle();

  useSetFocusedScreen();
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
      <Box
        height={'100%'}
        backgroundColor={style.get('color-background-default').color}>
        <TextInput
          label="password"
          value={password}
          onChangeText={value => {
            setPassword(value);
            setIsFailed(false);
          }}
          secureTextEntry={true}
          returnKeyType="done"
          onSubmitEditing={() => {
            doUnlock();
          }}
          error={isFailed ? 'Invalid Password' : undefined}
        />
        <Button text="unlock" size="large" onPress={doUnlock} />
      </Box>
    </React.Fragment>
  );
});
