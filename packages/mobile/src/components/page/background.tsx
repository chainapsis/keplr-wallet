import React, {FunctionComponent} from 'react';
import {View} from 'react-native';
import {useStyle} from '../../styles';

export type BackgroundMode = 'secondary' | 'default' | null;

export const ScreenBackground: FunctionComponent<{
  backgroundMode: BackgroundMode;

  disableVerticalPadding?: boolean;
}> = ({backgroundMode, disableVerticalPadding}) => {
  const style = useStyle();

  return backgroundMode ? (
    <View
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: disableVerticalPadding ? 0 : -100,
        bottom: disableVerticalPadding ? 0 : -100,
      }}>
      {backgroundMode === 'secondary' ? (
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
            backgroundColor: style.get('color-background-default').color,
          }}
        />
      )}
    </View>
  ) : null;
};
