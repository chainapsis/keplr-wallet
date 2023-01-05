import React from "react";
import { isFragment } from "react-is";

export function flattenFragment(children: React.ReactNode): React.ReactNode {
  while (isFragment(children)) {
    children = children.props.children;
  }
  return children;
}
