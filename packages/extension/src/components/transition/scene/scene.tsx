import React, { forwardRef } from "react";
import { SceneTransitionProps } from "./types";
import { SceneTransitionRef, SceneTransitionBase } from "./internal";

// eslint-disable-next-line react/display-name
export const SceneTransition = forwardRef<
  SceneTransitionRef,
  SceneTransitionProps
>((props, ref) => {
  return <SceneTransitionBase {...props} ref={ref} />;
});
