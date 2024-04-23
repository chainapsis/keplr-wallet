import React, {FunctionComponent} from 'react';
import {ClipPath, Defs, G, Path, Rect, Svg} from 'react-native-svg';

export const VoteIcon: FunctionComponent = () => {
  return (
    <Svg width="18" height="19" viewBox="0 0 18 19" fill="none">
      <G clip-path="url(#clip0_10097_40127)">
        <Rect x="2" y="5.14893" width="13" height="11" rx="2" fill="#FEFEFE" />
        <Rect
          x="9.10938"
          y="1"
          width="5.39721"
          height="7.66871"
          rx="1.10608"
          transform="rotate(36.3126 9.10938 1)"
          fill="#FEFEFE"
          stroke="#2E2E32"
          stroke-width="1.65912"
        />
        <Rect x="5" y="8.26367" width="7" height="5" fill="#FEFEFE" />
        <Path
          d="M4 8.26367H13"
          stroke="#2E2E32"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </G>
      <Defs>
        <ClipPath id="clip0_10097_40127">
          <Rect
            width="18"
            height="18"
            fill="white"
            transform="translate(0 0.765625)"
          />
        </ClipPath>
      </Defs>
    </Svg>
  );
};
