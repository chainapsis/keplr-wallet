import React, {FunctionComponent} from 'react';
import LottieView from 'lottie-react-native';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {Gutter} from '../../../components/gutter';
import {Text} from 'react-native';
import {FormattedMessage, useIntl} from 'react-intl';
import {Button} from '../../../components/button';
import {TextButton} from '../../../components/text-button';

export const RegisterIntroScreen: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();

  return (
    <Box height="100%" alignY="center" alignX="center">
      <LottieView
        source={require('../../../public/assets/lottie/wallet/logo.json')}
        loop
        autoPlay
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
        />

        <Gutter size={16} />

        <Button
          text={intl.formatMessage({
            id: 'pages.register.intro.import-wallet-button',
          })}
          size="large"
          color="secondary"
        />

        <Gutter size={20} />

        <TextButton
          containerStyle={{height: 32}}
          size="large"
          text={intl.formatMessage({
            id: 'pages.register.intro.connect-hardware-wallet-button',
          })}
        />
      </Box>
    </Box>
  );
};
