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
import {RestartModal} from './components/restart-modal';

export const MigrationWelcomeScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);

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

      <Box alignX="center" paddingX={45}>
        <Text style={style.flatten(['mobile-h3', 'color-text-high'])}>
          <FormattedMessage id="page.migration.welcome.title" />
        </Text>
      </Box>

      <Gutter size={20} />

      <Box paddingX={41}>
        <Text style={style.flatten(['body1', 'color-text-low', 'text-center'])}>
          <FormattedMessage id="page.migration.welcome.sub-title" />
        </Text>
      </Box>

      <Gutter size={30} />

      <Gutter size={30} />

      <Box style={style.flatten(['padding-x-50'])}>
        <Button
          text={intl.formatMessage({
            id: 'page.migration.welcome.restart-button',
          })}
          size="large"
          onPress={() => {
            setIsRestartModalOpen(true);
          }}
        />
      </Box>

      <Gutter size={20} />
      <RestartModal isOpen={isRestartModalOpen} setIsOpen={() => {}} />
    </ScrollViewRegisterContainer>
  );
});
