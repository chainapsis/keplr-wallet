import React, {FunctionComponent} from 'react';
import {Box} from '../../../../components/box';
import {Stack} from '../../../../components/stack';
import {PageButton} from '../../components';
import {useIntl} from 'react-intl';
import {ArrowRightIcon} from '../../../../components/icon/arrow-right';
import {useStyle} from '../../../../styles';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../../navigation';
import {useStore} from '../../../../stores';
import {observer} from 'mobx-react-lite';
import {useLanguage} from '../../../../languages';
import {Toggle} from '../../../../components/toggle';

export const SettingGeneralScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const navigate = useNavigation<StackNavProp>();
  const language = useLanguage();
  const {uiConfigStore, keyRingStore} = useStore();

  return (
    <React.Fragment>
      <Box paddingX={12} paddingY={8}>
        <Stack gutter={8}>
          <PageButton
            title={intl.formatMessage({
              id: 'page.setting.general.language-title',
            })}
            paragraph={language.languageFullName}
            endIcon={
              <ArrowRightIcon
                size={24}
                color={style.get('color-text-low').color}
              />
            }
            onClick={() => navigate.navigate('Setting.General.Lang')}
          />

          <PageButton
            title={intl.formatMessage({
              id: 'page.setting.general.currency-title',
            })}
            paragraph={(() => {
              return uiConfigStore.fiatCurrency.currency.toUpperCase();
            })()}
            endIcon={
              <ArrowRightIcon
                size={24}
                color={style.get('color-text-low').color}
              />
            }
            onClick={() => navigate.navigate('Setting.General.Currency')}
          />

          <PageButton
            title={intl.formatMessage({
              id: 'page.setting.general.contacts-title',
            })}
            endIcon={
              <ArrowRightIcon
                size={24}
                color={style.get('color-text-low').color}
              />
            }
            onClick={() => navigate.navigate('Setting.General.ContactList')}
          />

          <PageButton
            title={intl.formatMessage({
              id: 'page.setting.general.show-24h-price-changes-title',
            })}
            paragraph={intl.formatMessage({
              id: 'page.setting.general.show-24h-price-changes-paragraph',
            })}
            endIcon={
              <Toggle
                isOpen={uiConfigStore.show24HChangesInMagePage}
                setIsOpen={() => uiConfigStore.toggleShow24HChangesInMagePage()}
              />
            }
          />

          <PageButton
            title={intl.formatMessage({
              id: 'page.setting.general.manage-non-native-chains-title',
            })}
            paragraph={intl.formatMessage({
              id: 'page.setting.general.manage-non-native-chains-paragraph',
            })}
            endIcon={
              <ArrowRightIcon
                size={24}
                color={style.get('color-text-low').color}
              />
            }
            onClick={() =>
              navigate.navigate('Setting.General.ManageNonActiveChains')
            }
          />

          <PageButton
            title={intl.formatMessage({
              id: 'page.setting.general.manage-chain-visibility-title',
            })}
            paragraph={intl.formatMessage({
              id: 'page.setting.general.manage-chain-visibility-paragraph',
            })}
            endIcon={
              <ArrowRightIcon
                size={24}
                color={style.get('color-text-low').color}
              />
            }
            onClick={() => {
              if (keyRingStore.selectedKeyInfo?.id) {
                navigate.navigate('Register.EnableChain', {
                  vaultId: keyRingStore.selectedKeyInfo?.id,
                  skipWelcome: true,
                  hideBackButton: false,
                });
              }
            }}
          />
          <PageButton
            title={intl.formatMessage({
              id: 'page.setting.general.version-title',
            })}
            endIcon={
              <ArrowRightIcon
                size={24}
                color={style.get('color-text-low').color}
              />
            }
            onClick={() => {
              navigate.navigate('Setting.General.Version');
            }}
          />
        </Stack>
      </Box>
    </React.Fragment>
  );
});
