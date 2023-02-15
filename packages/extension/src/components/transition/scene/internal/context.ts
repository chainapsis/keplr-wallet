import React from "react";
import { SceneTransitionContext } from "../types";

export const SceneTransitionContextBase = React.createContext<SceneTransitionContext | null>(
  null
);
