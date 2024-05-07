import React from 'react';
import {registerCardModal} from './card';
import {Box} from '../box';
import {SVGLoadingIcon} from '../spinner';

export const LoadingModal = registerCardModal(() => {
  return (
    <Box paddingY={32} alignX="center">
      <SVGLoadingIcon size={30} color="white" />
    </Box>
  );
});
