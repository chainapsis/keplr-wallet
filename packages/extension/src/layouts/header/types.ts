import { ReactNode } from "react";
import { ButtonProps } from "../../components/button";

export interface HeaderProps {
  title: string;
  left?: ReactNode;
  right?: ReactNode;

  /**
   * @deprecated `bottomButton`를 쓰고 나중에 bottom prop은 없애자
   */
  bottom?: ReactNode;
  // TODO: 나중에 아래 버튼이 여러개 필요해지면 배열로 만들자...
  bottomButton?: ButtonProps;

  fixedHeight?: boolean;
}
