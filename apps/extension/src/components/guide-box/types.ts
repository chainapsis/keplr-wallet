import React from "react";

export type GuideBoxColor = "default" | "safe" | "warning" | "danger";

export interface GuideBoxProps {
  title: string;
  paragraph?: string | React.ReactNode;
  bottom?: React.ReactNode;
  titleRight?: React.ReactNode;
  color?: GuideBoxColor;

  hideInformationIcon?: boolean;
  backgroundColor?: string;
}
