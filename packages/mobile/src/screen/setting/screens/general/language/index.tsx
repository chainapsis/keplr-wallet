import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';

import {useIntl} from 'react-intl';
import {useLanguage} from '../../../../../languages';
import {useNavigation} from '@react-navigation/native';
import {Box} from '../../../../../components/box';
import {Stack} from '../../../../../components/stack';
import {PageButton} from '../../../components';
import {CheckIcon} from '../../../../../components/icon';
import {useStyle} from '../../../../../styles';

export const SettingGeneralLanguageScreen: FunctionComponent = observer(() => {
  const language = useLanguage();
  const navigate = useNavigation();
  const intl = useIntl();
  const style = useStyle();

  return (
    <Box paddingX={12} paddingBottom={12}>
      <Stack gutter={8}>
        <PageButton
          title={intl.formatMessage({
            id: 'page.setting.general.language.automatic-title',
          })}
          endIcon={
            language.automatic ? (
              <CheckIcon
                size={20}
                color={style.get('color-text-middle').color}
              />
            ) : null
          }
          onClick={() => {
            language.clearLanguage();
            navigate.goBack();
          }}
        />
        <PageButton
          title={language.getLanguageFullName('en')}
          endIcon={
            !language.automatic && language.language === 'en' ? (
              <CheckIcon
                size={20}
                color={style.get('color-text-middle').color}
              />
            ) : null
          }
          onClick={() => {
            language.setLanguage('en');
            navigate.goBack();
          }}
        />
        <PageButton
          title={language.getLanguageFullName('ko')}
          endIcon={
            !language.automatic && language.language === 'ko' ? (
              <CheckIcon
                size={20}
                color={style.get('color-text-middle').color}
              />
            ) : null
          }
          onClick={() => {
            language.setLanguage('ko');
            navigate.goBack();
          }}
        />
      </Stack>
    </Box>
  );
});
