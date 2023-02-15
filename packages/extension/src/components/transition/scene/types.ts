import { SpringConfig } from "@react-spring/web";
import { ElementType } from "react";

export interface SceneTransitionContext {
  push(name: string, props?: Record<string, any>): void;
  pop(): void;
  readonly stack: ReadonlyArray<string>;
}

export interface SceneTransitionRef {
  push(name: string, props?: Record<string, any>): void;
  pop(): void;
  readonly stack: ReadonlyArray<string>;
  addSceneChangeListener(
    listener: (stack: ReadonlyArray<string>) => void
  ): void;
  removeSceneChangeListener(
    listener: (stack: ReadonlyArray<string>) => void
  ): void;
}

export interface SceneTransitionProps {
  scenes: Scene[];
  initialSceneProps: SceneProps;

  width?: string;
  transitionAlign?: "top" | "bottom" | "center";

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
