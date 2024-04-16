import React from 'react';
import {registerCardModal} from '../../../../components/modal/card';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../../components/box';
import {Text} from 'react-native';
import {useStyle} from '../../../../styles';
import {Gutter} from '../../../../components/gutter';
import {Button} from '../../../../components/button';
import {XAxis, YAxis} from '../../../../components/axis';
import {Toggle} from '../../../../components/toggle';
import {TextInput} from '../../../../components/input';
import {HorizontalRadioGroup} from '../../../../components/radio-group';
import {useStore} from '../../../../stores';
import {FormattedMessage, useIntl} from 'react-intl';
import {VerticalCollapseTransition} from '../../../../components/transition';

const selectables = ['0.1', '0.5', '1.0'];

export const SlippageModal = registerCardModal<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>(
  observer(({setIsOpen}) => {
    const intl = useIntl();
    const style = useStyle();

    const {uiConfigStore} = useStore();

    return (
      <Box padding={12}>
        <Text style={style.flatten(['h4', 'color-text-high'])}>
          <FormattedMessage id="page.ibc-swap.components.slippage-modal.title" />
        </Text>

        <Gutter size={24} />

        <Text style={style.flatten(['subtitle3', 'color-gray-100'])}>
          <FormattedMessage id="page.ibc-swap.components.slippage-modal.label.slippage-tolerance" />
        </Text>

        <Gutter size={12} />

        <YAxis alignX="left">
          <HorizontalRadioGroup
            items={selectables.map(selectable => ({
              key: selectable,
              text: selectable + '%',
            }))}
            selectedKey={
              uiConfigStore.ibcSwapConfig.slippageIsCustom
                ? 'null'
                : uiConfigStore.ibcSwapConfig.slippage
            }
            itemMinWidth={85}
            onSelect={key => {
              uiConfigStore.ibcSwapConfig.setSlippage(key);
              uiConfigStore.ibcSwapConfig.setSlippageIsCustom(false);
            }}
          />
        </YAxis>

        <Gutter size={24} />

        <XAxis alignY="center">
          <Text style={style.flatten(['subtitle3', 'color-gray-100'])}>
            <FormattedMessage id="page.ibc-swap.components.slippage-modal.label.slippage-custom" />
          </Text>

          <Gutter size={8} />

          <Toggle
            isOpen={uiConfigStore.ibcSwapConfig.slippageIsCustom}
            setIsOpen={value => {
              uiConfigStore.ibcSwapConfig.setSlippageIsCustom(value);

              if (!value) {
                const selectableNums = selectables.map(s => parseFloat(s));
                const i = selectableNums.indexOf(
                  uiConfigStore.ibcSwapConfig.slippageNum,
                );
                if (i >= 0) {
                  uiConfigStore.ibcSwapConfig.setSlippage(selectables[i]);
                } else {
                  uiConfigStore.ibcSwapConfig.setSlippage(
                    selectables[Math.floor(selectables.length / 2)],
                  );
                }
              }
            }}
          />
        </XAxis>

        <VerticalCollapseTransition
          collapsed={!uiConfigStore.ibcSwapConfig.slippageIsCustom}>
          <React.Fragment>
            <Gutter size={6} />

            <TextInput
              keyboardType="numeric"
              errorBorder={!uiConfigStore.ibcSwapConfig.slippageIsValid}
              value={uiConfigStore.ibcSwapConfig.slippage}
              right={
                <Text style={style.flatten(['body2', 'color-gray-300'])}>
                  %
                </Text>
              }
              onChangeText={text => {
                let value = text;

                if (value === '') {
                  uiConfigStore.ibcSwapConfig.setSlippage('');
                  return;
                }

                if (value.startsWith('.')) {
                  value = '0' + value;
                }
                const num = parseFloat(value);
                if (!Number.isNaN(num) && num >= 0) {
                  uiConfigStore.ibcSwapConfig.setSlippage(value);
                }
              }}
            />
          </React.Fragment>
        </VerticalCollapseTransition>

        <Gutter size={12} />

        <Button
          text={intl.formatMessage({id: 'button.close'})}
          size="large"
          color="secondary"
          onPress={() => setIsOpen(false)}
        />
      </Box>
    );
  }),
);
