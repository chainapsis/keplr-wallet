import React, { forwardRef } from "react";
import styled from "styled-components";
import { animated, SpringValue } from "@react-spring/web";

export const Styles = {
  Container: styled(animated.div).withConfig({
    shouldForwardProp: (prop) => prop === "style" || prop === "children",
  })<{
    width?: string;
  }>`
    position: relative;
    overflow: hidden;
    width: ${({ width }) => width};
  `,
};

// eslint-disable-next-line react/display-name
export const VerticalResizeContainer = forwardRef<
  HTMLDivElement,
  React.PropsWithChildren<{
    heightPx: SpringValue<number>;

    width?: string;
    transitionAlign?: "top" | "bottom" | "center";
  }>
>(({ children, heightPx, width, transitionAlign }, ref) => {
  // Styling should satisfy below styles.
  // if (!heightInited) {
  //   return {
  //     top: 0,
  //   };
  // }
  //
  // switch (transitionAlign) {
  //   case "center":
  //     return {
  //       top: "50%",
  //       transform: "translateY(-50%)",
  //     };
  //   case "bottom":
  //     return {
  //       bottom: 0,
  //     };
  //   default:
  //     return {
  //       top: 0,
  //     };
  // }

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
        ref={ref}
        style={{
          // Check above comment
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
    </Styles.Container>
  );
});
