import {observer} from 'mobx-react-lite';
import React, {FunctionComponent} from 'react';
import {Button, TextInput, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const LockedScreen: FunctionComponent = observer(() => {
  const insets = useSafeAreaInsets();

  return (
    <React.Fragment>
      <View
        style={{
          paddingTop: insets.top,
        }}>
        <TextInput />
        <Button title="test" />
      </View>
    </React.Fragment>
  );
});
