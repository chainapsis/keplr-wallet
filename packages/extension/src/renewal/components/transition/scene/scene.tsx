import React, {
  FunctionComponent,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { VerticalResizeTransition } from "../vertical-size";
import styled from "styled-components";
import {
  animated,
  SpringConfig,
  SpringValue,
  to,
  useSpringValue,
} from "@react-spring/web";
import { SceneTransitionProps, SceneTransitionRef } from "./types";
import {
  ScenePropsInternalTypes,
  SceneTransitionContextBase,
} from "./internal";

const Styles = {
  Container: styled(animated.div).withConfig({
    shouldForwardProp: (prop) => prop === "style" || prop === "children",
  })<{
    zIndex: number;
    transitionAlign?: "top" | "bottom" | "center";
  }>`
    display: grid;
    grid-template-columns: 1fr;

    z-index: ${({ zIndex }) => zIndex};

    width: 100%;
  `,
  Element: styled.div`
    grid-row-start: 1;
    grid-column-start: 1;
  `,
};

// eslint-disable-next-line react/display-name
export const SceneTransition = forwardRef<
  SceneTransitionRef,
  SceneTransitionProps
>(
  (
    { scenes, initialSceneProps, width, transitionAlign, springConfig },
    ref
  ) => {
    const seq = useRef<number>(0);

    const [stack, setStack] = useState<ScenePropsInternalTypes[]>(() => [
      {
        ...initialSceneProps,
        id: seq.current.toString(),
        top: true,
        animTop: new SpringValue<boolean>(true),
        initialX: 0,
        targetX: 0,
        initialOpacity: 1,
        targetOpacity: 1,
        detached: false,
      },
    ]);

    const sceneChangeListeners = useRef<
      ((stack: ReadonlyArray<string>) => void)[]
    >([]);

    const push = useCallback((name: string, props?: Record<string, any>) => {
      setStack((prevStack) => {
        seq.current++;

        const newStack = prevStack.slice();

        const prevTop = newStack.find((s) => s.top);
        if (prevTop) {
          prevTop.top = false;
          prevTop.animTop.set(false);
          prevTop.targetX = -1;
          prevTop.targetOpacity = 0;
        }

        newStack.push({
          name,
          props: props,
          id: seq.current.toString(),
          top: true,
          animTop: new SpringValue<boolean>(true),
          initialX: 1,
          targetX: 0,
          initialOpacity: 0,
          targetOpacity: 1,
          detached: false,
        });

        return newStack;
      });
    }, []);

    const pop = useCallback(() => {
      setStack((prevStack) => {
        const newStack = prevStack.slice();
        if (newStack.length === 1) {
          throw new Error("You can't remove initial scene");
        }

        if (newStack.length === 0) {
          throw new Error("Stack is empty");
        }

        let newTop: ScenePropsInternalTypes | undefined;
        const prevTopIndex = newStack.findIndex((s) => s.top);
        if (prevTopIndex >= 0) {
          const prevTop = newStack[prevTopIndex];
          for (let i = prevTopIndex - 1; i >= 0; i--) {
            const scene = newStack[i];
            if (!scene.detached) {
              newTop = scene;
              break;
            }
          }

          prevTop.top = false;
          prevTop.animTop.set(false);
          prevTop.targetX = 1;
          prevTop.targetOpacity = 0;
          prevTop.detached = true;
          prevTop.onAminEnd = () => {
            setStack((prevStack) =>
              prevStack.slice().filter((s) => s !== prevTop)
            );
          };
        }

        if (newTop) {
          newTop.top = true;
          newTop.animTop.set(true);
          newTop.targetX = 0;
          newTop.targetOpacity = 1;
        }

        return newStack;
      });
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        push,
        pop,
        addSceneChangeListener(
          listener: (stack: ReadonlyArray<string>) => void
        ) {
          sceneChangeListeners.current.push(listener);
        },
        removeSceneChangeListener(
          listener: (stack: ReadonlyArray<string>) => void
        ) {
          sceneChangeListeners.current = sceneChangeListeners.current.filter(
            (l) => l !== listener
          );
        },
      }),
      [pop, push]
    );

    const notDetachedStackNames = useMemo(() => {
      return stack.filter((s) => !s.detached).map((s) => s.name);
    }, [stack]);

    useEffect(() => {
      for (const listener of sceneChangeListeners.current) {
        listener(notDetachedStackNames);
      }
    }, [notDetachedStackNames]);

    return (
      <SceneTransitionContextBase.Provider
        value={{ push, pop, stack: notDetachedStackNames }}
      >
        <VerticalResizeTransition
          width={width}
          transitionAlign={transitionAlign}
        >
          {stack.map((props, index) => {
            const scene = scenes.find((s) => s.name === props.name);
            if (!scene) {
              throw new Error(`Unknown scene: ${props.name}`);
            }

            const { children, ...remaining } = props.props ?? {};

            return (
              <SceneComponent
                key={props.id}
                top={props.top}
                animTop={props.animTop}
                index={index}
                initialX={props.initialX}
                targetX={props.targetX}
                initialOpacity={props.initialOpacity}
                targetOpacity={props.targetOpacity}
                onAnimEnd={props.onAminEnd}
                transitionAlign={transitionAlign}
                springConfig={springConfig}
              >
                <scene.element {...remaining}>{children}</scene.element>
              </SceneComponent>
            );
          })}
        </VerticalResizeTransition>
      </SceneTransitionContextBase.Provider>
    );
  }
);

const SceneComponent: FunctionComponent<{
  top: boolean;
  animTop: SpringValue<boolean>;
  index: number;
  initialX: number;
  targetX: number;
  initialOpacity: number;
  targetOpacity: number;
  onAnimEnd?: () => void;
  transitionAlign?: "top" | "bottom" | "center";

  springConfig?: SpringConfig;
}> = ({
  children,
  animTop,
  index,
  initialX,
  targetX,
  initialOpacity,
  targetOpacity,
  onAnimEnd,
  transitionAlign,

  springConfig,
}) => {
  const opacity = useSpringValue<number>(initialOpacity);
  useEffect(() => {
    opacity.start(targetOpacity);
  }, [opacity, targetOpacity]);

  const x = useSpringValue<number>(initialX, {
    config: springConfig,
  });

  const onAnimEndRef = useRef(onAnimEnd);
  onAnimEndRef.current = onAnimEnd;

  useEffect(() => {
    x.start(targetX, {
      onRest: onAnimEndRef.current,
    });
  }, [targetX, x]);

  /*
   Styling should satisfy below logic
    const translateY = (() => {
      if (top) {
        return "0";
      }

      if (transitionAlign !== "center") {
        return "0";
      }

      return "-50";
    })();

   ...(() => {
      if (top) {
        return;
      }

      switch (transitionAlign) {
        case "center":
          return {
            top: "50%",
          };
        case "bottom":
          return {
            bottom: 0,
          };
        default:
          return {
            top: 0,
          };
      }
    })(),

    ${({ top }) => {
      if (top) {
        return css`
          position: relative;
          left: auto;
          right: auto;

          pointer-events: auto;
        `;
      } else {
        return css`
          position: absolute;
          left: 0;
          right: 0;

          pointer-events: none;
        `;
      }
    }}
   */

  return (
    <Styles.Container
      zIndex={index + 1}
      transitionAlign={transitionAlign}
      style={{
        position: animTop.to((top) => {
          if (top) {
            return "relative";
          } else {
            return "absolute";
          }
        }),
        top: animTop.to((top) => {
          if (top) {
            return "auto";
          } else {
            if (transitionAlign === "center") {
              return "50%";
            }
            return "0";
          }
        }),
        bottom: animTop.to((top) => {
          if (top) {
            return "auto";
          } else {
            if (transitionAlign === "bottom") {
              return "0";
            }
            return "auto";
          }
        }),
        left: animTop.to((top) => {
          if (top) {
            return "auto";
          } else {
            return "0";
          }
        }),
        right: animTop.to((top) => {
          if (top) {
            return "auto";
          } else {
            return "0";
          }
        }),
        pointerEvents: animTop.to((top) => {
          if (top) {
            return "auto";
          } else {
            return "none";
          }
        }),
        opacity: opacity,
        transform: to([x, animTop], (...args) => {
          let x = args[0] as number;
          const top = args[1] as boolean;

          x = x * 100;
          x = Math.max(x, -100);
          x = Math.min(x, 100);

          let y = 0;

          if (!top) {
            if (transitionAlign !== "center") {
              y = 0;
            } else {
              y = -50;
            }
          }

          return `translate(${x}%, ${y}%)`;
        }),
      }}
    >
      <Styles.Element>{children}</Styles.Element>
    </Styles.Container>
  );
};
