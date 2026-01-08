import React, { ReactNode } from "react";
import { ButtonProps } from "../../components/button";
import { SpecialButtonProps } from "../../components/special-button";

export interface HeaderProps {
  title: string | ReactNode;
  titleColor?: string;
  left?: ReactNode;
  right?: ReactNode;

  bottomButtons?: (
    | ({ isSpecial?: false } & ButtonProps)
    | ({ isSpecial: true } & SpecialButtonProps)
  )[];
  animatedBottomButtons?: boolean;
  // animatedBottomButtons과 같이 쓸때
  // button을 동적으로 없애야할 때 사용할 수 있다.
  // 이 값이 true더라도 숨겨만 질 뿐 form에서 사용자가 enter를 치거나 했을때를 막지는 않는다.
  hideBottomButtons?: boolean;

  displayFlex?: boolean;

  additionalPaddingBottom?: string;

  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  isNotReady?: boolean;

  headerContainerStyle?: React.CSSProperties;
  contentContainerStyle?: React.CSSProperties;

  bottomBackground?: React.ReactElement;
}
