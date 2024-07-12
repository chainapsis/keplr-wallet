import React, {FunctionComponent} from 'react';
import {IconProps} from './types';
import {ClipPath, Defs, G, Path, Rect, Svg} from 'react-native-svg';

export const MessageVoteIcon: FunctionComponent<IconProps> = ({
  size,
  color,
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <G clipPath="url(#clip0_95_1637)">
        <Path
          d="M12.9107 12.8651L11.1434 13.874C10.6539 14.1535 10.6539 14.8593 11.1434 15.1387L15.0811 17.3868C15.6196 17.6942 16.2804 17.6942 16.8189 17.3868L20.7566 15.1387C21.2461 14.8593 21.2461 14.1535 20.7566 13.874L18.7827 12.7471"
          stroke={color || 'currentColor'}
        />

        <Path
          d="M10.8537 14.835V20.0038C10.8537 20.322 11.0261 20.6151 11.3042 20.7697L15.0994 22.8792C15.6284 23.1732 16.2717 23.1735 16.8009 22.8799L20.0592 21.0723"
          stroke={color || 'currentColor'}
          strokeLinecap="round"
        />

        <Path
          d="M19.4239 8.92963C19.6377 9.10449 19.6692 9.4195 19.4943 9.63323L16.274 13.8166C16.1803 13.9311 16.0407 13.9983 15.8927 14C15.7448 14.0017 15.6037 13.9377 15.5074 13.8254L13.0537 11C12.874 10.7903 12.8983 10.4747 13.1079 10.295C13.3176 10.1153 13.6332 10.1396 13.813 10.3492L15.8781 12.7213L18.7203 8.99999C18.8952 8.78626 19.2102 8.75476 19.4239 8.92963Z"
          fill={color || 'currentColor'}
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </G>

      <Defs>
        <ClipPath id="clip0_95_1637">
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
