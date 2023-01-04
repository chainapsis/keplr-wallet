import React, {
  FunctionComponent,
  ElementType,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from "react";
import { VerticalResizeTransition } from "./vertical-size";
import styled, { css } from "styled-components";
import { animated, SpringConfig, useSpringValue } from "@react-spring/web";

export interface SceneTransitionRef {
  push(name: string, props?: Record<string, any>): void;
  pop(): void;
}

export interface SceneTransitionProps {
  scenes: Scene[];
  initialSceneProps: SceneProps;

  width?: string;
  transitionAlign?: "top" | "middle" | "bottom";

  springConfig?: SpringConfig;
}

export interface Scene {
  name: string;
  element: ElementType;
}

export interface SceneProps {
  name: string;
  props?: Record<string, any>;
}

interface ScenePropsInternalTypes extends SceneProps {
  id: string;
  top: boolean;
  initialX: number;
  targetX: number;
  detached: boolean;
  onAminEnd?: () => void;
}

const Styles = {
  Container: styled(animated.div)<{
    top: boolean;
    zIndex: number;
    transitionAlign?: "top" | "middle" | "bottom";
  }>`
    display: grid;
    grid-template-columns: 1fr;

    z-index: ${({ zIndex }) => zIndex};

    width: 100%;

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

    const [stack, setStack] = useState<ScenePropsInternalTypes[]>([
      {
        ...initialSceneProps,
        id: seq.current.toString(),
        top: true,
        initialX: 0,
        targetX: 0,
        detached: false,
      },
    ]);

    useImperativeHandle(
      ref,
      () => ({
        push(name: string, props?: Record<string, any>) {
          setStack((prevStack) => {
            seq.current++;

            const newStack = prevStack.slice();

            const prevTop = newStack.find((s) => s.top);
            if (prevTop) {
              prevTop.top = false;
              prevTop.targetX = -1;
            }

            newStack.push({
              name,
              props: props,
              id: seq.current.toString(),
              top: true,
              initialX: 1,
              targetX: 0,
              detached: false,
            });

            return newStack;
          });
        },
        pop() {
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
              prevTop.targetX = 1;
              prevTop.detached = true;
              prevTop.onAminEnd = () => {
                setStack((prevStack) =>
                  prevStack.slice().filter((s) => s !== prevTop)
                );
              };
            }

            if (newTop) {
              newTop.top = true;
              newTop.targetX = 0;
            }

            return newStack;
          });
        },
      }),
      []
    );

    return (
      <VerticalResizeTransition width={width} transitionAlign={transitionAlign}>
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
              index={index}
              initialX={props.initialX}
              targetX={props.targetX}
              onAnimEnd={props.onAminEnd}
              transitionAlign={transitionAlign}
              springConfig={springConfig}
            >
              <scene.element {...remaining}>{children}</scene.element>
            </SceneComponent>
          );
        })}
      </VerticalResizeTransition>
    );
  }
);

const SceneComponent: FunctionComponent<{
  top: boolean;
  index: number;
  initialX: number;
  targetX: number;
  onAnimEnd?: () => void;
  transitionAlign?: "top" | "middle" | "bottom";

  springConfig?: SpringConfig;
}> = ({
  children,
  top,
  index,
  initialX,
  targetX,
  onAnimEnd,
  transitionAlign,

  springConfig,
}) => {
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

  const y = (() => {
    if (top) {
      return "0";
    }

    if (transitionAlign !== "middle") {
      return "0";
    }

    return "-50";
  })();

  return (
    <Styles.Container
      top={top}
      zIndex={index}
      transitionAlign={transitionAlign}
      style={{
        ...(() => {
          if (top) {
            return;
          }

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
            };
          }
        })(),
        transform: x
          .to([-1, 1], [-100, 100])
          .to((x) => `translate(${x}%, ${y}%)`),
      }}
    >
      <Styles.Element>{children}</Styles.Element>
    </Styles.Container>
  );
};
