import { SpringValue } from "@react-spring/web";
import { IDescendantRegistry } from "./internal";

export interface VerticalResizeTransitionProps {
  width?: string | SpringValue<string>;
  transitionAlign?: "top" | "bottom" | "center";

  // nested vertical resize를 다룰때 사용된다.
  // 근데 사실 scene transition에서 필요해서 만들어진 prop이라 다른 경우에는 쓸모가 없다.
  // 먼가 더 나은 방법으로 변경되어야 할 것 같긴 한데...
  // 어쨋든 사실상 scene transition 전용이라 머라 설명할 게 없다...
  // 내부로직을 좀 알아야지 처리가 가능하다.
  // 이 값은 생명주기 동안 유지되어야함에 주의할 것
  registry?: IDescendantRegistry;
}
