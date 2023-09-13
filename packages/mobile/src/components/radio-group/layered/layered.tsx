import React, {FunctionComponent} from 'react';
import {RadioGroupProps} from '../types';
import {Skeleton} from '../../skeleton';
import {
  DimensionValue,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {useStyle} from '../../../styles';

export const LayeredHorizontalRadioGroup: FunctionComponent<
  RadioGroupProps & {
    isNotReady?: boolean;
  }
> = ({
  style: containerStyleProp,
  size = 'default',
  items,
  selectedKey,
  itemMinWidth,
  isNotReady = false,
  onSelect,
}) => {
  const style = useStyle();

  const itemStyle = getRadioItemStyle({
    itemMinWidth,
    size,
  });
  const containerStyle = (() => {
    let containerStyle: ViewStyle = {};

    if (!isNotReady) {
      containerStyle = {
        ...containerStyle,
        shadowColor: 'rgba(43, 39, 55, 0.1)',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowRadius: 4,
      };
    }

    switch (size) {
      case 'large': {
        containerStyle = {
          ...containerStyle,
          height: 38,
          borderRadius: 19,
          paddingHorizontal: 2.5,
        };
        break;
      }
      default: {
        containerStyle = {
          ...containerStyle,
          height: 30,
          borderRadius: 15,
          paddingHorizontal: 2,
        };
        break;
      }
    }

    return containerStyle;
  })();

  return (
    <Skeleton type="circle" isNotReady={isNotReady}>
      <View
        style={StyleSheet.flatten([
          style.flatten([
            'flex-row',
            'items-center',
            'justify-center',
            'background-color-gray-600',
          ]),
          containerStyleProp,
          containerStyle,
        ])}>
        {items.map(item => {
          const selected = item.key === selectedKey;
          const textStyle = (() => {
            switch (size) {
              case 'large':
                if (selected) {
                  return ['subtitle3', 'color-white'];
                }
                return ['body2', 'color-gray-300'];
              default:
                if (selected) {
                  return ['text-caption1', 'color-white'];
                }
                return ['text-caption2', 'color-gray-300'];
            }
          })();

          return (
            <Pressable
              style={StyleSheet.flatten([
                style.flatten(
                  ['relative', 'flex-row', 'items-center', 'justify-center'],
                  [
                    selected
                      ? 'background-color-gray-400'
                      : 'background-color-gray-600',
                  ],
                ),
                itemStyle,
              ])}
              key={item.key}
              onPress={e => {
                e.preventDefault();
                onSelect(item.key);
              }}>
              <Text style={style.flatten([...(textStyle as any)])}>
                {item.text}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Skeleton>
  );
};

interface GetRadioItemStyleProps {
  size?: 'default' | 'large';
  itemMinWidth?: DimensionValue;
}
const getRadioItemStyle = ({
  size = 'default',
  itemMinWidth,
}: GetRadioItemStyleProps) => {
  let style: ViewStyle = {
    minWidth: itemMinWidth,
    flex: itemMinWidth ? undefined : 1,
  };

  switch (size) {
    case 'large': {
      style = {
        ...style,
        height: 33,
        borderRadius: 16.5,
        paddingHorizontal: 10,
      };
      break;
    }
    default: {
      style = {
        ...style,
        height: 26,
        borderRadius: 13,
        paddingHorizontal: 10,
      };
      break;
    }
  }

  return style;
};
