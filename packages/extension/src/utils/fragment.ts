import { Children, ReactNode } from "react";
import { isFragment } from "react-is";

export function flattenFragment(node: ReactNode): typeof children {
  const children = Children.toArray(node);
  return children.reduce<typeof children>((arr, child) => {
    if (isFragment(child)) {
      if (child.props.children) {
        return arr.concat(flattenFragment(child.props.children));
      } else {
        return arr;
      }
    }
    arr.push(child);
    return arr;
  }, []);
}
