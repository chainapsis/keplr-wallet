import React, {FunctionComponent} from 'react';
import {Box} from '../../components/box';
import {Gutter} from '../../components/gutter';
import {Columns} from '../../components/column';
import {useStyle} from '../../styles';
import {Text} from 'react-native';

export const MessageItem: FunctionComponent<{
  icon: React.ReactElement;
  title: string | React.ReactElement;
  content: string | React.ReactElement;
}> = ({icon, title, content}) => {
  const style = useStyle();
  return (
    <Box padding={16}>
      <Columns sum={1}>
        <Box alignX="center" alignY="top">
          {icon}
        </Box>

        <Gutter size={8} />

        <Box style={{flexShrink: 1}}>
          <Text style={style.flatten(['color-text-high', 'h5'])}>{title}</Text>
          <Gutter size={2} />
          <Text style={style.flatten(['color-text-middle', 'body3'])}>
            {content}
          </Text>
        </Box>
      </Columns>
    </Box>
  );
};
