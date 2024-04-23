import React, { forwardRef } from "react";
import { animated, SpringValue } from "@react-spring/web";

// eslint-disable-next-line react/display-name
export const VerticalResizeContainer = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{
    heightPx: SpringValue<number>;

    width?: string | SpringValue<string>;
    transitionAlign?: "top" | "bottom" | "center";
  }>
>(({ children, heightPx, width, transitionAlign }, ref) => {
  return (
    <animated.div
      style={{
        position: "relative",
        overflow: "hidden",
        width,
        height: heightPx.to((heightPx) =>
          heightPx < 0 ? "auto" : `${heightPx}px`
        ),
        // Should not shrink under flex container
        flexShrink: 0,
      }}
    >
      <animated.div
        ref={ref}
        style={{
          top: heightPx.to((heightPx) => {
            if (heightPx < 0) {
              return 0;
            }

            if (transitionAlign === "bottom") {
              return "auto";
            }

            if (transitionAlign === "center") {
              return "50%";
            }

            return 0;
          }),
          bottom: heightPx.to((heightPx) => {
            if (heightPx < 0) {
              return "auto";
            }

            if (transitionAlign === "bottom") {
              return "0";
            }

            return "auto";
          }),
          transform: heightPx.to((heightPx) => {
            if (heightPx < 0) {
              return "none";
            }

            if (transitionAlign === "center") {
              return "translateY(-50%)";
            }

            return "none";
          }),

          position: heightPx.to((heightPx) =>
            heightPx < 0 ? "relative" : "absolute"
          ),
          left: heightPx.to((heightPx) => (heightPx < 0 ? "auto" : "0")),
          right: heightPx.to((heightPx) => (heightPx < 0 ? "auto" : "0")),
        }}
      >
        {children}
      </animated.div>
    </animated.div>
  );
});
