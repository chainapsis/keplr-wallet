import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useRef,
} from 'react';
import {VerticalCollapseTransitionProps} from './types';
import Reanimated, {useSharedValue, withSpring} from 'react-native-reanimated';
import {VerticalResizeContainer} from '../internal';
import {defaultSpringConfig} from '../../../styles/spring';

export const VerticalCollapseTransition: FunctionComponent<
  PropsWithChildren<
    VerticalCollapseTransitionProps & {
      onTransitionEnd?: () => void;
    }
  >
> = ({children, collapsed, width, transitionAlign, onTransitionEnd}) => {
  const onTransitionEndRef = useRef(onTransitionEnd);
  onTransitionEndRef.current = onTransitionEnd;

  const heightPx = useSharedValue(collapsed ? 0 : -1);

  const lastHeight = useRef(collapsed ? 0 : -1);

  const opacity = useSharedValue(collapsed ? 0.1 : 1);

  useEffect(() => {
    if (collapsed) {
      heightPx.value = withSpring(0, defaultSpringConfig);
      opacity.value = withSpring(0.1, defaultSpringConfig);
    } else {
      heightPx.value = withSpring(lastHeight.current, defaultSpringConfig);
      opacity.value = withSpring(1, defaultSpringConfig);
    }
  }, [collapsed, heightPx, opacity]);

  return (
    <VerticalResizeContainer
      onHeightChange={height => {
        lastHeight.current = height;
        if (!collapsed) {
          heightPx.value = height;
        }
      }}
      heightPx={heightPx}
      width={width}
      transitionAlign={transitionAlign}>
      <Reanimated.View
        style={{
          opacity,
        }}>
        {children}
      </Reanimated.View>
    </VerticalResizeContainer>
  );
};
