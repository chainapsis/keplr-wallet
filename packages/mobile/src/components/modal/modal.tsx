import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetBackgroundProps,
  BottomSheetModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
  useMemo,
} from 'react';
import {ColorPalette, useStyle} from '../../styles';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {StyleSheet, Text, TextStyle, View, ViewStyle} from 'react-native';

const CustomBackground: FunctionComponent<BottomSheetBackgroundProps> = ({
  style,
}) => {
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: ColorPalette['gray-600'],
  }));
  const containerStyle = useMemo(
    () => [style, containerAnimatedStyle],
    [style, containerAnimatedStyle],
  );

  return <Animated.View pointerEvents="none" style={containerStyle} />;
};

interface ModalProps {}

export const Modal = forwardRef<
  BottomSheetModal,
  PropsWithChildren<ModalProps & BottomSheetModalProps & BaseModalProps>
>(({children, snapPoints = ['50%'], ...props}, ref) => {
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      backgroundComponent={CustomBackground}
      {...props}>
      {children}
    </BottomSheetModal>
  );
});

const BottomSheetStack = createNativeStackNavigator();
interface BaseModalProps {
  screenOptions?: NativeStackNavigationOptions;
  initialRouteName?: string;
  screenList?: {
    options?: NativeStackNavigationOptions;
    routeName: string;
    scene: FunctionComponent<any>; //모든 타입의 컴포넌트를 받기위해서 any사용
  }[];
}
export const BaseModal = ({
  screenOptions,
  initialRouteName,
  screenList,
}: BaseModalProps) => {
  const style = useStyle();
  return (
    <NavigationContainer independent={true}>
      <BottomSheetStack.Navigator
        screenOptions={{
          contentStyle: style.flatten([
            'background-color-gray-600',
            'light:background-color-gray-600',
          ]),
          ...screenOptions,
        }}
        initialRouteName={initialRouteName}>
        {screenList?.map(screen => {
          return (
            <BottomSheetStack.Screen
              key={screen.routeName}
              options={{
                headerShown: screen.options?.headerShown || false,
                ...screen.options,
              }}
              name={screen.routeName}
              component={screen.scene}
            />
          );
        })}
      </BottomSheetStack.Navigator>
    </NavigationContainer>
  );
};

interface BaseModalHeaderProps {
  title: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
}
export const BaseModalHeader = ({
  title,
  style: headerStyle,
  titleStyle,
}: BaseModalHeaderProps) => {
  const style = useStyle();

  return (
    <View
      style={StyleSheet.flatten([
        style.flatten(['padding-bottom-12']),
        headerStyle,
      ])}>
      <Text
        style={StyleSheet.flatten([
          style.flatten(['color-white', 'text-center', 'subtitle1']),
          titleStyle,
        ])}>
        {title}
      </Text>
    </View>
  );
};
