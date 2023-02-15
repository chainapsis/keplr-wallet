import { SpringValue } from "@react-spring/web";
import { SceneProps } from "../types";

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
