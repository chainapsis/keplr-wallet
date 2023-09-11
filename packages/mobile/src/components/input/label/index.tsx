import React, {FunctionComponent} from 'react';
import {useStyle} from '../../../styles';
import {StyleSheet, Text, View, ViewStyle} from 'react-native';
import {SVGLoadingIcon} from '../../spinner';

export const Label: FunctionComponent<{
  content: string;
  isLoading?: boolean;
  style?: ViewStyle;
}> = ({content, isLoading, style: containerStyle}) => {
  const style = useStyle();
  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(['flex-row', 'items-center', 'gap-4']),
        containerStyle,
      ])}>
      <Text
        style={style.flatten(['margin-left-8', 'subtitle3', 'color-gray-100'])}>
        {content}
      </Text>
      {isLoading ? (
        <SVGLoadingIcon size={16} color={style.get('color-gray-300').color} />
      ) : null}
    </View>
  );
};
