import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import { HorizontalCollapseTransitionProps } from "./types";
import { animated, to, useSpringValue } from "@react-spring/web";
import {} from "../vertical-size/internal";
import { defaultSpringConfig } from "../../../styles/spring";
import { useHorizontalResizeObserver } from "./hook";

export const HorizontalCollapseTransition: FunctionComponent<
  PropsWithChildren<
    HorizontalCollapseTransitionProps & {
      onTransitionEnd?: () => void;

      onResize?: (height: number) => void;
    }
  >
> = ({ children, collapsed, onTransitionEnd, onResize }) => {
  const onTransitionEndRef = useRef(onTransitionEnd);
  onTransitionEndRef.current = onTransitionEnd;

  const isAnimatingCollapsed = useSpringValue(false);
  const isAnimatingNonCollapsed = useSpringValue(false);
  const widthPx = useSpringValue(collapsed ? 0 : -1, {
    config: defaultSpringConfig,
    onRest: () => {
      if (onTransitionEndRef.current) {
        onTransitionEndRef.current();
      }
    },
  });
  const lastWidthPx = useSpringValue(collapsed ? 0 : -1);
  const lastHeightPx = useSpringValue(-1);

  const ref = useHorizontalResizeObserver(
    (width: number) => {
      lastWidthPx.set(width);

      if (onResize) {
        onResize(width);
      }
    },
    (height: number) => {
      lastHeightPx.set(height);
    }
  );

  useEffect(() => {
    if (collapsed) {
      if (widthPx.get() < 0 || !isAnimatingNonCollapsed.get()) {
        widthPx.set(lastWidthPx.get());
      }
      isAnimatingCollapsed.set(true);
      widthPx.start(0, {
        onRest: () => {
          isAnimatingCollapsed.set(false);
        },
      });
    } else {
      isAnimatingNonCollapsed.set(true);
      widthPx.start(lastWidthPx.get(), {
        onRest: () => {
          isAnimatingNonCollapsed.set(false);
        },
      });
    }
  }, [
    collapsed,
    isAnimatingCollapsed,
    isAnimatingNonCollapsed,
    lastWidthPx,
    widthPx,
  ]);

  return (
    <animated.div
      style={{
        position: "relative",
        overflow: "hidden",
        width: to(
          [
            isAnimatingCollapsed,
            isAnimatingNonCollapsed,
            widthPx,
            lastHeightPx,
          ],
          (
            isAnimatingCollapsed,
            isAnimatingNonCollapsed,
            widthPx,
            lastHeightPx
          ) => {
            if (
              (!isAnimatingCollapsed && !isAnimatingNonCollapsed) ||
              (widthPx as number) < 0 ||
              (lastHeightPx as number) < 0
            ) {
              if (widthPx !== 0) {
                return "fit-content";
              }
            }
            return `${widthPx}px`;
          }
        ),
        height: to(
          [
            isAnimatingCollapsed,
            isAnimatingNonCollapsed,
            widthPx,
            lastHeightPx,
          ],
          (
            isAnimatingCollapsed,
            isAnimatingNonCollapsed,
            widthPx,
            lastHeightPx
          ) => {
            if (
              (!isAnimatingCollapsed && !isAnimatingNonCollapsed) ||
              (widthPx as number) < 0 ||
              (lastHeightPx as number) < 0
            ) {
              if (widthPx !== 0) {
                return "fit-content";
              }
            }

            return `${lastHeightPx}px`;
          }
        ),
      }}
    >
      <animated.div
        style={{
          width: to(
            [
              isAnimatingCollapsed,
              isAnimatingNonCollapsed,
              lastWidthPx,
              lastHeightPx,
              widthPx,
            ],
            (
              isAnimatingCollapsed,
              isAnimatingNonCollapsed,
              lastWidthPx,
              lastHeightPx,
              widthPx
            ) => {
              if (
                (!isAnimatingCollapsed && !isAnimatingNonCollapsed) ||
                (lastWidthPx as number) < 0 ||
                (lastHeightPx as number) < 0
              ) {
                if (widthPx !== 0) {
                  return "fit-content";
                }
              }
              return `${lastWidthPx}px`;
            }
          ),
          position: to(
            [
              isAnimatingCollapsed,
              isAnimatingNonCollapsed,
              widthPx,
              lastHeightPx,
            ],
            (
              isAnimatingCollapsed,
              isAnimatingNonCollapsed,
              widthPx,
              lastHeightPx
            ) => {
              if (
                (!isAnimatingCollapsed && !isAnimatingNonCollapsed) ||
                (widthPx as number) < 0 ||
                (lastHeightPx as number) < 0
              ) {
                if (widthPx !== 0) {
                  return "relative";
                }
              }
              return "absolute";
            }
          ),
        }}
      >
        <div
          ref={ref}
          style={{
            width: "fit-content",
          }}
        >
          {children}
        </div>
      </animated.div>
    </animated.div>
  );
};
