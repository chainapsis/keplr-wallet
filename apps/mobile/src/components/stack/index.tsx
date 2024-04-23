import React, {
  FunctionComponent,
  Children,
  isValidElement,
  PropsWithChildren,
} from 'react';
import {Gutter} from '../gutter';
import {flattenFragment} from '../../utils';
import {View} from 'react-native';
import {useStyle} from '../../styles';

export interface StackProps {
  gutter?: number;
  alignX?: 'left' | 'right' | 'center';
}

export const Stack: FunctionComponent<PropsWithChildren<StackProps>> = ({
  children,
  gutter,
  alignX,
}) => {
  const style = useStyle();
  const array = Children.toArray(flattenFragment(children));
  const alignItems = (() => {
    switch (alignX) {
      case 'left':
        return 'items-start';
      case 'right':
        return 'items-end';
      case 'center':
        return 'items-center';
      default:
    }
  })();
  return (
    <View
      style={style.flatten(
        ['flex-column'],
        [alignItems && (alignItems as any)],
      )}>
      {array.map((child, i) => {
        if (isValidElement(child) && child.type === Gutter) {
          return <React.Fragment key={i}>{child}</React.Fragment>;
        }

        if (!gutter || i === array.length - 1) {
          return <React.Fragment key={i}>{child}</React.Fragment>;
        }

        if (i + 1 < array.length) {
          const next = array[i + 1];
          if (isValidElement(next) && next.type === Gutter) {
            return <React.Fragment key={i}>{child}</React.Fragment>;
          }
        }

        return (
          <React.Fragment key={i}>
            {child}
            <Gutter size={gutter} direction="vertical" />
          </React.Fragment>
        );
      })}
    </View>
  );
};
