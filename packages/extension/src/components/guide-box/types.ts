import React from "react";

export type GuideBoxColor = "default" | "warning" | "danger";

export interface GuideBoxProps {
  title: string;
  paragraph?: string | React.ReactNode;
  bottom?: React.ReactNode;
  titleRight?: React.ReactNode;
  color?: GuideBoxColor;
}
