import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {useStyle} from '../../../../styles';
import {VerticalCollapseTransition} from '../../../../components/transition';
import {Box} from '../../../../components/box';
import {Text} from 'react-native';

export const WarningGuideBox: FunctionComponent = observer(() => {
  const style = useStyle();

  return (
    <VerticalCollapseTransition collapsed={false}>
      <Box
        padding={18}
        borderRadius={8}
        backgroundColor={style.get('color-yellow-800').color}>
        <Text
          style={style.flatten([
            'subtitle4',
            'color-yellow-400',
            'text-center',
          ])}>
          Error
        </Text>
      </Box>
    </VerticalCollapseTransition>
  );
});
