import React, {FunctionComponent, useLayoutEffect} from 'react';
import {Box} from '../../../components/box';
import {useStyle} from '../../../styles';
import {Text} from 'react-native';
import {FormattedMessage, useIntl} from 'react-intl';
import {RegisterHeader} from '../../../components/pageHeader/header-register';
import {Gutter} from '../../../components/gutter';
import {XAxis} from '../../../components/axis';
import {Button} from '../../../components/button';
import {TextButton} from '../../../components/text-button';
import {StackActions, useNavigation} from '@react-navigation/native';
import {OptionContainer} from '../components';
import {
  AppleIcon,
  GoogleIcon,
  BoltIcon,
  ShieldIcon,
} from '../../../components/icon';

const Header: FunctionComponent = () => {
  const intl = useIntl();

  return (
    <RegisterHeader
      title={intl.formatMessage({
        id: 'pages.register.intro-new-user.title',
      })}
    />
  );
};

export const RegisterIntroNewUserScreen: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => <Header />,
    });
  }, [navigation]);

  return (
    <Box paddingX={20} alignX="center">
      <Text style={style.flatten(['color-text-low', 'body1'])}>
        <FormattedMessage id="pages.register.intro-new-user.paragraph" />
      </Text>

      <Gutter size={12} />

      <OptionContainer
        title={intl.formatMessage({
          id: 'pages.register.intro-new-user.recovery-path-title',
        })}
        paragraph={intl.formatMessage({
          id: 'pages.register.intro-new-user.recovery-path-paragraph',
        })}>
        <Gutter size={20} />

        <XAxis alignY="center">
          <ShieldIcon />
          <ShieldIcon />
          <ShieldIcon />

          <Gutter size={4} />

          <Text style={style.flatten(['text-caption1', 'color-text-low'])}>
            <FormattedMessage id="pages.register.intro-new-user.high-security-text" />
          </Text>
        </XAxis>

        <Gutter size={20} />

        <Button
          text={intl.formatMessage({
            id: 'pages.register.intro-new-user.new-recovery-path-button',
          })}
          size="large"
        />

        <Gutter size={20} />

        <TextButton
          containerStyle={{height: 32}}
          text={intl.formatMessage({
            id: 'pages.register.intro-new-user.import-recovery-path-button',
          })}
          size="large"
          onPress={() => {
            navigation.dispatch(
              StackActions.replace('Register.Intro.ExistingUser'),
            );
          }}
        />
      </OptionContainer>

      <Gutter size={16} />

      <OptionContainer
        title={intl.formatMessage({
          id: 'pages.register.intro-new-user.sign-up-social-title',
        })}
        paragraph={intl.formatMessage({
          id: 'pages.register.intro-new-user.sign-up-social-paragraph',
        })}>
        <Gutter size={20} />

        <XAxis alignY="center">
          <BoltIcon />
          <BoltIcon />
          <BoltIcon />

          <Gutter size={4} />

          <Text style={style.flatten(['text-caption1', 'color-text-low'])}>
            <FormattedMessage id="pages.register.intro-new-user.more-convenience-text" />
          </Text>
        </XAxis>

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
