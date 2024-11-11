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

  displayFlex?: boolean;
  fixedHeight?: boolean;
  fixedMinHeight?: boolean;

  additionalPaddingBottom?: string;

  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  isNotReady?: boolean;

  headerContainerStyle?: React.CSSProperties;

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
