import React from 'react';
import {observer} from 'mobx-react-lite';
import {registerCardModal} from './card';
import {Box} from '../box';
import {useStyle} from '../../styles';
import {Columns} from '../column';
import {Text} from 'react-native';
import {CheckCircleIcon} from '../icon';
import {TouchableWithoutFeedback} from 'react-native-gesture-handler';

export interface ModalMenuItem {
  key: string;
  label: string;
  isClicked?: boolean;
  onSelect: () => any;
  left?: React.ReactNode;
  right?: React.ReactNode;
}
export const MenuModal = registerCardModal(
  observer<{
    modalMenuItems: ModalMenuItem[];
    onPressGeneral?: (item: ModalMenuItem) => void;
  }>(({modalMenuItems, onPressGeneral}) => {
    const style = useStyle();
    return (
      <Box>
        {modalMenuItems.map((item, i) => (
          <TouchableWithoutFeedback
            key={item.key}
            onPress={() => {
              item.onSelect();
              if (onPressGeneral) {
                onPressGeneral(item);
              }
            }}>
            <Box
              height={68}
              alignX="center"
              alignY="center"
              style={style.flatten(
                ['border-width-bottom-1', 'border-color-gray-500'],
                [i === modalMenuItems.length - 1 && 'border-width-bottom-0'], //마지막 요소는 아래 보더 스타일 제가하기 위해서
              )}>
              <Columns sum={1} alignY="center" gutter={8}>
                {item.left && !item.isClicked ? item.left : null}
                <Text
                  numberOfLines={1}
                  style={style.flatten(
                    ['body1', 'color-text-high'],
                    [item.isClicked && 'color-green-400'],
                  )}>
                  {item.label}
                </Text>
                {item.right && !item.isClicked ? item.right : null}
                {item.isClicked ? (
                  <CheckCircleIcon
                    size={18}
                    color={style.get('color-green-400').color}
                  />
                ) : null}
              </Columns>
            </Box>
          </TouchableWithoutFeedback>
        ))}
      </Box>
    );
  }),
  {
    isDetached: true,
  },
);
