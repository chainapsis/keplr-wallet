import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import React, {
  forwardRef,
  FunctionComponent,
  PropsWithChildren,
  useCallback,
} from 'react';
import {useStyle} from '../../styles';

import {
  NativeStackNavigationOptions,
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import {NavigationContainer} from '@react-navigation/native';
import {StyleSheet, Text, TextStyle, ViewStyle} from 'react-native';
import {Box} from '../box';

interface ModalProps {
  isDetachedModal?: boolean;
}

export const Modal = forwardRef<
  BottomSheetModal,
  PropsWithChildren<ModalProps & BottomSheetModalProps & BaseModalProps>
>(({children, snapPoints = ['50%'], isDetachedModal, ...props}, ref) => {
  const style = useStyle();
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
      backgroundStyle={style.flatten(
        ['background-color-gray-600'],
        [isDetachedModal ? 'border-radius-8' : 'border-radius-0'],
      )}
      {...(() =>
        isDetachedModal
          ? {
              detached: true,
              bottomInset: 25,
              style: style.flatten([
                'margin-x-24',
                'border-width-1',
                'border-radius-8',
                'border-color-gray-500',
              ]),
            }
          : {})()}
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
  screenOptions = {
    title: '',
    headerBackTitle: '',
  },
  initialRouteName,
  screenList,
}: BaseModalProps) => {
  const style = useStyle();
  return (
    <NavigationContainer independent={true}>
      <BottomSheetStack.Navigator
        screenOptions={{
          contentStyle: style.flatten(['background-color-gray-600']),
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
    <Box paddingBottom={12} style={StyleSheet.flatten([headerStyle])}>
      <Text
        style={StyleSheet.flatten([
          style.flatten(['color-white', 'text-center', 'subtitle1']),
          titleStyle,
        ])}>
        {title}
      </Text>
    </Box>
  );
};
