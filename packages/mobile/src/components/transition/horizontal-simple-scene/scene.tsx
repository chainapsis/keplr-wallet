import React, {FunctionComponent, useEffect, useState} from 'react';
import Reanimated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {defaultSpringConfig} from '../../../styles/spring';

export const HorizontalSimpleScene: FunctionComponent<{
  scenes: {
    key: string;
    element: React.ElementType;
  }[];
  currentSceneKey: string;
  sharedProps?: any;
  transitionAlign?: 'top' | 'bottom' | 'center';
}> = ({scenes, currentSceneKey, sharedProps, transitionAlign}) => {
  const [leftScene, setLeftScene] = useState<{
    key: string;
    element: React.ElementType;
  }>(() => {
    const scene = scenes.find(scene => scene.key === currentSceneKey);
    if (!scene) {
      throw new Error('Scene not found');
    }
    return scene;
  });
  const [rightScene, setRightScene] = useState<{
    key: string;
    element: React.ElementType;
  } | null>(null);

  // -1: left, 0: center, 1: right
  const leftSceneProgress = useSharedValue(0);
  const rightSceneProgress = useSharedValue(1);
  const leftBecomeMain = useSharedValue(false);

  const [lastSceneKey, setLastSceneKey] = useState<string>(currentSceneKey);
  useEffect(() => {
    if (lastSceneKey !== currentSceneKey) {
      const prevSceneIndex = scenes.findIndex(
        scene => scene.key === lastSceneKey,
      );
      const newSceneIndex = scenes.findIndex(
        scene => scene.key === currentSceneKey,
      );
      if (prevSceneIndex < 0 || newSceneIndex < 0) {
        throw new Error('Scene not found');
      }
      const newIsLeft = prevSceneIndex > newSceneIndex;
      if (newIsLeft) {
        setLeftScene(scenes[newSceneIndex]);
        setRightScene(scenes[prevSceneIndex]);

        leftBecomeMain.value = true;
        leftSceneProgress.value = -1;
        leftSceneProgress.value = withSpring(0, defaultSpringConfig);
        rightSceneProgress.value = 0;
        rightSceneProgress.value = withSpring(1, defaultSpringConfig);
      } else {
        setLeftScene(scenes[prevSceneIndex]);
        setRightScene(scenes[newSceneIndex]);

        leftBecomeMain.value = false;
        leftSceneProgress.value = 0;
        leftSceneProgress.value = withSpring(-1, defaultSpringConfig);
        rightSceneProgress.value = 1;
        rightSceneProgress.value = withSpring(0, defaultSpringConfig);
      }
      setLastSceneKey(currentSceneKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leftScene, currentSceneKey]);

  const sharedInfoValue = useSharedValue<
    | {isTransition: boolean} & (
        | {
            isReadyToMeasure: false;
            leftMeasured: null;
            rightMeasured: null;
          }
        | {
            isReadyToMeasure: true;
            leftMeasured: {
              width: number;
              height: number;
            };
            rightMeasured: {
              width: number;
              height: number;
            };
          }
      )
  >({
    isTransition: false,
    isReadyToMeasure: false,
    leftMeasured: null,
    rightMeasured: null,
  });

  const leftMeasuredTemp = useSharedValue<{
    width: number;
    height: number;
  } | null>(null);
  const rightMeasuredTemp = useSharedValue<{
    width: number;
    height: number;
  } | null>(null);

  useAnimatedReaction(
    () => {
      // 여기서 별 기능은 없고 일종의 deps 역할이라고 할 수 있다...
      return [
        leftSceneProgress.value,
        rightSceneProgress.value,
        leftMeasuredTemp.value,
        rightMeasuredTemp.value,
      ];
    },
    () => {
      const isTransition =
        leftSceneProgress.value % 1 !== 0 || rightSceneProgress.value % 1 !== 0;

      const leftMeasured = leftMeasuredTemp.value;
      const rightMeasured = rightMeasuredTemp.value;

      if (leftMeasured != null && rightMeasured != null) {
        sharedInfoValue.value = {
          isTransition,
          isReadyToMeasure: true,
          leftMeasured,
          rightMeasured,
        };
      } else {
        sharedInfoValue.value = {
          isTransition,
          isReadyToMeasure: false,
          leftMeasured: null,
          rightMeasured: null,
        };
      }

      return {};
    },
  );

  const containerStyle = useAnimatedStyle(() => {
    const defaultStyle = {
      position: 'relative' as const,
      overflow: 'hidden' as const,
      height: 'auto' as const,
      // Should not shrink under flex container
      flexShrink: 0,
    };

    if (
      _WORKLET &&
      sharedInfoValue.value.isTransition &&
      sharedInfoValue.value.isReadyToMeasure
    ) {
      const leftHeight = sharedInfoValue.value.leftMeasured.height;
      const rightHeight = sharedInfoValue.value.rightMeasured.height;
      return {
        ...defaultStyle,
        height: leftBecomeMain.value
          ? leftHeight +
            (rightHeight - leftHeight) * Math.abs(leftSceneProgress.value)
          : rightHeight +
            (leftHeight - rightHeight) * Math.abs(rightSceneProgress.value),
      };
    }

    return {
      ...defaultStyle,
    };
  });

  const leftContainerStyle = useAnimatedStyle(() => {
    const defaultStyle =
      sharedInfoValue.value.isReadyToMeasure &&
      (sharedInfoValue.value.isTransition || leftSceneProgress.value !== 0)
        ? {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 'auto' as const,
          }
        : {
            position: 'relative' as const,
            top: 'auto' as const,
            left: 'auto' as const,
            right: 'auto' as const,
            bottom: 'auto' as const,
          };

    if (_WORKLET && sharedInfoValue.value.isReadyToMeasure) {
      return {
        ...defaultStyle,
        top: (() => {
          if (transitionAlign === 'bottom') {
            return 'auto';
          }

          if (transitionAlign === 'center') {
            return '50%';
          }

          return 0;
        })(),
        bottom: (() => {
          if (transitionAlign === 'bottom') {
            return 0;
          }

          return 'auto';
        })(),
        transform: [
          {
            translateX:
              leftSceneProgress.value *
              sharedInfoValue.value.leftMeasured.width,
          },
          {
            translateY: (() => {
              if (transitionAlign === 'center') {
                return -sharedInfoValue.value.leftMeasured.height / 2;
              }

              return 0;
            })(),
          },
        ],
        opacity: 1 - Math.abs(leftSceneProgress.value),
      };
    }
    return defaultStyle;
  });
  const rightContainerStyle = useAnimatedStyle(() => {
    const defaultStyle =
      sharedInfoValue.value.isReadyToMeasure &&
      (sharedInfoValue.value.isTransition || rightSceneProgress.value !== 0)
        ? {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 'auto' as const,
          }
        : {
            position: 'relative' as const,
            top: 'auto' as const,
            left: 'auto' as const,
            right: 'auto' as const,
            bottom: 'auto' as const,
          };

    if (_WORKLET && sharedInfoValue.value.isReadyToMeasure) {
      return {
        ...defaultStyle,
        top: (() => {
          if (transitionAlign === 'bottom') {
            return 'auto';
          }

          if (transitionAlign === 'center') {
            return '50%';
          }

          return 0;
        })(),
        bottom: (() => {
          if (transitionAlign === 'bottom') {
            return 0;
          }

          return 'auto';
        })(),
        transform: [
          {
            translateX:
              rightSceneProgress.value *
              sharedInfoValue.value.rightMeasured.width,
          },
          {
            translateY: (() => {
              if (transitionAlign === 'center') {
                return -sharedInfoValue.value.rightMeasured.height / 2;
              }

              return 0;
            })(),
          },
        ],
        opacity: 1 - Math.abs(rightSceneProgress.value),
      };
    }
    return defaultStyle;
  });

  return (
    <Reanimated.View style={containerStyle}>
      <Reanimated.View
        style={leftContainerStyle}
        onLayout={e => {
          leftMeasuredTemp.value = {
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          };
        }}>
        {React.createElement(leftScene.element, sharedProps)}
      </Reanimated.View>
      <Reanimated.View
        style={rightContainerStyle}
        onLayout={e => {
          rightMeasuredTemp.value = {
            width: e.nativeEvent.layout.width,
            height: e.nativeEvent.layout.height,
          };
        }}>
        {rightScene
          ? React.createElement(rightScene.element, sharedProps)
          : null}
      </Reanimated.View>
    </Reanimated.View>
  );
};
