import React, {FunctionComponent, PropsWithChildren} from 'react';
import {Box} from '../../box';
import {VerticalCollapseTransitionProps} from './types';

//TODO 이후 익스텐션 코드를 참고해서 애니메이션을 구현해야함
export const VerticalCollapseTransition: FunctionComponent<
  PropsWithChildren<
    VerticalCollapseTransitionProps & {
      onTransitionEnd?: () => void;
    }
  >
> = ({children, collapsed}) => {
  return <Box>{!collapsed && children}</Box>;
};
