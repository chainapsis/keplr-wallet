import { SceneTransitionContextBase } from "./context";
import { useContext } from "react";
import { SceneTransitionContext } from "./types";

export const useSceneTransition = (): SceneTransitionContext => {
  const context = useContext(SceneTransitionContextBase);
  if (!context) {
    throw new Error("Component is not under SceneTransition");
  }

  return context;
};
