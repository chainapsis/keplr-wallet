import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../../../stores';
import {Stack} from '../../../../../components/stack';
import {PageButton} from '../../../components';
import {CheckIcon} from '../../../../../components/icon';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../../../navigation';
import {useStyle} from '../../../../../styles';
import {PageWithScrollView} from '../../../../../components/page';

export const SettingGeneralFiatScreen: FunctionComponent = observer(() => {
  const {uiConfigStore} = useStore();
  const navigate = useNavigation<StackNavProp>();
  const style = useStyle();

  return (
    <PageWithScrollView
      backgroundMode="default"
      style={style.flatten(['padding-x-12', 'padding-bottom-12'])}>
      <Stack gutter={8}>
        {Object.entries(uiConfigStore.supportedFiatCurrencies).map(
          ([fiat, fiatCurrency]) => {
            if (!fiatCurrency) {
              // Can't be happened
              return null;
            }

            return (
              <PageButton
                key={fiat}
                title={`${fiatCurrency.currency.toUpperCase()} (${
                  fiatCurrency.symbol
                })`}
                onClick={() => {
                  uiConfigStore.selectFiatCurrency(fiat);
                  navigate.reset({routes: [{name: 'Home'}]});
                }}
                endIcon={
                  fiatCurrency.currency ===
                  uiConfigStore.fiatCurrency.currency ? (
                    <CheckIcon
                      size={28}
                      color={style.get('color-text-middle').color}
                    />
                  ) : null
                }
              />
            );
          },
        )}
      </Stack>
    </PageWithScrollView>
  );
});
