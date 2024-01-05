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
import {useIntl} from 'react-intl';

const ArrowDownIconFunc = (color: string) => (
  <ArrowDownIcon size={16} color={color} />
);
const ArrowUpIconFunc = (color: string) => (
  <ArrowUpIcon size={16} color={color} />
);

export const CollapsibleList: FunctionComponent<CollapsibleListProps> = ({
  title,
  items,
  hideLength,
  itemKind,
  lenAlwaysShown,
}) => {
  if (!lenAlwaysShown || lenAlwaysShown < 0) {
    lenAlwaysShown = items.length;
  }

  const style = useStyle();
  const intl = useIntl();

  const [isCollapsed, setIsCollapsed] = useState(true);

  const alwaysShown = items.slice(0, lenAlwaysShown);
  const hidden = items.slice(lenAlwaysShown);

  return (
    <Stack>
      <Box marginBottom={8} paddingX={6}>
        <Columns sum={1} alignY="center">
          {!hideLength ? (
            <Text style={style.flatten(['subtitle3', 'color-text-high'])}>
              {items.length}
            </Text>
          ) : null}
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
            containerStyle={style.flatten(['padding-y-12'])}
            textColor={style.get('color-gray-300').color}
            pressingColor={style.get('color-gray-400').color}
            size="large"
            text={
              isCollapsed
                ? intl.formatMessage(
                    {id: `components.collapsible-list.view-more-${itemKind}`},
                    {remain: hidden.length},
                  )
                : intl.formatMessage({
                    id: 'components.collapsible-list.collapse',
                  })
            }
            rightIcon={isCollapsed ? ArrowDownIconFunc : ArrowUpIconFunc}
            onPress={() => {
              setIsCollapsed(!isCollapsed);
            }}
          />
          <Gutter size={12} />
        </Box>
      ) : null}
    </Stack>
  );
};
