import { SpringValue } from "@react-spring/web";
import { ElementType } from "react";

export interface ScenePropsInternalTypes extends SceneProps {
  id: string;
  top: boolean;
  animTop: SpringValue<boolean>;
  initialX: number;
  targetX: number;
  initialOpacity: number;
  targetOpacity: number;
  // TODO: Improve handling of scene width
  sceneWidth?: string | SpringValue<string>;
  detached: boolean;
  onAminEnd?: () => void;
}

export interface SceneTransitionBaseProps<S extends Scene = Scene> {
  scenes: S[];
  initialSceneProps: SceneProps;

  width?: string | SpringValue<string>;
  transitionAlign?: "top" | "bottom" | "center";
  transitionMode?: "x-axis" | "opacity"; // Default: x-axis
}

export interface SceneTransitionContext {
  push(name: string, props?: Record<string, any>): void;
  replace(name: string, props?: Record<string, any>): void;
  replaceAll(name: string, props?: Record<string, any>): void;
  pop(): void;
  canPop(): boolean;
  setCurrentSceneProps(props: Record<string, any>): void;
  readonly stack: ReadonlyArray<string>;
  readonly currentScene: string;
}

export interface SceneTransitionRef {
  push(name: string, props?: Record<string, any>): void;
  replace(name: string, props?: Record<string, any>): void;
  replaceAll(name: string, props?: Record<string, any>): void;
  pop(): void;
  canPop(): boolean;
  setCurrentSceneProps(props: Record<string, any>): void;
  readonly stack: ReadonlyArray<string>;
  readonly currentScene: string;
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

export interface SceneEventsContext {
  setEvents(events: SceneEvents): void;
}

export interface SceneEvents {
  onWillVisible?: () => void;
  onDidVisible?: () => void;

  onWillInvisible?: () => void;
  onDidInvisible?: () => void;
}

export interface FixedWidthSceneContext {
  setWidth(width: string): void;
}
