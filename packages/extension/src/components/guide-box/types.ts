import React from "react";

export type GuideBoxColor = "default" | "warning" | "danger";

export interface GuideBoxProps {
  title: string;
  paragraph?: string;
  bottom?: React.ReactNode;
  color?: GuideBoxColor;
}
