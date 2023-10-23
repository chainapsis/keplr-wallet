import React, {FunctionComponent} from 'react';
import {Box} from '../box';
import {useStyle} from '../../styles';
import {Path, Svg} from 'react-native-svg';
import {IconProps} from '../icon/types';

interface ToggleProps {
  isOpen: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  disabled?: boolean;
}

export const Toggle: FunctionComponent<ToggleProps> = ({
  isOpen,
  setIsOpen,
  disabled,
}) => {
  const style = useStyle();

  return (
    <Box
      alignX={isOpen ? 'right' : 'left'}
      alignY="center"
      width={52}
      height={32}
      padding={isOpen ? 4 : 8}
      borderRadius={16}
      backgroundColor={
        disabled
          ? style.get('color-gray-500').color
          : isOpen
          ? style.get('color-blue-400').color
          : style.get('color-gray-400').color
      }
      onClick={() => (setIsOpen && !disabled ? setIsOpen(!isOpen) : null)}>
      <Box
        alignX="center"
        alignY="center"
        borderRadius={12}
        width={isOpen ? 24 : 16}
        height={isOpen ? 24 : 16}
        backgroundColor={
          disabled
            ? style.get('color-gray-300').color
            : isOpen
            ? style.get('color-white').color
            : style.get('color-gray-200').color
        }
        style={{opacity: disabled ? 0.4 : undefined}}>
        {isOpen ? (
          <CheckToggleIcon
            size={16}
            color={
              disabled
                ? style.get('color-gray-200').color
                : style.get('color-blue-400').color
            }
          />
        ) : null}
      </Box>
    </Box>
  );
};

export const CheckToggleIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9.00003 16.17L4.83003 12L3.41003 13.41L9.00003 19L21 6.99997L19.59 5.58997L9.00003 16.17Z"
        fill={color || 'currentColor'}
      />
    </Svg>
  );
};
