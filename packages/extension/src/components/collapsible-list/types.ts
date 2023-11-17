import React from "react";

export interface CollapsibleListProps {
  title: React.ReactNode;
  items: React.ReactNode[];

  lenAlwaysShown?: number;

  // privacy mode를 위해서 대충 추가됨
  hideNumInTitle?: boolean;
}
