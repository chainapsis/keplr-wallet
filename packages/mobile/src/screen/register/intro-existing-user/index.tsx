import React, {FunctionComponent, useLayoutEffect} from 'react';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {Text} from 'react-native';
import {FormattedMessage, useIntl} from 'react-intl';
import {RegisterHeader} from '../../../components/pageHeader/header-register';
import {Gutter} from '../../../components/gutter';
import {Button} from '../../../components/button';
import {useNavigation} from '@react-navigation/native';
import {OptionContainer} from '../components';
import {AppleIcon, GoogleIcon} from '../../../components/icon';

const Header: FunctionComponent = () => {
  const intl = useIntl();

  return (
    <RegisterHeader
      title={intl.formatMessage({
        id: 'pages.register.intro-existing-user.title',
      })}
    />
  );
};

export const RegisterIntroExistingUserScene: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerTitle: () => <Header />,
    });
  }, [navigation]);

  return (
    <Box paddingX={20} alignX="center">
      <Text style={style.flatten(['color-text-low', 'body1'])}>
        <FormattedMessage id="pages.register.intro-existing-user.paragraph" />
      </Text>

      <Gutter size={12} />

      <OptionContainer
        title={intl.formatMessage({
          id: 'pages.register.intro-existing-user.recovery-title',
        })}
        paragraph={intl.formatMessage({
          id: 'pages.register.intro-existing-user.recovery-paragraph',
        })}>
        <Gutter size={20} />

        <Button
          text={intl.formatMessage({
            id: 'pages.register.intro-existing-user.recovery-button',
          })}
          color="secondary"
          size="large"
        />

        <Gutter size={20} />

        {/* TODO: INTL 적용하기 */}
        <Button text="Import from Keplr Extension" size="large" />
      </OptionContainer>

      <Gutter size={16} />

      <OptionContainer
        title={intl.formatMessage({
          id: 'pages.register.intro-existing-user.social-recovery-title',
        })}
        paragraph={intl.formatMessage({
          id: 'pages.register.intro-existing-user.social-recovery-paragraph',
        })}>
        <Gutter size={20} />

        <Button
          text={intl.formatMessage({
            id: 'pages.register.intro-new-user.sign-up-apple-button',
          })}
          size="large"
          color="secondary"
          leftIcon={<AppleIcon />}
        />

        <Gutter size={12} />

        <Button
          text={intl.formatMessage({
            id: 'pages.register.intro-new-user.sign-up-google-button',
          })}
          size="large"
          color="secondary"
          leftIcon={<GoogleIcon />}
        />
      </OptionContainer>
    </Box>
  );
};
