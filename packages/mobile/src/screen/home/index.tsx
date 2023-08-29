import {observer} from 'mobx-react-lite';
import React, {FunctionComponent} from 'react';
import {Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export const HomeScreen: FunctionComponent = observer(() => {
  const insets = useSafeAreaInsets();

  return (
    <React.Fragment>
      <View
        style={{
          paddingTop: insets.top,
        }}>
        <Text />
      </View>
    </React.Fragment>
  );
});
