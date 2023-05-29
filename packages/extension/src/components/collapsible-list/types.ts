import React from "react";

export interface CollapsibleListProps {
  title: React.ReactNode;
  items: React.ReactNode[];

  lenAlwaysShown?: number;
}
