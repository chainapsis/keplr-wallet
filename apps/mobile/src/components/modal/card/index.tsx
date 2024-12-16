import React, {FunctionComponent, PropsWithChildren} from 'react';
import {registerModal} from '../v2';
import {Platform, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useModalBase} from '../v2/provider';
import Reanimated, {
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
} from 'react-native-reanimated';
import {useStyle} from '../../../styles';

type CardBaseModalOption = {
  disabledSafeArea?: boolean;
  isDetached?: boolean;
  disableGesture?: boolean;

  headerBorderRadius?: number;
};

export const registerCardModal: <P>(
  element: React.ElementType<P>,
  options?: CardBaseModalOption,
) => FunctionComponent<
  P & {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }
> = (element, options = {}) => {
  return registerModal(element, {
    align: 'bottom',
    container: CardModalBase,
    containerProps: {
      options,
    },
  });
};

export const CardModalBase: FunctionComponent<
  PropsWithChildren<{
    options?: CardBaseModalOption;
  }>
> = ({children, options}) => {
  const safeAreaInsets = useSafeAreaInsets();

  const style = useStyle();

  const {
    translateY,
    duringModalTransition,
    detachModal,
    closeModalWithTransitionDelegate,
    layoutHeightShared,
  } = useModalBase();

  const touchStartPosition = useSharedValue<number | null>(null);
  const lastTranslateY = useSharedValue<number | null>(null);
  const velocity1 = useSharedValue<number>(0);
  const velocity2 = useSharedValue<number>(0);
  const velocity3 = useSharedValue<number>(0);
  const velocityI = useSharedValue<number>(0);

  // close 중인 modal은 pan gesture를 무시한다.
  // open 중일때는 잘 처리하도록 고려해야한다.
  // open일 경우 spring 트랜지션때문에 마지막에 느려지기 때문에...
  // 그 때도 gesture로 닫을 수 있도록 해야한다.
  // close일 경우 닫고 그걸 굳이 잡아서 열려는 유저는 없으므로 안해도 된다.
  const panGesture = Gesture.Pan()
    .onBegin(e => {
      if (options?.disableGesture) {
        return;
      }

      touchStartPosition.value = e.absoluteY;
    })
    .onUpdate(e => {
      if (options?.disableGesture) {
        return;
      }

      if (duringModalTransition.value === 'close') {
        return;
      }

      if (touchStartPosition.value != null) {
        const diff = e.absoluteY - touchStartPosition.value;
        if (diff > 10) {
          if (lastTranslateY.value == null && translateY.value != null) {
            lastTranslateY.value = translateY.value;
          }
        }
        if (lastTranslateY.value != null) {
          switch (velocityI.value) {
            case 0:
              velocity1.value = e.velocityY;
              break;
            case 1:
              velocity2.value = e.velocityY;
              break;
            case 2:
              velocity3.value = e.velocityY;
              break;
          }
          velocityI.value = (velocityI.value + 1) % 3;

          translateY.value = lastTranslateY.value + diff;

          translateY.value = Math.max(0, translateY.value);
        }
      }
    })
    .onFinalize(e => {
      if (options?.disableGesture) {
        return;
      }

      if (duringModalTransition.value === 'close') {
        return;
      }

      const velocity =
        (velocity1.value + velocity2.value + velocity3.value) / 3;

      if (
        layoutHeightShared.value != null &&
        touchStartPosition.value != null &&
        e.absoluteY > touchStartPosition.value &&
        (velocity > 800 ||
          // 추가적으로 유저가 5분의 2정도만 남기고 내렸을 경우에도 닫는다.
          (layoutHeightShared.value -
            (e.absoluteY - touchStartPosition.value)) /
            layoutHeightShared.value <=
            2 / 5)
      ) {
        runOnJS(closeModalWithTransitionDelegate)();
        duringModalTransition.value = 'close';
        translateY.value = withDecay(
          {
            velocity: Math.max(800, velocity),
            clamp: [0, layoutHeightShared.value],
            deceleration: 1,
          },
          finished => {
            if (finished) {
              duringModalTransition.value = 'not';
              runOnJS(detachModal)();
            }
          },
        );
      } else {
        translateY.value = withDecay(
          {
            velocity: Math.min(-1300, velocity),
            clamp: [0, 9999999],
            deceleration: 1,
          },
          finished => {
            if (finished) {
              // 만약 열리는 도중에 gesture로 잡아서 아무것도 안하고 계속 열었을 경우
              // 이미 이 트랜지션이 base modal의 트랜지션을 override하고 있으므로
              // 여기서 duringModalTransition의 처리를 꼭 해줘야한다.
              duringModalTransition.value = 'not';
            }
          },
        );
      }

      touchStartPosition.value = null;
      lastTranslateY.value = null;

      velocity1.value = 0;
      velocity2.value = 0;
      velocity3.value = 0;
      velocityI.value = 0;
    });

  const keyboard = (() => {
    // ios에서만 keyboard height를 고려한다.
    // 안드로이드는 의외로 지혼자 keyboard 처리가 잘 된다...
    // 당연히 platform이 동적으로 바뀔 순 없으므로 linter를 무시한다.
    if (Platform.OS === 'ios') {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useAnimatedKeyboard();
    } else {
      return {
        height: {
          value: 0,
        },
      };
    }
  })();

  const backgroundColor = style.get('color-gray-600').color;
  const innerContainerStyle = useAnimatedStyle(() => {
    if (options?.isDetached) {
      return {
        marginBottom: safeAreaInsets.bottom + 20,
        marginHorizontal: 12,
        borderRadius: 8,
        backgroundColor: backgroundColor,
      };
    }
    return {
      borderTopLeftRadius: options?.headerBorderRadius ?? 0,
      borderTopRightRadius: options?.headerBorderRadius ?? 0,
      paddingBottom:
        Math.max(
          (options?.disabledSafeArea ? 0 : safeAreaInsets.bottom) -
            keyboard.height.value,
          0,
        ) + keyboard.height.value,

      backgroundColor: backgroundColor,
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <Reanimated.View style={innerContainerStyle}>
        {!options?.isDetached && !options?.disableGesture ? (
          <View
            style={style.flatten([
              'items-center',
              'padding-top-10',
              'padding-bottom-12',
            ])}>
            <View
              style={{
                width: 58,
                height: 5,
                borderRadius: 9999,
                backgroundColor: style.get('color-gray-500').color,
              }}
            />
          </View>
        ) : null}

        {children}
      </Reanimated.View>
    </GestureDetector>
  );
};
