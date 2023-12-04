import React, {FunctionComponent, useEffect, useState} from 'react';
import Reanimated, {
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  measure,
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

  const containerRef = useAnimatedRef<Reanimated.View>();
  const leftContainerRef = useAnimatedRef<Reanimated.View>();
  const rightContainerRef = useAnimatedRef<Reanimated.View>();

  const containerStyle = useAnimatedStyle(() => {
    const isTransition =
      leftSceneProgress.value % 1 !== 0 || rightSceneProgress.value % 1 !== 0;

    const defaultStyle = {
      position: 'relative' as const,
      overflow: 'hidden' as const,
      height: 'auto' as const,
      // Should not shrink under flex container
      flexShrink: 0,
    };

    if (_WORKLET && isTransition) {
      const leftMeasured = measure(leftContainerRef);
      const rightMeasured = measure(rightContainerRef);
      const leftHeight = leftMeasured ? leftMeasured.height : 0;
      const rightHeight = rightMeasured ? rightMeasured.height : 0;
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
    const isTransition =
      leftSceneProgress.value % 1 !== 0 || rightSceneProgress.value % 1 !== 0;

    const defaultStyle =
      isTransition || leftSceneProgress.value !== 0
        ? {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
          }
        : {
            position: 'relative' as const,
            top: 'auto' as const,
            left: 'auto' as const,
            right: 'auto' as const,
          };

    if (_WORKLET) {
      const measured = measure(leftContainerRef);
      if (measured) {
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
              translateX: leftSceneProgress.value * measured.width,
            },
            {
              translateY: (() => {
                if (transitionAlign === 'center') {
                  return -measured.height / 2;
                }

                return 0;
              })(),
            },
          ],
          opacity: 1 - Math.abs(leftSceneProgress.value),
        };
      }
    }
    return defaultStyle;
  });
  const rightContainerStyle = useAnimatedStyle(() => {
    const isTransition =
      leftSceneProgress.value % 1 !== 0 || rightSceneProgress.value % 1 !== 0;

    const defaultStyle =
      isTransition || rightSceneProgress.value !== 0
        ? {
            position: 'absolute' as const,
            top: 0,
            left: 0,
            right: 0,
          }
        : {
            position: 'relative' as const,
            top: 'auto' as const,
            left: 'auto' as const,
            right: 'auto' as const,
          };

    if (_WORKLET) {
      const measured = measure(rightContainerRef);
      if (measured) {
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
              translateX: rightSceneProgress.value * measured.width,
            },
            {
              translateY: (() => {
                if (transitionAlign === 'center') {
                  return -measured.height / 2;
                }

                return 0;
              })(),
            },
          ],
          opacity: 1 - Math.abs(rightSceneProgress.value),
        };
      }
    }
    return defaultStyle;
  });

  return (
    <Reanimated.View ref={containerRef} style={containerStyle}>
      <Reanimated.View ref={leftContainerRef} style={leftContainerStyle}>
        {React.createElement(leftScene.element, sharedProps)}
      </Reanimated.View>
      <Reanimated.View ref={rightContainerRef} style={rightContainerStyle}>
        {rightScene
          ? React.createElement(rightScene.element, sharedProps)
          : null}
      </Reanimated.View>
    </Reanimated.View>
  );
};
