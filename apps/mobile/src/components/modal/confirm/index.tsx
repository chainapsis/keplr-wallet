import React, {FunctionComponent, PropsWithChildren} from 'react';
import {registerModal} from '../v2';
import Reanimated, {useAnimatedStyle} from 'react-native-reanimated';
import {useStyle} from '../../../styles';

export const registerConfirmModal: <P>(
  element: React.ElementType<P>,
) => FunctionComponent<
  P & {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
  }
> = (element, options = {}) => {
  return registerModal(element, {
    align: 'center',
    container: ConfirmModalBase,
    containerProps: {
      options,
    },
  });
};

export const ConfirmModalBase: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const style = useStyle();

  const backgroundColor = style.get('color-gray-600').color;
  const innerContainerStyle = useAnimatedStyle(() => {
    return {
      marginHorizontal: 16,
      borderRadius: 8,
      backgroundColor: backgroundColor,
    };
  });

  return (
    <Reanimated.View style={innerContainerStyle}>{children}</Reanimated.View>
  );
};
