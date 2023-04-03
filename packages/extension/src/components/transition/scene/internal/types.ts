import { SpringConfig, SpringValue } from "@react-spring/web";
import { ElementType } from "react";

export interface ScenePropsInternalTypes extends SceneProps {
  id: string;
  top: boolean;
  animTop: SpringValue<boolean>;
  initialX: number;
  targetX: number;
  initialOpacity: number;
  targetOpacity: number;
  detached: boolean;
  onAminEnd?: () => void;
}

export interface SceneTransitionBaseProps<S extends Scene = Scene> {
  scenes: S[];
  initialSceneProps: SceneProps;

  width?: string | SpringValue<string>;
  transitionAlign?: "top" | "bottom" | "center";

  springConfig?: SpringConfig;
}

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

export interface Scene {
  name: string;
  element: ElementType;
}

export interface SceneProps {
  name: string;
  props?: Record<string, any>;
}
