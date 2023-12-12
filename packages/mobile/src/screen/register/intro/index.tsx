import React, {FunctionComponent} from 'react';
import LottieView from 'lottie-react-native';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {Gutter} from '../../../components/gutter';
import {Text} from 'react-native';
import {FormattedMessage, useIntl} from 'react-intl';
import {Button} from '../../../components/button';
import {TextButton} from '../../../components/text-button';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ContentHeightAwareScrollView} from '../../../components/scroll-view';

export const RegisterIntroScreen: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  const safeAreaInsets = useSafeAreaInsets();

  return (
    <ContentHeightAwareScrollView
      style={{
        height: '100%',
        paddingTop: safeAreaInsets.top,
        paddingBottom: safeAreaInsets.bottom,
      }}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <LottieView
        source={require('../../../public/assets/lottie/wallet/logo.json')}
        style={{width: 200, height: 155}}
      />

      <Gutter size={10} />

      <Text style={style.flatten(['mobile-h2', 'color-white'])}>
        <FormattedMessage id="pages.register.intro-new-user.title" />
      </Text>

      <Gutter size={100} />

      <Box width="100%" paddingX={36}>
        <Button
          text={intl.formatMessage({
            id: 'pages.register.intro.create-wallet-button',
          })}
          size="large"
          onPress={() => {
            navigation.navigate('Register.Intro.NewUser');
          }}
        />

        <Gutter size={16} />

        <Button
          text={intl.formatMessage({
            id: 'pages.register.intro.import-wallet-button',
          })}
          size="large"
          color="secondary"
          onPress={() => {
            navigation.navigate('Register.Intro.ExistingUser');
          }}
        />

        <Gutter size={20} />

        <TextButton
          containerStyle={{height: 32}}
          size="large"
          text={intl.formatMessage({
            id: 'pages.register.intro.connect-hardware-wallet-button',
          })}
          onPress={() => {
            navigation.navigate('Register.Intro.ConnectHardware');
          }}
        />
      </Box>
    </ContentHeightAwareScrollView>
  );
};
