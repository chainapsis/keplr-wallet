import React, {FunctionComponent, useState} from 'react';
import {CollapsibleListProps} from './types';
import {Stack} from '../stack';
import {Box} from '../box';
import {useStyle} from '../../styles';
import {Columns} from '../column';
import {Gutter} from '../gutter';
import {Text} from 'react-native';
import {ArrowDownIcon} from '../icon/arrow-down';
import {ArrowUpIcon} from '../icon/arrow-up';
import {TextButton} from '../text-button';

export const CollapsibleList: FunctionComponent<CollapsibleListProps> = ({
  title,
  items,
  lenAlwaysShown,
}) => {
  if (!lenAlwaysShown || lenAlwaysShown < 0) {
    lenAlwaysShown = items.length;
  }

  const style = useStyle();

  const [isCollapsed, setIsCollapsed] = useState(true);

  const alwaysShown = items.slice(0, lenAlwaysShown);
  const hidden = items.slice(lenAlwaysShown);

  return (
    <Stack>
      <Box
        marginBottom={8}
        paddingX={6}
        onClick={e => {
          e.preventDefault();
        }}>
        <Columns sum={1} alignY="center">
          <Text style={style.flatten(['color-gray-50'])}>{items.length}</Text>
          <Gutter size={4} />
          {title}
        </Columns>
      </Box>

      <Stack gutter={8}>{alwaysShown}</Stack>

      {!isCollapsed ? (
        <Box>
          <Gutter size={8} />
          <Stack gutter={8}>{hidden}</Stack>
        </Box>
      ) : null}
      {hidden.length > 0 ? (
        <Box>
          <Gutter size={12} />
          <TextButton
            text={
              isCollapsed ? `View ${hidden.length} more tokens` : 'Collapse'
            }
            rightIcon={
              isCollapsed ? (
                <ArrowDownIcon
                  size={16}
                  color={style.get('color-gray-300').color}
                />
              ) : (
                <ArrowUpIcon
                  size={16}
                  color={style.get('color-gray-300').color}
                />
              )
            }
            onPress={() => {
              setIsCollapsed(!isCollapsed);
            }}
          />
        </Box>
      ) : null}
    </Stack>
  );
};
