import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {ScrollViewRegisterContainer} from '../components/scroll-view-register-container';
import {Image, Text, View} from 'react-native';
import {Box} from '../../../components/box';
import {Gutter} from '../../../components/gutter';
import {useStyle} from '../../../styles';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation';

export const ImportFromExtensionScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  return (
    <ScrollViewRegisterContainer
      paddingLeft={12}
      paddingRight={12}
      contentContainerStyle={{
        flexGrow: 1,
      }}
      bottomButton={{
        text: 'Next',
        size: 'large',
        onPress: () => {
          navigation.navigate({
            name: 'Camera',
            params: {
              importFromExtensionOnly: true,
            },
          });
        },
      }}>
      <View
        style={{
          flex: 4,
        }}
      />
      <Box alignX="center">
        <Image
          source={require('../../../public/assets/img/register/import-from-extension.png')}
          style={{
            height: 242,
            aspectRatio: 1,
          }}
        />
        <Gutter size={22} />
        <Text style={style.flatten(['h4', 'color-text-high', 'text-center'])}>
          Scan QR code to connect
        </Text>
        <Gutter size={22} />
        <Text style={style.flatten(['body1', 'color-text-low', 'text-center'])}>
          Link your Keplr Extension wallet by going to 'Settings {`>`} General{' '}
          {`>`} Link Keplr Mobile' on Extension and scan the QR code.
        </Text>
      </Box>
      <View
        style={{
          flex: 5,
        }}
      />
    </ScrollViewRegisterContainer>
  );
});
