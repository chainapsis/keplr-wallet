import React, { forwardRef, useEffect, useRef } from "react";
import { FixedWidthSceneTransitionProps } from "./types";
import {
  SceneTransitionRef,
  useSceneTransitionBase,
  SceneTransitionBaseInner,
} from "./internal";
import { useSpringValue } from "@react-spring/web";

// eslint-disable-next-line react/display-name
export const FixedWidthSceneTransition = forwardRef<
  SceneTransitionRef,
  FixedWidthSceneTransitionProps
>((props, ref) => {
  const base = useSceneTransitionBase(props, ref);

  const sceneWidth = (() => {
    const scene = props.scenes.find((s) => s.name === base.topScene?.name);
    if (scene) {
      return scene.width;
    }
    return "0";
  })();

  const lastSceneWidthRef = useRef<string>(sceneWidth);
  const animWidth = useSpringValue(sceneWidth, {
    config: props.springConfig,
  });

  useEffect(() => {
    if (lastSceneWidthRef.current !== sceneWidth) {
      animWidth.start(sceneWidth);
      lastSceneWidthRef.current = sceneWidth;
    }
  }, [animWidth, sceneWidth]);

  return <SceneTransitionBaseInner {...props} {...base} width={animWidth} />;
});
