import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {registerCardModal} from './card';
import {Box} from '../box';
import {useStyle} from '../../styles';
import {Text, View} from 'react-native';
import {RectButton} from '../rect-button';
import {XAxis} from '../axis';

export interface SelectItem {
  key: string;
  title: string;
  selected: boolean;
  onSelect: () => any;
}
export const SelectItemModal = registerCardModal(
  observer<{
    items: SelectItem[];
  }>(({items}) => {
    return (
      <Box>
        {items.map(item => (
          <SelectOption
            key={item.key}
            title={item.title}
            selected={item.selected}
            onPress={() => {
              item.onSelect();
            }}
          />
        ))}
      </Box>
    );
  }),
  {
    isDetached: true,
  },
);
const SelectOption: FunctionComponent<{
  title: string;
  selected: boolean;
  onPress?: () => void;
}> = ({title, selected, onPress}) => {
  const style = useStyle();
  return (
    <RectButton
      style={style.flatten(['padding-x-24', 'padding-y-20'])}
      onPress={onPress}>
      <XAxis alignY="center">
        <Text style={style.flatten(['body1', 'color-text-high', 'flex-1'])}>
          {title}
        </Text>

        <OptionToggle selected={selected} />
      </XAxis>
    </RectButton>
  );
};

const OptionToggle: FunctionComponent<{selected: boolean}> = ({selected}) => {
  const style = useStyle();

  if (selected) {
    return (
      <View
        style={style.flatten([
          'width-24',
          'height-24',
          'border-radius-32',
          'background-color-blue-400',
          'items-center',
          'justify-center',
        ])}>
        <View
          style={style.flatten([
            'width-12',
            'height-12',
            'border-radius-32',
            'background-color-white',
          ])}
        />
      </View>
    );
  }

  return (
    <View
      style={style.flatten([
        'width-24',
        'height-24',
        'border-radius-32',
        'border-width-1',
        'border-color-gray-400',
      ])}
    />
  );
};
