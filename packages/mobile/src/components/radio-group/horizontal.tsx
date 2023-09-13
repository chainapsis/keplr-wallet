import React, {FunctionComponent} from 'react';
import {RadioGroupProps} from './types';
import {Gutter} from '../gutter';
import {
  DimensionValue,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {useStyle} from '../../styles';

export const HorizontalRadioGroup: FunctionComponent<RadioGroupProps> = ({
  style: containerStyleProp,
  size = 'default',
  items,
  selectedKey,
  itemMinWidth,
  onSelect,
}) => {
  const style = useStyle();
  const itemStyle = getRadioItemStyle({
    itemMinWidth,
    size,
  });
  const containerStyle = (() => {
    let containerStyle: ViewStyle = {};

    switch (size) {
      case 'large': {
        containerStyle = {
          ...containerStyle,
          height: 42,
          borderRadius: 21,
        };
        break;
      }
      default: {
        containerStyle = {
          ...containerStyle,
          height: 36,
          borderRadius: 18,
        };
        break;
      }
    }

    return containerStyle;
  })();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten([
          'flex-row',
          'items-center',
          'justify-center',
          'background-color-gray-700',
        ]),
        containerStyleProp,
        containerStyle,
      ])}>
      <Gutter size={4} />
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
          <React.Fragment key={item.key}>
            <Pressable
              style={StyleSheet.flatten([
                style.flatten(
                  ['relative', 'flex-row', 'items-center', 'justify-center'],
                  [
                    selected
                      ? 'background-color-gray-600'
                      : 'background-color-gray-700',
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
            <Gutter size={4} />
          </React.Fragment>
        );
      })}
    </View>
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
        height: 34,
        borderRadius: 17,
        paddingHorizontal: 12,
      };
      break;
    }
    default: {
      style = {
        ...style,
        height: 28,
        borderRadius: 14,
        paddingHorizontal: 10,
      };
      break;
    }
  }

  return style;
};
