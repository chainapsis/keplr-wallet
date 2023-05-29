import React, { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { FixedWidthSceneTransitionProps } from "./types";
import {
  SceneTransitionRef,
  useSceneTransitionBase,
  SceneTransitionBaseInner,
} from "./internal";
import { SpringValue, useSpringValue } from "@react-spring/web";
import { defaultSpringConfig } from "../../../styles/spring";

export interface FixedWidthSceneContext {
  setWidth(width: string | undefined): void;
}

export const FixedWidthSceneContextBase =
  React.createContext<FixedWidthSceneContext | null>(null);

export const useFixedWidthScene = () => {
  const context = React.useContext(FixedWidthSceneContextBase);
  if (!context) {
    throw new Error("You have forgot to use FixedWidthSceneProvider");
  }
  return context;
};

// eslint-disable-next-line react/display-name
export const FixedWidthSceneTransition = forwardRef<
  SceneTransitionRef,
  FixedWidthSceneTransitionProps
>((props, ref) => {
  const base = useSceneTransitionBase(props, ref);

  const { stack, ...baseOthers } = base;

  const topSceneName = base.topScene?.name;
  const topSceneId = base.topScene?.id;

  const [sceneAnimWidthRecord, setSceneAnimWidthRecord] = useState<
    Record<
      string,
      | {
          target: string;
          anim: SpringValue<string>;
          willDetach: boolean;
        }
      | undefined
    >
  >({});

  // TODO: SpringValue에서 stop() 메소드를 실행시켜서 clean up을 해야하는데 현재 구조상 그게 어렵다.
  //       그래서 일단은 생략한다... ㅜㅜ

  const propSceneWidthMap = useMemo(() => {
    const map = new Map<string, string>();
    props.scenes.forEach((s) => {
      map.set(s.name, s.width);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    // XXX: To avoid to re-render if `props.scenes` is passed without memoization. Set deps as tricky.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    props.scenes
      .map((s) => [s.name, s.width])
      .map((s) => s[0] + "/" + s[1])
      .join(","),
  ]);

  const topSceneWidth = (() => {
    if (topSceneId) {
      const anim = sceneAnimWidthRecord[topSceneId];
      if (anim && !anim.willDetach) {
        return anim.target;
      }
    }

    if (topSceneName) {
      const width = propSceneWidthMap.get(topSceneName);
      if (width) {
        return width;
      }
    }
    return "0";
  })();

  const lastSceneWidthRef = useRef<string>(topSceneWidth);
  const animWidth = useSpringValue(topSceneWidth, {
    config: defaultSpringConfig,
  });

  useEffect(() => {
    if (lastSceneWidthRef.current !== topSceneWidth) {
      animWidth.start(topSceneWidth);
      lastSceneWidthRef.current = topSceneWidth;
    }
  }, [animWidth, topSceneWidth]);

  const fixedWidthStack = useMemo(() => {
    return stack.map((s) => {
      return {
        ...s,
        sceneWidth: (() => {
          const sceneAnimWidth = sceneAnimWidthRecord[s.id];
          if (sceneAnimWidth) {
            return sceneAnimWidth.anim;
          }

          const propWidth = propSceneWidthMap.get(s.name);
          if (propWidth) {
            return propWidth;
          }
        })(),
      };
    });
  }, [propSceneWidthMap, sceneAnimWidthRecord, stack]);

  const contextSetWidth = (width: string | undefined): void => {
    if (!width) {
      if (topSceneId) {
        const target = sceneAnimWidthRecord[topSceneId];
        if (target && !target.willDetach) {
          const prevWidth = topSceneName
            ? propSceneWidthMap.get(topSceneName)
            : undefined;
          if (prevWidth) {
            setSceneAnimWidthRecord((prev) => {
              const next = { ...prev };
              next[topSceneId] = {
                ...target,
                target: prevWidth,
                willDetach: true,
              };
              return next;
            });
            target.anim.start(prevWidth, {
              onRest: () => {
                setSceneAnimWidthRecord((prev) => {
                  if (!prev[topSceneId]?.willDetach) {
                    return prev;
                  }

                  const next = { ...prev };
                  delete next[topSceneId];

                  // Clean-up
                  prev[topSceneId]?.anim.stop();
                  return next;
                });
              },
            });
          } else {
            setSceneAnimWidthRecord((prev) => {
              const next = { ...prev };
              delete next[topSceneId];

              // Clean-up
              prev[topSceneId]?.anim.stop();
              return next;
            });
          }
        }
      }
      return;
    }

    if (lastSceneWidthRef.current !== width) {
      animWidth.start(width);
      lastSceneWidthRef.current = width;
    }
    if (topSceneId) {
      const target = sceneAnimWidthRecord[topSceneId];
      if (target) {
        if (target.target !== width) {
          setSceneAnimWidthRecord((prev) => {
            const next = { ...prev };
            next[topSceneId] = {
              ...target,
              target: width,
              willDetach: false,
            };
            return next;
          });
          target.anim.start(width);
          return;
        }
      } else {
        const anim = new SpringValue(topSceneWidth, {
          config: defaultSpringConfig,
        });
        setSceneAnimWidthRecord((prev) => {
          const next = { ...prev };
          next[topSceneId] = {
            target: width,
            anim,
            willDetach: false,
          };
          return next;
        });
        anim.start(width);
        return;
      }
    }
  };

  const contextSetWidthRef =
    useRef<FixedWidthSceneContext["setWidth"]>(contextSetWidth);
  contextSetWidthRef.current = contextSetWidth;

  return (
    <FixedWidthSceneContextBase.Provider
      // Should persist ref to avoid infinite re-render.
      value={useMemo(() => {
        return {
          setWidth: (width: string | undefined) => {
            contextSetWidthRef.current(width);
          },
        };
      }, [])}
    >
      <SceneTransitionBaseInner
        {...props}
        {...baseOthers}
        stack={fixedWidthStack}
        width={animWidth}
      />
    </FixedWidthSceneContextBase.Provider>
  );
});
