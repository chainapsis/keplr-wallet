import React from 'react';
import {registerCardModal} from '../../../../components/modal/card';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../../components/box';
import {Text} from 'react-native';
import {useStyle} from '../../../../styles';
import {Gutter} from '../../../../components/gutter';
import {Button} from '../../../../components/button';
import {LayeredHorizontalRadioGroup} from '../../../../components/radio-group';
import {XAxis, YAxis} from '../../../../components/axis';
import {Toggle} from '../../../../components/toggle';
import {TextInput} from '../../../../components/input';

const selectables = ['0.1', '0.5', '1.0'];

export const SlippageModal = registerCardModal<{
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}>(
  observer(() => {
    const style = useStyle();

    return (
      <Box padding={12}>
        <Text style={style.flatten(['h4', 'color-text-high'])}>Settings</Text>

        <Gutter size={24} />

        <Text style={style.flatten(['subtitle3', 'color-gray-100'])}>
          Slippage Tolerance
        </Text>

        <Gutter size={12} />

        <YAxis alignX="left">
          <LayeredHorizontalRadioGroup
            selectedKey={'0.1'}
            items={selectables.map(selectable => ({
              key: selectable,
              text: selectable + '%',
            }))}
            onSelect={key => {
              console.log(key);
            }}
            style={style.flatten(['background-color-gray-700'])}
            itemMinWidth={85}
            isModal={true}
          />
        </YAxis>

        <Gutter size={24} />

        <XAxis alignY="center">
          <Text style={style.flatten(['subtitle3', 'color-gray-100'])}>
            Custom Slippage
          </Text>

          <Gutter size={8} />

          <Toggle isOpen={true} />
        </XAxis>

        <Gutter size={6} />

        <TextInput
          right={
            <Text style={style.flatten(['body2', 'color-gray-300'])}>%</Text>
          }
        />

        <Gutter size={12} />

        <Button text="Confirm" size="large" color="secondary" />
      </Box>
    );
  }),
);
