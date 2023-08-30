import {observer} from 'mobx-react-lite';
import React, {FunctionComponent} from 'react';
import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useStyle} from '../../styles';
import {TextInput} from '../../components/input/input';
import {Button} from '../../components/button';
export const RegisterScreen: FunctionComponent = observer(() => {
  const insets = useSafeAreaInsets();

  const style = useStyle();
  return (
    <React.Fragment>
      <View
        style={{
          paddingTop: insets.top,
        }}>
        <TextInput
          label="Mnemonic seed"
          multiline={true}
          numberOfLines={4}
          style={
            (style.flatten(['h6', 'color-text-middle']),
            {
              minHeight: 20 * 4,
              textAlignVertical: 'top',
            })
          }
        />
        <View
          style={style.flatten([
            'height-button-default',
            'border-radius-8',
            'background-color-blue-400',
          ])}>
          <Button text="Next" size="large" />
        </View>
      </View>
    </React.Fragment>
  );
});
