import React, {FunctionComponent, useState} from 'react';
import {observer} from 'mobx-react-lite';
import LottieView from 'lottie-react-native';
import {Text} from 'react-native';
import {useStyle} from '../../styles';
import {ScrollViewRegisterContainer} from '../register/components/scroll-view-register-container';
import {Box} from '../../components/box';
import {Gutter} from '../../components/gutter';
import {Button} from '../../components/button';
import {FormattedMessage, useIntl} from 'react-intl';
import {ShutDownModal} from './components/shutdown-modal';

export const MigrationWelcomeScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const [isShutdownModalOpen, setIsShutDownModalOpen] = useState(false);

  return (
    <ScrollViewRegisterContainer
      forceEnableTopSafeArea={true}
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: 'center',
      }}>
      <Box borderRadius={40} style={{overflow: 'hidden'}} alignX="center">
        <LottieView
          source={require('../../public/assets/lottie/register/congrats.json')}
          style={{width: 300, height: 300}}
          autoPlay
          loop
        />
      </Box>

      <Gutter size={30} />

      <Box alignX="center">
        <Text style={style.flatten(['mobile-h3', 'color-text-high'])}>
          <FormattedMessage id="page.migration.welcome.title" />
        </Text>
      </Box>

      <Gutter size={20} />

      <Box paddingX={50}>
        <Text
          style={style.flatten([
            'body1',
            'color-text-low',
            'padding-10',
            'text-center',
          ])}>
          <FormattedMessage id="page.migration.welcome.sub-title" />
        </Text>
      </Box>

      <Gutter size={30} />

      <Gutter size={30} />

      <Box style={style.flatten(['padding-x-50'])}>
        <Button
          text={intl.formatMessage({
            id: 'page.migration.welcome.shutdown-button',
          })}
          size="large"
          onPress={() => {
            setIsShutDownModalOpen(true);
          }}
        />
      </Box>

      <Gutter size={20} />
      <ShutDownModal isOpen={isShutdownModalOpen} setIsOpen={() => {}} />
    </ScrollViewRegisterContainer>
  );
});
