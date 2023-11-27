import React, {FunctionComponent} from 'react';
import Svg, {Circle} from 'react-native-svg';
import Reanimated, {useAnimatedProps} from 'react-native-reanimated';
import {useLoadingIconAnimation} from '../../provider/loading-icon-animation';

const ReanimatedSvg = Reanimated.createAnimatedComponent(Svg);
const ReanimatedCircle = Reanimated.createAnimatedComponent(Circle);

export const SVGLoadingIcon: FunctionComponent<{
  color: string;
  size: number;
}> = ({color, size}) => {
  const anim = useLoadingIconAnimation();

  const svgProps = useAnimatedProps(() => {
    return {
      transform: [
        {
          rotate: `${anim.rotate.value}deg`,
        },
      ],
    };
  });

  const circleProps = useAnimatedProps(() => {
    return {
      strokeDasharray: `${anim.strokeDasharray1.value} ${anim.strokeDasharray2.value}`,
      strokeDashoffset: anim.strokeDashoffset.value,
    };
  });

  return (
    <ReanimatedSvg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      preserveAspectRatio="xMidYMid meet"
      animatedProps={svgProps}>
      <ReanimatedCircle
        cx="12"
        cy="12"
        r="9.5"
        fill="none"
        strokeLinecap="round"
        strokeWidth="3"
        stroke={color}
        animatedProps={circleProps}
      />
    </ReanimatedSvg>
  );
};
