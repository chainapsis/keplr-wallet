import { ReactNode } from "react";

export interface HeaderProps {
  title: string;
  left?: ReactNode;
  right?: ReactNode;
  bottom?: ReactNode;
}
