import React, { ReactNode } from "react";
import { ButtonProps } from "../../components/button";
import { SpecialButtonProps } from "../../components/special-button";

export interface HeaderProps {
  title: string | ReactNode;
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
  fixedHeight?: boolean;
  fixedMinHeight?: boolean;

  additionalPaddingBottom?: string;

  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  isNotReady?: boolean;

  headerContainerStyle?: React.CSSProperties;
  contentContainerStyle?: React.CSSProperties;

  // MainHeaderLayout에서만 테스트해봄
  // 다른 props 옵션과 섞였을때 잘 작동되는지는 모름
  // 그냥 MainHeaderLayout 전용이라고 생각할 것.
  fixedTop?: {
    // rem이여야 잘 작동될 확률이 높음.
    // px 등은 테스트 안해봄 될수도 있고 안될수도 있음.
    // 되도록 rem을 사용할 것
    height: string;
    element: React.ReactElement;
  };
}
