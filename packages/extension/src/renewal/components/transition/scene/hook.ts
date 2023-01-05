import { SceneTransitionContext } from "./types";
import { SceneTransitionContextBase } from "./internal";
import { useContext } from "react";

export const useSceneTransition = (): SceneTransitionContext => {
  const context = useContext(SceneTransitionContextBase);
  if (!context) {
    throw new Error("Component is not under SceneTransition");
  }

  return context;
};
