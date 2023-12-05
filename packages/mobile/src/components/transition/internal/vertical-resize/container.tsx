import React, {FunctionComponent, PropsWithChildren} from 'react';
import Reanimated, {
  measure,
  SharedValue,
  useAnimatedRef,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {DimensionValue} from 'react-native/Libraries/StyleSheet/StyleSheetTypes';

export const VerticalResizeContainer: FunctionComponent<
  PropsWithChildren<{
    heightPx: SharedValue<number>;
    onHeightChange: (height: number) => void;

    width?: DimensionValue | SharedValue<DimensionValue>;
    transitionAlign?: 'top' | 'bottom' | 'center';
  }>
> = ({children, heightPx, onHeightChange, width, transitionAlign}) => {
  const onHeightChangeRef = React.useRef(onHeightChange);
  onHeightChangeRef.current = onHeightChange;

  const innerContainerRef = useAnimatedRef<Reanimated.View>();

  const containerStyle = useAnimatedStyle(() => {
    return {
      position: 'relative',
      overflow: 'hidden',
      width: (() => {
        if (!width) {
          return 'auto';
        }

        if (typeof width === 'object' && 'value' in width) {
          return width.value;
        }

        return width;
      })(),
      height: heightPx.value < 0 ? 'auto' : heightPx.value,
      // Should not shrink under flex container
      flexShrink: 0,
    };
  });

  const innerStyle = useAnimatedStyle(() => {
    return {
      top: (() => {
        if (heightPx.value < 0) {
          return 0;
        }

        if (transitionAlign === 'bottom') {
          return 'auto';
        }

        if (transitionAlign === 'center') {
          return '50%';
        }

        return 0;
      })(),
      bottom: (() => {
        if (heightPx.value < 0) {
          return 'auto';
        }

        if (transitionAlign === 'bottom') {
          return 0;
        }

        return 'auto';
      })(),
      transform: (() => {
        if (heightPx.value < 0) {
          return;
        }

        if (transitionAlign === 'center') {
          // XXX: translateY: "-50%"여야한다. 근데 react native가 이걸 지원하지 않는다.
          //      일단 대충 height의 절반만큼 올리는 것으로 대체한다.
          //      될 것 같은데 사실 실제 되는지 확인 안해봤다.
          if (_WORKLET) {
            const measured = measure(innerContainerRef);
            if (measured) {
              return [{translateY: -measured.height / 2}];
            }
          }

          return [{translateY: -heightPx.value / 2}];
        }

        return;
      })(),
      position: heightPx.value < 0 ? 'relative' : 'absolute',
      left: heightPx.value < 0 ? 'auto' : 0,
      right: heightPx.value < 0 ? 'auto' : 0,
    };
  });

  return (
    <Reanimated.View style={containerStyle}>
      <Reanimated.View
        ref={innerContainerRef}
        style={innerStyle}
        collapsable={false}
        onLayout={e => {
          onHeightChangeRef.current(e.nativeEvent.layout.height);
        }}>
        {children}
      </Reanimated.View>
    </Reanimated.View>
  );
};
