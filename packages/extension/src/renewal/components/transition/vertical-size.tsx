import React, { FunctionComponent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { animated, SpringConfig, useSpringValue } from "@react-spring/web";

const Styles = {
  Container: styled(animated.div)<{
    width?: string;
  }>`
    position: relative;
    overflow: hidden;
    width: ${({ width }) => width};
  `,
};

export const VerticalResizeTransition: FunctionComponent<{
  width?: string;
  transitionAlign?: "top" | "middle" | "bottom";

  springConfig?: SpringConfig;
}> = ({ children, width, transitionAlign = "top", springConfig }) => {
  // if -1, it means not initialized yet.
  const heightPx = useSpringValue<number>(-1, {
    config: springConfig,
  });

  const observerContainerRef = useRef<HTMLDivElement | null>(null);
  const [resizeObserver] = useState(() => {
    let initialized = false;

    return new ResizeObserver((entries) => {
      if (entries.length > 0) {
        const entry = entries[0];
        const boxSize = Array.isArray(entry.borderBoxSize)
          ? entry.borderBoxSize[0]
          : entry.borderBoxSize;

        if (!initialized) {
          // At first, set height without animation.
          heightPx.set(boxSize.blockSize);
          initialized = true;
        } else {
          heightPx.start(boxSize.blockSize);
        }
      }
    });
  });
  useEffect(() => {
    if (observerContainerRef.current) {
      resizeObserver.observe(observerContainerRef.current, {});
    }
  }, [resizeObserver]);

  return (
    <Styles.Container
      width={width}
      style={{
        height: heightPx.to((heightPx) =>
          heightPx < 0 ? "auto" : `${heightPx}px`
        ),
      }}
    >
      <animated.div
        ref={observerContainerRef}
        style={{
          ...(() => {
            if (transitionAlign === "top") {
              return {
                top: 0,
              };
            } else if (transitionAlign === "bottom") {
              return {
                bottom: 0,
              };
            } else {
              return {
                top: "50%",
                transform: "translateY(-50%)",
              };
            }
          })(),
          ...(() => ({
            position: heightPx.to((heightPx) =>
              heightPx < 0 ? "relative" : "absolute"
            ),
            left: heightPx.to((heightPx) => (heightPx < 0 ? "auto" : "0")),
            right: heightPx.to((heightPx) => (heightPx < 0 ? "auto" : "0")),
          }))(),
        }}
      >
        {children}
      </animated.div>
    </Styles.Container>
  );
};
