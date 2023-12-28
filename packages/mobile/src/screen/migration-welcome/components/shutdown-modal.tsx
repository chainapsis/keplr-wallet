import {observer} from 'mobx-react-lite';
import React, {useState} from 'react';
import {registerCardModal} from '../../../components/modal/card';
import {Box} from '../../../components/box';
import {BaseModalHeader} from '../../../components/modal';
import {FormattedMessage, useIntl} from 'react-intl';
import {Gutter} from '../../../components/gutter';
import {Text} from 'react-native';
import {useStyle} from '../../../styles';
import {useEffectOnce} from '../../../hooks';
import RNExitApp from 'react-native-exit-app';

export const ShutDownModal = registerCardModal(
  observer<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }>(({}) => {
    const [timeLeft, setTimeLeft] = useState(5);

    useEffectOnce(() => {
      const timer = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);

      const timeout = setTimeout(() => {
        // setIsOpen(false);
        RNExitApp.exitApp();
      }, 5000);

      return () => {
        clearInterval(timer);
        clearTimeout(timeout);
      };
    });

    const intl = useIntl();
    const style = useStyle();

    return (
      <Box paddingX={12} paddingBottom={28}>
        <Gutter size={28} />
        <BaseModalHeader
          title={intl.formatMessage({
            id: 'page.migration.welcome.shutdown-modal.title',
          })}
        />
        <Gutter size={4} />

        <Text
          style={style.flatten([
            'body2',
            'color-text-low',
            'padding-y-8',
            'text-center',
          ])}>
          <FormattedMessage
            id="page.migration.welcome.shutdown-modal.paragraph"
            values={{seconds: `${timeLeft}s`}}
          />
        </Text>
      </Box>
    );
  }),
);
