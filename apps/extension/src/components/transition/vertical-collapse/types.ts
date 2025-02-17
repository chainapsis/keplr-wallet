import { SpringConfig } from "@react-spring/web";

export interface VerticalCollapseTransitionProps {
  collapsed: boolean;

  width?: string;
  transitionAlign?: "top" | "bottom" | "center";

  opacityLeft?: number;
  disableOpacityAnimation?: boolean;
  // height, opacity의 animation config 설정
  // 근데 static이라고 해놓은 뜻은
  // 중간에 수정할 수 없고 처음에 설정된 값을 계속 따른다는 뜻임.
  // prop을 바꿔도 반영안됨.
  staticHeightAnimConfig?: SpringConfig;
  staticOpacityAnimConfig?: SpringConfig;
}
