import React, {
  FunctionComponent,
  PropsWithChildren,
  useContext,
  useEffect,
} from 'react';
import {
  Easing,
  interpolate,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export interface LoadingIconAnimation {
  strokeDasharray1: SharedValue<number>;
  strokeDasharray2: SharedValue<number>;
  strokeDashoffset: SharedValue<number>;
  rotate: SharedValue<number>;
}

export const LoadingIconAnimationContext =
  React.createContext<LoadingIconAnimation | null>(null);

const withSplineSequence = (
  duration: number,
  // keyTimes[0] must be 0
  keyTimes: number[],
  keySplines: {x1: number; y1: number; x2: number; y2: number}[],
) => {
  return withSequence(
    ...keySplines.map((keySpline, index) => {
      const {x1, y1, x2, y2} = keySpline;
      const from = keyTimes[index];
      const to = keyTimes[index + 1];
      return withTiming(to, {
        duration: (to - from) * duration,
        easing: Easing.bezier(x1, y1, x2, y2),
      });
    }),
  );
};

const strokeDasharrayKeyTimes = [0, 0.475, 0.95, 1];
const strokeDashoffsetKeyTimes = [0, 0.475, 0.95, 1];

// 로딩 아이콘을 뺑글뺑글 돌릴때 공통적인 spin value를 제공함
// 로딩 아이콘이 각각 value를 가져도 되는데 그러면 실행되는 시점에 따라서 미묘하게 각도가 다를 수 있음
// 다 동일한 각도를 가지는게 더 예쁠 것 같아서 이렇게 처리함.
export const LoadingIconAnimationProvider: FunctionComponent<
  PropsWithChildren
> = ({children}) => {
  /*
   <animate
      attributeName="stroke-dasharray"
      calcMode="spline"
      dur="1.5s"
      keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
      keyTimes="0;0.475;0.95;1"
      repeatCount="indefinite"
      values="0 150;42 150;42 150;42 150"
    />
   */
  const strokeDasharrayT = useSharedValue(0);
  useEffect(() => {
    strokeDasharrayT.value = withRepeat(
      withSplineSequence(1500, strokeDasharrayKeyTimes, [
        {
          x1: 0.42,
          y1: 0,
          x2: 0.58,
          y2: 1,
        },
        {
          x1: 0.42,
          y1: 0,
          x2: 0.58,
          y2: 1,
        },
        {
          x1: 0.42,
          y1: 0,
          x2: 0.58,
          y2: 1,
        },
      ]),
      0,
      false,
    );
  }, [strokeDasharrayT]);

  /*
   <animate
      attributeName="stroke-dashoffset"
      calcMode="spline"
      dur="1.5s"
      keySplines="0.42,0,0.58,1;0.42,0,0.58,1;0.42,0,0.58,1"
      keyTimes="0;0.475;0.95;1"
      repeatCount="indefinite"
      values="0;-16;-59;-59"
    />
   */
  const strokeDashoffsetT = useSharedValue(0);
  useEffect(() => {
    strokeDashoffsetT.value = withRepeat(
      withSplineSequence(1500, strokeDashoffsetKeyTimes, [
        {
          x1: 0.42,
          y1: 0,
          x2: 0.58,
          y2: 1,
        },
        {
          x1: 0.42,
          y1: 0,
          x2: 0.58,
          y2: 1,
        },
        {
          x1: 0.42,
          y1: 0,
          x2: 0.58,
          y2: 1,
        },
      ]),
      0,
      false,
    );
  }, [strokeDashoffsetT]);

  /*
   <animateTransform
      attributeName="transform"
      dur="2s"
      repeatCount="indefinite"
      type="rotate"
      values="0 12 12;360 12 12"
    />
   */
  const rotate = useSharedValue(0);
  useEffect(() => {
    rotate.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      0,
      false,
    );
  }, [rotate]);

  return (
    <LoadingIconAnimationContext.Provider
      value={{
        strokeDasharray1: useDerivedValue(() => {
          return interpolate(
            strokeDasharrayT.value,
            strokeDasharrayKeyTimes,
            [0, 42, 42, 42],
          );
        }),
        strokeDasharray2: useDerivedValue(() => {
          return interpolate(
            strokeDasharrayT.value,
            strokeDasharrayKeyTimes,
            [150, 150, 150, 150],
          );
        }),
        strokeDashoffset: useDerivedValue(() => {
          return interpolate(
            strokeDashoffsetT.value,
            strokeDashoffsetKeyTimes,
            [0, -16, -59, -59],
          );
        }),
        rotate,
      }}>
      {children}
    </LoadingIconAnimationContext.Provider>
  );
};

export const useLoadingIconAnimation = () => {
  const context = useContext(LoadingIconAnimationContext);
  if (!context) {
    throw new Error('You forgot to use LoadingIconAnimationProvider');
  }
  return context;
};
