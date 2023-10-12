import React, {FunctionComponent} from 'react';
import {View} from 'react-native';
import {useStyle} from '../../styles';

export type BackgroundMode = 'secondary' | 'tertiary' | 'default' | null;

export const ScreenBackground: FunctionComponent<{
  backgroundMode: BackgroundMode;
}> = ({backgroundMode}) => {
  const style = useStyle();

  return backgroundMode ? (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: -100,
        bottom: -100,
      }}>
      {backgroundMode === 'default' ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: style.get('color-background-default').color,
          }}
        />
      ) : backgroundMode === 'secondary' ? (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: style.get('color-background-secondary').color,
          }}
        />
      ) : (
        <View
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: style.get('color-background-tertiary').color,
          }}
        />
      )}
    </View>
  ) : null;
};
