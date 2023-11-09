import React, {FunctionComponent} from 'react';
import {Box} from '../../../../components/box';
import {Stack} from '../../../../components/stack';
import {PageButton} from '../../components';
import {useIntl} from 'react-intl';
import {useLanguage} from '../../../../languages';
import {ArrowRightIcon} from '../../../../components/icon/arrow-right';
import {useStyle} from '../../../../styles';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../../navigation';
import {useStore} from '../../../../stores';
import {observer} from 'mobx-react-lite';

export const SettingGeneralScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const language = useLanguage();
  const style = useStyle();
  const navigate = useNavigation<StackNavProp>();
  const {uiConfigStore} = useStore();

  return (
    <React.Fragment>
      <Box padding={12} paddingTop={0}>
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
            onClick={() =>
              navigate.navigate('Setting.General.ManageChainVisibility')
            }
          />
        </Stack>
      </Box>
    </React.Fragment>
  );
});
