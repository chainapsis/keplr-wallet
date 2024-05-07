import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {Path, Svg} from 'react-native-svg';

export const UserIcon: FunctionComponent<IconProps> = ({size, color}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.143 6.85684C8.143 4.7266 9.8699 2.99969 12.0001 2.99969C14.1304 2.99969 15.8573 4.7266 15.8573 6.85684C15.8573 8.98708 14.1304 10.714 12.0001 10.714C9.8699 10.714 8.143 8.98708 8.143 6.85684Z"
        fill={color || 'currentColor'}
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.92978 18.9471C4.99608 15.0988 8.13613 11.9997 12.0001 11.9997C15.8643 11.9997 19.0044 15.0989 19.0705 18.9474C19.0749 19.2026 18.9279 19.4363 18.6959 19.5427C16.6568 20.4784 14.3886 20.9997 12.0004 20.9997C9.61202 20.9997 7.34366 20.4783 5.30442 19.5425C5.07242 19.436 4.92539 19.2023 4.92978 18.9471Z"
        fill={color || 'currentColor'}
      />
    </Svg>
  );
};
