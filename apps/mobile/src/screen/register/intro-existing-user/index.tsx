import React, {FunctionComponent} from 'react';
import {useStyle} from '../../../styles';
import {Platform, Text} from 'react-native';
import {FormattedMessage, useIntl} from 'react-intl';
import {Gutter} from '../../../components/gutter';
import {Button} from '../../../components/button';
import {OptionContainer} from '../components';
import {AppleIcon, GoogleIcon} from '../../../components/icon';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation';
import {ScrollViewRegisterContainer} from '../components/scroll-view-register-container';
import {
  isAppleSignInEnabled,
  isGoogleSignInEnabled,
} from 'keplr-wallet-mobile-private';

export const RegisterIntroExistingUserScene: FunctionComponent = () => {
  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  return (
    <ScrollViewRegisterContainer
      padding={20}
      contentContainerStyle={{
        alignItems: 'center',
      }}>
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
          onPress={() => {
            navigation.navigate('Register.RecoverMnemonic');
          }}
        />

        <Gutter size={20} />

        <Button
          text={intl.formatMessage({
            id: 'pages.register.intro-existing-user.import-from-keplr-extension-button',
          })}
          size="large"
          onPress={() => {
            navigation.navigate('Register.ImportFromExtension');
          }}
        />
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

        {Platform.OS === 'ios' ? (
          <React.Fragment>
            <Button
              text={intl.formatMessage({
                id: 'pages.register.intro-new-user.sign-up-apple-button',
              })}
              size="large"
              color="secondary"
              leftIcon={<AppleIcon />}
              disabled={!isAppleSignInEnabled}
              onPress={() => {
                navigation.navigate('Register.AppleSignIn', {});
              }}
            />

            <Gutter size={12} />
          </React.Fragment>
        ) : null}

        <Button
          text={intl.formatMessage({
            id: 'pages.register.intro-new-user.sign-up-google-button',
          })}
          size="large"
          color="secondary"
          leftIcon={<GoogleIcon />}
          disabled={!isGoogleSignInEnabled}
          onPress={() => {
            navigation.navigate('Register.GoogleSignIn', {});
          }}
        />
      </OptionContainer>

      <Gutter size={16} />
    </ScrollViewRegisterContainer>
  );
};
