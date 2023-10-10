import React, {FunctionComponent} from 'react';
import {GestureResponderEvent, Pressable} from 'react-native';

import {CheckIcon} from '../icon/check';
import {useStyle} from '../../styles';

interface CheckboxProps {
  size?: 'small' | 'large';
  onPress?: (e: GestureResponderEvent, checked: boolean) => void;
  checked: boolean;
}

export const Checkbox: FunctionComponent<CheckboxProps> = ({
  size = 'small',
  onPress,
  checked,
}) => {
  const style = useStyle();

  const boxSize = (() => {
    switch (size) {
      case 'small':
        return ['width-16', 'height-16'];
      case 'large':
        return ['width-24', 'height-24'];
    }
  })();

  const iconSize = (() => {
    switch (size) {
      case 'small':
        return 10.6;
      case 'large':
        return 16;
    }
  })();

  const backgroundColor = (() => {
    if (checked) {
      return ['background-color-blue-400'];
    }
    return ['background-color-gray-400'];
  })();

  return (
    <Pressable
      style={style.flatten(
        ['border-radius-4', 'flex-row', 'justify-center', 'items-center'],
        [...(boxSize as any), ...(backgroundColor as any)],
      )}
      onPress={e => {
        if (onPress) {
          onPress(e, !checked);
        }
      }}>
      {checked ? <CheckIcon color="white" size={iconSize} /> : null}
    </Pressable>
  );
};
