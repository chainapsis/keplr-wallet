import React, {FunctionComponent} from 'react';
import Svg, {Circle, G} from 'react-native-svg';
// import Animated from 'react-native-reanimated';
// import {useSpinAnimated} from './hooks';

//TODO 이후에 애니메이션 추가해야함 hooks.ts 파일이랑  index.ts 파일도 함께 수정해야함
export const SVGLoadingIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({color, size}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <G stroke={color}>
        <Circle
          cx="12"
          cy="12"
          r="9.5"
          fill="none"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </G>
    </Svg>
  );
};

// export const LoadingSpinner: FunctionComponent<{
//   color: string;
//   size: number;

//   enabled?: boolean;
// }> = ({color, size, enabled}) => {
//   const spinAnimated = useSpinAnimated(enabled ?? true);

//   return (
//     <Animated.View
//       style={{
//         width: size,
//         height: size,
//         transform: [
//           {
//             rotate: spinAnimated,
//           },
//         ],
//       }}>
//       <SVGLoadingIcon color={color} size={size} />
//     </Animated.View>
//   );
// };
