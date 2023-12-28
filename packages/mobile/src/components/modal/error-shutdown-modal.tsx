import {observer} from 'mobx-react-lite';
import React, {useState} from 'react';

import {FormattedMessage, useIntl} from 'react-intl';
import {Text} from 'react-native';
import RNExitApp from 'react-native-exit-app';
import {registerCardModal} from './card';
import {useEffectOnce} from '../../hooks';
import {useStyle} from '../../styles';
import {Box} from '../box';
import {Gutter} from '../gutter';
import {BaseModalHeader} from './modal';

export const ErrorShutDownModal = registerCardModal(
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
      <Box paddingX={12} paddingBottom={55}>
        <Gutter size={28} />
        <BaseModalHeader
          title={intl.formatMessage(
            {
              id: 'page.error-boundary.shutdown-modal.title',
            },
            {seconds: `${timeLeft}s`},
          )}
        />
        <Gutter size={20} />

        <Text
          style={style.flatten([
            'body2',
            'color-text-low',
            'padding-x-16',
            'text-center',
          ])}>
          <FormattedMessage id="page.error-boundary.shutdown-modal.paragraph" />
        </Text>
      </Box>
    );
  }),
);
