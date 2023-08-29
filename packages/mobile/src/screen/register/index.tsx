import {observer} from 'mobx-react-lite';
import React, {FunctionComponent} from 'react';
import {Button, TextInput, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useStyle} from '../../styles';

export const RegisterScreen: FunctionComponent = observer(() => {
  const insets = useSafeAreaInsets();

  const style = useStyle();
  return (
    <React.Fragment>
      <View
        style={{
          paddingTop: insets.top,
        }}>
        <TextInput style={style.flatten(['color-text-high@5%'])} />
        <Button title="test" />
      </View>
    </React.Fragment>
  );
});
