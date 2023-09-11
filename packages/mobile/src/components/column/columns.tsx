import React, {
  Children,
  FunctionComponent,
  isValidElement,
  PropsWithChildren,
} from 'react';
import {ColumnsProps} from './types';
import {flattenFragment} from '../../utils';
import {Column} from './column';
import {Gutter} from '../gutter';
import {View} from 'react-native';
import {useStyle} from '../../styles';

export const Columns: FunctionComponent<PropsWithChildren<ColumnsProps>> = ({
  children,
  sum,
  columnAlign,
  alignY = 'center',
  gutter,
}) => {
  const array = Children.toArray(flattenFragment(children));
  const style = useStyle();

  let columnWeightSum = 0;
  array.forEach(child => {
    if (isValidElement(child) && child.type === Column) {
      const weight = child.props.weight;
      if (weight) {
        columnWeightSum += weight;
      }
    }
  });

  const remainingWeight = Math.max(sum - columnWeightSum, 0);
  const align = (() => {
    switch (alignY) {
      case 'top':
        return 'start';
      case 'bottom':
        return 'end';
      case 'center':
        return 'center';
    }
  })();

  return (
    <View style={style.flatten(['flex-row', `items-${align}` as any])}>
      {remainingWeight > 0
        ? (() => {
            if (columnAlign === 'right') {
              return <Column weight={remainingWeight} />;
            }

            if (columnAlign === 'center') {
              return <Column weight={remainingWeight / 2} />;
            }
          })()
        : null}
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
            <Gutter size={gutter} direction="horizontal" />
          </React.Fragment>
        );
      })}
      {remainingWeight > 0
        ? (() => {
            if (columnAlign === 'center') {
              return <Column weight={remainingWeight / 2} />;
            }

            if (columnAlign !== 'right' && columnWeightSum !== 0) {
              return <Column weight={remainingWeight} />;
            }

            return null;
          })()
        : null}
    </View>
  );
};
