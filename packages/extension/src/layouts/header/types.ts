import React, { ReactNode } from "react";
import { ButtonProps } from "../../components/button";

export interface HeaderProps {
  title: string;
  left?: ReactNode;
  right?: ReactNode;

  // TODO: 나중에 아래 버튼이 여러개 필요해지면 배열로 만들자...
  bottomButton?: ButtonProps;

  fixedHeight?: boolean;

  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}
