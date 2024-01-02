import React, {FunctionComponent} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useStyle} from './src/styles';
import {ContentHeightAwareScrollView} from './src/components/scroll-view';

export const UpdateProgress: FunctionComponent<{
  progress: number;
}> = ({progress}) => {
  const safeAreaInsets = useSafeAreaInsets();
  const style = useStyle();

  return (
    <View style={style.flatten(['absolute-fill', 'background-color-black'])}>
      <View
        style={{
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
          paddingLeft: 28,
          paddingRight: 28,
          flex: 1,
        }}>
        <ContentHeightAwareScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
          }}>
          <View
            style={{
              flex: 10,
            }}
          />
          {/* TODO: Add lottie image? */}
          <View
            style={{
              width: 216,
              height: 216,
              backgroundColor: 'white',
            }}
          />
          <View
            style={{
              flex: 4,
            }}
          />
          <Text style={style.flatten(['h4', 'color-text-high', 'text-center'])}>
            Hey, Cosmonaut! 👋
          </Text>
          <View
            style={{
              flex: 2,
            }}
          />
          <Text
            style={style.flatten([
              'subtitle4',
              'color-gray-200',
              'text-center',
            ])}>
            We have some small yet{'\n'}significant updates ready!
          </Text>
          <View
            style={{
              flex: 3,
            }}
          />
          <Text
            style={style.flatten([
              'subtitle3',
              'color-text-low',
              'text-center',
            ])}>
            Let us set everything up for you..
          </Text>
          <View
            style={{
              flex: 1,
            }}
          />
          <View style={style.flatten(['width-full'])}>
            <ProgressBar progress={progress} />
          </View>
          <View
            style={{
              flex: 1,
            }}
          />
          <Text
            style={style.flatten(['body2', 'color-text-low', 'text-center'])}>
            {`(${Math.floor(progress * 100)}% / 100%)`}
          </Text>
          <View
            style={{
              flex: 10,
            }}
          />
        </ContentHeightAwareScrollView>
      </View>
    </View>
  );
};

export const ProgressBar: FunctionComponent<{
  progress: number;
}> = ({progress = 0}) => {
  const style = useStyle();

  return (
    <View
      style={style.flatten([
        'height-8',
        'background-color-gray-500',
        'border-radius-32',
        'overflow-hidden',
      ])}>
      <View
        style={StyleSheet.flatten([
          style.flatten([
            'height-8',
            'background-color-blue-400',
            'border-radius-32',
          ]),
          {
            width: `${progress}%`,
          },
        ])}
      />
    </View>
  );
};
