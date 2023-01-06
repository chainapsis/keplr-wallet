import React, { FunctionComponent, useRef } from "react";
import { useSpringValue } from "@react-spring/web";
import { VerticalResizeTransitionProps } from "./types";
import {
  useVerticalResizeObserver,
  VerticalResizeContainer,
} from "../internal";

export const VerticalResizeTransition: FunctionComponent<VerticalResizeTransitionProps> = ({
  children,
  width,
  transitionAlign,
  springConfig,
}) => {
  // if -1, it means not initialized yet.
  const heightPx = useSpringValue<number>(-1, {
    config: springConfig,
  });
  const initialized = useRef(false);
  const ref = useVerticalResizeObserver((height: number) => {
    if (initialized.current) {
      heightPx.start(height);
    } else {
      // At first, set height without animation.
      heightPx.set(height);
      initialized.current = true;
    }
  });

  return (
    <VerticalResizeContainer
      ref={ref}
      heightPx={heightPx}
      width={width}
      transitionAlign={transitionAlign}
    >
      {children}
    </VerticalResizeContainer>
  );
};
