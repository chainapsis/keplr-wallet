import React, {FunctionComponent} from 'react';
import {Box} from '../../../../components/box';
import {Stack} from '../../../../components/stack';
import {PageButton} from '../../components';
import {useIntl} from 'react-intl';
import {ArrowRightIcon} from '../../../../components/icon/arrow-right';
import {useStyle} from '../../../../styles';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../../navigation';
import {observer} from 'mobx-react-lite';
import {Toggle} from '../../../../components/toggle';
import {useStore} from '../../../../stores';

export const SettingSecurityAndPrivacyScreen: FunctionComponent = observer(
  () => {
    const intl = useIntl();
    const style = useStyle();
    const navigate = useNavigation<StackNavProp>();
    const {keychainStore} = useStore();

    return (
      <React.Fragment>
        <Box padding={12} paddingTop={0}>
          <Stack gutter={8}>
            <PageButton
              title={intl.formatMessage({
                id: 'page.setting.security.connected-websites-title',
              })}
              paragraph={intl.formatMessage({
                id: 'page.setting.security.connected-websites-paragraph',
              })}
              endIcon={
                <ArrowRightIcon
                  size={24}
                  color={style.get('color-text-low').color}
                />
              }
              onClick={() =>
                navigate.navigate('Setting.SecurityAndPrivacy.Permission')
              }
            />

            <PageButton
              title={intl.formatMessage({
                id: 'page.setting.security.change-password-title',
              })}
              endIcon={
                <ArrowRightIcon
                  size={24}
                  color={style.get('color-text-low').color}
                />
              }
              onClick={() =>
                navigate.navigate('Setting.SecurityAndPrivacy.ChangePassword')
              }
            />

            <PageButton
              title={intl.formatMessage({
                id: 'page.setting.security.bio-authentication-title',
              })}
              endIcon={
                <Box marginLeft={8}>
                  <Toggle
                    isOpen={keychainStore.isBiometryOn}
                    setIsOpen={async () => {
                      if (!keychainStore.isBiometryOn) {
                        navigate.navigate(
                          'Setting.SecurityAndPrivacy.BioAuthentication',
                        );
                        return;
                      }

                      try {
                        await keychainStore.turnOffBiometry();
                      } catch (error) {
                        navigate.navigate(
                          'Setting.SecurityAndPrivacy.BioAuthentication',
                        );
                      }
                    }}
                  />
                </Box>
              }
            />
            <PageButton
              title={intl.formatMessage({
                id: 'page.setting.security.analytics-title',
              })}
              paragraph={intl.formatMessage({
                id: 'page.setting.security.analytics-paragraph',
              })}
              endIcon={
                <Box marginLeft={8}>
                  {/* TODO analytics추가후 설정 해야함 */}
                  <Toggle
                    isOpen={false}
                    // isOpen={!disableAnalytics}
                    setIsOpen={() => {
                      // const disableAnalytics =
                      //   localStorage.getItem('disable-analytics') === 'true';
                      // new InExtensionMessageRequester()
                      //   .sendMessage(
                      //     BACKGROUND_PORT,
                      //     new SetDisableAnalyticsMsg(!disableAnalytics),
                      //   )
                      //   .then(analyticsDisabled => {
                      //     localStorage.setItem(
                      //       'disable-analytics',
                      //       analyticsDisabled ? 'true' : 'false',
                      //     );
                      //     setDisableAnalytics(analyticsDisabled);
                      //   });
                    }}
                  />
                </Box>
              }
            />
          </Stack>
        </Box>
      </React.Fragment>
    );
  },
);
