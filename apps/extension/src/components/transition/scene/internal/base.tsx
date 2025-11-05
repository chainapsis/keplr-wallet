import React, {
  FunctionComponent,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  Ref,
  PropsWithChildren,
} from "react";
import { VerticalResizeTransition } from "../../vertical-size";
import { animated, SpringValue, to, useSpringValue } from "@react-spring/web";
import {
  SceneDescendantRegistry,
  SceneDescendantRegistryWrap,
} from "./resize-registry";
import {
  SceneEvents,
  ScenePropsInternalTypes,
  SceneTransitionBaseProps,
  SceneTransitionRef,
} from "./types";
import { SceneEventsContextBase, SceneTransitionContextBase } from "./context";
import { defaultSpringConfig } from "../../../../styles/spring";

export const useSceneTransitionBase = (
  props: SceneTransitionBaseProps,
  ref: Ref<SceneTransitionRef>
) => {
  const { initialSceneProps } = props;

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

  const replace = useCallback((name: string, props?: Record<string, any>) => {
    setStack((prevStack) => {
      seq.current++;

      const newStack = prevStack.slice();

      const prevTop = newStack.find((s) => s.top);
      if (prevTop) {
        prevTop.top = false;
        prevTop.animTop.set(false);
        prevTop.targetX = 0;
        prevTop.targetOpacity = 0;
        prevTop.detached = true;
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
        // XXX: Remove prev scene here because prev scene's x axis animation doesn't start.
        onAminEnd: () => {
          setStack((prevStack) =>
            prevStack.slice().filter((s) => s !== prevTop)
          );
        },
      });

      return newStack;
    });
  }, []);

  const replaceAll = useCallback(
    (name: string, props?: Record<string, any>) => {
      setStack((prevStack) => {
        seq.current++;

        const newStack = prevStack.slice();

        const prevIdMap = new Map<string, true>();
        for (const prev of newStack) {
          prevIdMap.set(prev.id, true);

          prev.detached = true;
        }

        const prevTop = newStack.find((s) => s.top);
        if (prevTop) {
          prevTop.top = false;
          prevTop.animTop.set(false);
          // `replaceAll` has same transition as `push`.
          // This is intentional.
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
          // XXX: Remove prev scene here because prev scene's x axis animation doesn't start.
          onAminEnd: () => {
            setStack((prevStack) =>
              prevStack.slice().filter((s) => !prevIdMap.get(s.id))
            );
          },
        });

        return newStack;
      });
    },
    []
  );

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

  const setCurrentSceneProps = useCallback((props: Record<string, any>) => {
    setStack((stack) => {
      const currentScenes = stack.filter((s) => !s.detached);
      if (currentScenes.length > 0) {
        const currentScene = currentScenes[currentScenes.length - 1];
        currentScene.props = props;
        // Force re-render
        return stack.slice();
      }

      return stack;
    });
  }, []);

  const notDetachedStackNames = useMemo(() => {
    return stack.filter((s) => !s.detached).map((s) => s.name);
  }, [stack]);

  useImperativeHandle(
    ref,
    () => ({
      push,
      pop,
      replace,
      replaceAll,
      setCurrentSceneProps,
      canPop(): boolean {
        return notDetachedStackNames.length > 1;
      },
      get stack(): ReadonlyArray<string> {
        return notDetachedStackNames;
      },
      currentScene:
        notDetachedStackNames[notDetachedStackNames.length - 1] ?? "",
      addSceneChangeListener(listener: (stack: ReadonlyArray<string>) => void) {
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
    [
      notDetachedStackNames,
      pop,
      push,
      replace,
      replaceAll,
      setCurrentSceneProps,
    ]
  );

  useEffect(() => {
    for (const listener of sceneChangeListeners.current) {
      listener(notDetachedStackNames);
    }
  }, [notDetachedStackNames]);

  const topScene = stack.find((s) => s.top);
  const [registry] = useState(
    () => new SceneDescendantRegistry(topScene?.id ?? "")
  );
  // XXX: registry not handle component state.
  //      Below never make re-render.
  registry.setTopSceneId(topScene?.id ?? "");

  return {
    push,
    pop,
    replace,
    replaceAll,
    setCurrentSceneProps,
    stack,
    topScene,
    notDetachedStackNames,
    registry,
  };
};

// eslint-disable-next-line react/display-name
export const SceneTransitionBase = forwardRef<
  SceneTransitionRef,
  SceneTransitionBaseProps
>((props, ref) => {
  const base = useSceneTransitionBase(props, ref);

  return <SceneTransitionBaseInner {...props} {...base} />;
});

export const SceneTransitionBaseInner: FunctionComponent<
  Pick<
    SceneTransitionBaseProps,
    | "width"
    | "scenes"
    | "transitionAlign"
    | "transitionMode"
    | "transitionContainerStyle"
  > &
    ReturnType<typeof useSceneTransitionBase>
> = ({
  width,
  scenes,
  transitionAlign,
  transitionMode,
  push,
  pop,
  replace,
  replaceAll,
  setCurrentSceneProps,
  stack,
  notDetachedStackNames,
  registry,
  transitionContainerStyle,
}) => {
  return (
    <SceneTransitionContextBase.Provider
      value={{
        push,
        pop,
        replace,
        replaceAll,
        setCurrentSceneProps,
        canPop(): boolean {
          return notDetachedStackNames.length > 1;
        },
        stack: notDetachedStackNames,
        currentScene:
          notDetachedStackNames[notDetachedStackNames.length - 1] ?? "",
      }}
    >
      <VerticalResizeTransition
        style={transitionContainerStyle}
        width={width}
        transitionAlign={transitionAlign}
        registry={registry}
      >
        {stack.map((props, index) => {
          const scene = scenes.find((s) => s.name === props.name);
          if (!scene) {
            throw new Error(`Unknown scene: ${props.name}`);
          }

          const { children, ...remaining } = props.props ?? {};

          return (
            <SceneDescendantRegistryWrap
              key={props.id}
              sceneId={props.id}
              parentRegistry={registry}
            >
              <SceneComponent
                top={props.top}
                animTop={props.animTop}
                index={index}
                initialX={props.initialX}
                targetX={props.targetX}
                initialOpacity={props.initialOpacity}
                targetOpacity={props.targetOpacity}
                onAnimEnd={props.onAminEnd}
                transitionAlign={transitionAlign}
                transitionMode={transitionMode}
                sceneWidth={props.sceneWidth}
              >
                <scene.element {...remaining}>{children}</scene.element>
              </SceneComponent>
            </SceneDescendantRegistryWrap>
          );
        })}
      </VerticalResizeTransition>
    </SceneTransitionContextBase.Provider>
  );
};

const SceneComponent: FunctionComponent<
  PropsWithChildren<{
    top: boolean;
    animTop: SpringValue<boolean>;
    index: number;
    initialX: number;
    targetX: number;
    initialOpacity: number;
    targetOpacity: number;
    onAnimEnd?: () => void;
    transitionAlign?: "top" | "bottom" | "center";
    transitionMode?: "x-axis" | "opacity";

    sceneWidth?: string | SpringValue<string>;
  }>
> = ({
  children,
  animTop,
  index,
  initialX,
  targetX,
  initialOpacity,
  targetOpacity,
  onAnimEnd,
  transitionAlign,
  transitionMode = "x-axis",
  sceneWidth,
}) => {
  const eventsRef = useRef<SceneEvents | null>(null);

  const opacity = useSpringValue<number>(initialOpacity, {
    config: defaultSpringConfig,
  });
  useEffect(() => {
    opacity.start(targetOpacity, {
      delay: transitionMode === "opacity" && targetOpacity === 1 ? 100 : 0,
    });
  }, [opacity, targetOpacity, transitionMode]);

  const x = useSpringValue<number>(initialX, {
    config: defaultSpringConfig,
  });

  const onAnimEndRef = useRef(onAnimEnd);
  onAnimEndRef.current = onAnimEnd;

  useEffect(() => {
    if (targetX === 0) {
      eventsRef.current?.onWillVisible?.();
      // TODO: On initial scene, the animation doesn't start, thus `onDidVisible` is not called.
      //       This is a bug. However, currently, it is fine because its feature is not used.
      //       Fix it later.
      //       And also, there is a similar problem to `replace`.
    } else {
      eventsRef.current?.onWillInvisible?.();
    }

    x.start(targetX, {
      onRest: () => {
        onAnimEndRef.current?.();

        if (targetX === 0) {
          eventsRef.current?.onDidVisible?.();
        } else {
          eventsRef.current?.onDidInvisible?.();
        }
      },
    });
  }, [targetX, x]);

  const eventPerRendering: SceneEvents[] = [];

  return (
    <SceneEventsContextBase.Provider
      value={{
        setEvents(events: SceneEvents) {
          eventPerRendering.push(events);

          eventsRef.current = {
            onWillVisible: () => {
              for (const e of eventPerRendering) {
                e.onWillVisible?.();
              }
            },
            onDidVisible: () => {
              for (const e of eventPerRendering) {
                e.onDidVisible?.();
              }
            },
            onWillInvisible: () => {
              for (const e of eventPerRendering) {
                e.onWillInvisible?.();
              }
            },
            onDidInvisible: () => {
              for (const e of eventPerRendering) {
                e.onDidInvisible?.();
              }
            },
          };
        },
      }}
    >
      <animated.div
        style={{
          display: "grid",
          gridTemplateColumns: "100%",
          zIndex: index + 1,
          width: to([sceneWidth], (sceneWidth) => {
            return sceneWidth || "100%";
          }),
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
              if (transitionAlign === "bottom") {
                return "auto";
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
          left: to([animTop, x, sceneWidth], (top, x, sceneWidth) => {
            if (sceneWidth) {
              if (x != null) {
                x = x as number;
                if (x > 0) {
                  x = x * 100;
                  return `${x}%`;
                }
              }
              return "auto";
            }

            if (top) {
              return "auto";
            } else {
              return "0";
            }
          }),
          right: to([animTop, x, sceneWidth], (top, x, sceneWidth) => {
            if (sceneWidth) {
              if (x != null) {
                x = x as number;
                if (x < 0) {
                  x = x * 100 * -1;
                  return `${x}%`;
                }
              }
              return "auto";
            }

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
          transform: to([x, animTop, sceneWidth], (...args) => {
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

            if (transitionMode !== "x-axis") {
              return `translate(0%, ${y}%)`;
            }

            if (args[2]) {
              return `translate(0%, ${y}%)`;
            }

            return `translate(${x}%, ${y}%)`;
          }),
        }}
      >
        <animated.div
          style={{
            gridRowStart: 1,
            gridColumnStart: 1,
          }}
        >
          {children}
        </animated.div>
      </animated.div>
    </SceneEventsContextBase.Provider>
  );
};
