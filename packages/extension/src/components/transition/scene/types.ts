import { Scene, SceneTransitionBaseProps } from "./internal";

export type SceneTransitionProps = {
  width?: string;
} & Omit<SceneTransitionBaseProps, "width">;

export interface FixedWidthScene extends Scene {
  width: string;
}

export type FixedWidthSceneTransitionProps = Omit<
  SceneTransitionBaseProps<FixedWidthScene>,
  "width"
>;
