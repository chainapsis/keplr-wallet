import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { VerticalCollapseTransitionProps } from "./types";
import {
  useVerticalResizeObserver,
  VerticalResizeContainer,
} from "../internal";
import { animated, useSpringValue } from "@react-spring/web";
import {
  DescendantHeightPxRegistry,
  useVerticalSizeInternalContext,
  _VerticalSizeInternalContext,
} from "../vertical-size/internal";
import { defaultSpringConfig } from "../../../styles/spring";

export const VerticalCollapseTransition: FunctionComponent<
  PropsWithChildren<
    VerticalCollapseTransitionProps & {
      onTransitionEnd?: () => void;

      onResize?: (height: number) => void;
    }
  >
> = ({
  children,
  collapsed,
  width,
  opacityLeft = 0.1,
  disableOpacityAnimation,
  staticHeightAnimConfig = defaultSpringConfig,
  staticOpacityAnimConfig = defaultSpringConfig,
  transitionAlign,
  onTransitionEnd,
  onResize,
}) => {
  const onTransitionEndRef = useRef(onTransitionEnd);
  onTransitionEndRef.current = onTransitionEnd;

  const heightPx = useSpringValue(collapsed ? 0 : -1, {
    config: staticHeightAnimConfig,
    onRest: () => {
      if (onTransitionEndRef.current) {
        onTransitionEndRef.current();
      }
    },
  });

  const opacity = useSpringValue(
    collapsed ? (disableOpacityAnimation ? 1 : opacityLeft) : 1,
    {
      config: staticOpacityAnimConfig,
    }
  );

  const [registry] = useState<DescendantHeightPxRegistry>(
    () => new DescendantHeightPxRegistry(heightPx, opacity)
  );
  const internalContext = useVerticalSizeInternalContext();

  useLayoutEffect(() => {
    if (internalContext) {
      const registryKey = internalContext.registry.registerRegistry(registry);

      return () => {
        internalContext.registry.unregisterRegistry(registryKey);
      };
    }
  }, [internalContext, registry]);

  const lastHeight = useRef(collapsed ? 0 : -1);
  const ref = useVerticalResizeObserver((height: number) => {
    lastHeight.current = height;
    registry.setExpandHeight(height);
    if (!collapsed) {
      heightPx.set(height);
    }

    if (onResize) {
      onResize(height);
    }
  });

  // useEffect에서는 구조상 collapsed만 deps로 받아서 처리해야한다. (heightPx, opacity는 ref이 변할수가 없으므로 ㄱㅊ)
  // 그래서 안에서 disableOpacityAnimation를 바로 쓸수가 없으므로 대충 ref으로 해결...
  const disableOpacityAnimationRef = useRef(disableOpacityAnimation);
  disableOpacityAnimationRef.current = disableOpacityAnimation;
  const opacityLeftRef = useRef(opacityLeft);
  opacityLeftRef.current = opacityLeft;
  useEffect(() => {
    if (collapsed) {
      heightPx.start(0);
      opacity.start(
        disableOpacityAnimationRef.current ? 1 : opacityLeftRef.current
      );
    } else {
      heightPx.start(lastHeight.current);
      opacity.start(1);
    }
  }, [collapsed, heightPx, opacity]);

  const contextValue = useMemo(() => {
    return {
      registry,
    };
  }, [registry]);

  return (
    <VerticalResizeContainer
      ref={ref}
      heightPx={heightPx}
      width={width}
      transitionAlign={transitionAlign}
    >
      <_VerticalSizeInternalContext.Provider value={contextValue}>
        <animated.div
          style={{
            opacity,
          }}
        >
          {children}
        </animated.div>
      </_VerticalSizeInternalContext.Provider>
    </VerticalResizeContainer>
  );
};
