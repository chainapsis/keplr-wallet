import React, { FunctionComponent, useEffect, useRef } from "react";
import { VerticalCollapseTransitionProps } from "./types";
import {
  useVerticalResizeObserver,
  VerticalResizeContainer,
} from "../internal";
import { animated, useSpringValue } from "@react-spring/web";

export const VerticalCollapseTransition: FunctionComponent<VerticalCollapseTransitionProps> = ({
  children,
  collapsed,
  width,
  transitionAlign,
  springConfig,
}) => {
  const heightPx = useSpringValue(collapsed ? 0 : -1, {
    config: springConfig,
  });
  const lastHeight = useRef(collapsed ? 0 : -1);
  const ref = useVerticalResizeObserver((height: number) => {
    lastHeight.current = height;
    if (!collapsed) {
      heightPx.set(height);
    }
  });

  const opacity = useSpringValue(collapsed ? 0 : 1);

  useEffect(() => {
    if (collapsed) {
      heightPx.start(0);
      opacity.start(0);
    } else {
      heightPx.start(lastHeight.current);
      opacity.start(1);
    }
  }, [collapsed, heightPx, opacity]);

  return (
    <VerticalResizeContainer
      ref={ref}
      heightPx={heightPx}
      width={width}
      transitionAlign={transitionAlign}
    >
      <animated.div
        style={{
          opacity,
        }}
      >
        {children}
      </animated.div>
    </VerticalResizeContainer>
  );
};
