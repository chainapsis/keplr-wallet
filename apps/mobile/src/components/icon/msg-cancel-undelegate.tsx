import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {ClipPath, Defs, G, Path, Rect, Svg} from 'react-native-svg';

export const MessageCancelUndelegateIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <G clipPath="url(#clip0_95_1759)">
        <Path
          d="M14.25 14.25L17.75 17.75M17.75 14.25L14.25 17.75M23 16C23 19.866 19.866 23 16 23C12.134 23 9 19.866 9 16C9 12.134 12.134 9 16 9C19.866 9 23 12.134 23 16Z"
          stroke={color || 'currentColor'}
        />
      </G>

      <Defs>
        <ClipPath id="clip0_95_1759">
          <Rect
            width="16"
            height="16"
            fill="white"
            transform="translate(8 8)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
