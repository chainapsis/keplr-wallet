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
} from "react";
import { VerticalResizeTransition } from "../../vertical-size";
import {
  animated,
  SpringConfig,
  SpringValue,
  to,
  useSpringValue,
} from "@react-spring/web";
import {
  SceneDescendantRegistry,
  SceneDescendantRegistryWrap,
} from "./resize-registry";
import {
  ScenePropsInternalTypes,
  SceneTransitionBaseProps,
  SceneTransitionRef,
} from "./types";
import { SceneTransitionContextBase } from "./context";

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

  const notDetachedStackNames = useMemo(() => {
    return stack.filter((s) => !s.detached).map((s) => s.name);
  }, [stack]);

  useImperativeHandle(
    ref,
    () => ({
      push,
      pop,
      get stack(): ReadonlyArray<string> {
        return notDetachedStackNames;
      },
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
    [notDetachedStackNames, pop, push]
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
    "width" | "scenes" | "transitionAlign" | "springConfig"
  > &
    ReturnType<typeof useSceneTransitionBase>
> = ({
  width,
  scenes,
  transitionAlign,
  springConfig,
  push,
  pop,
  stack,
  notDetachedStackNames,
  registry,
}) => {
  return (
    <SceneTransitionContextBase.Provider
      value={{ push, pop, stack: notDetachedStackNames }}
    >
      <VerticalResizeTransition
        width={width}
        transitionAlign={transitionAlign}
        registry={registry}
      >
        {stack.map((props, index) => {
          const scene = scenes.find((s) => s.name === props.name);
          if (!scene) {
            throw new Error(`Unknown scene: ${props.name}`);
          }

          // TODO: Improve handling of width
          const width: string | undefined = (scene as any).width;

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
                springConfig={springConfig}
                sceneWidth={width}
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

  sceneWidth?: string | SpringValue<string>;

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
  sceneWidth,

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

  return (
    <animated.div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
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
            if (x != null && x > 0) {
              x = (x as number) * 100;
              return `${x}%`;
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
            if (x != null && x < 0) {
              x = (x as number) * 100 * -1;
              return `${x}%`;
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
  );
};
