import React, { ReactNode } from "react";
import { ButtonProps } from "../../components/button";
import { SpecialButtonProps } from "../../components/special-button";

export interface HeaderProps {
  title: string | ReactNode;
  left?: ReactNode;
  right?: ReactNode;

  // TODO: 나중에 아래 버튼이 여러개 필요해지면 배열로 만들자...
  bottomButton?:
    | ({ isSpecial?: false } & ButtonProps)
    | ({ isSpecial: true } & SpecialButtonProps);

  displayFlex?: boolean;
  fixedHeight?: boolean;
  fixedMinHeight?: boolean;

  additionalPaddingBottom?: string;

  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  isNotReady?: boolean;

  headerContainerStyle?: React.CSSProperties;
}
