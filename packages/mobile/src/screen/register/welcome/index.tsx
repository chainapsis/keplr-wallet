import React, {FunctionComponent, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Box} from '../../../components/box';
import LottieView from 'lottie-react-native';
import {useStyle} from '../../../styles';
import {StyleSheet, Text} from 'react-native';
import {Gutter} from '../../../components/gutter';
import {XAxis} from '../../../components/axis';
import {Toggle} from '../../../components/toggle';
import {Button} from '../../../components/button';
import {useStore} from '../../../stores';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../navigation';

export const WelcomeScreen: FunctionComponent = observer(() => {
  const {keychainStore} = useStore();
  const style = useStyle();
  const route = useRoute<RouteProp<RootStackParamList, 'Register.Welcome'>>();
  const {password} = route.params;
  const navigation = useNavigation<StackNavProp>();

  const [isBiometricOn, setIsBiometricOn] = useState(false);

  return (
    <Box alignX="center" alignY="center" style={style.flatten(['flex-1'])}>
      <Box width={300} alignX="center">
        <Box borderRadius={40} style={{overflow: 'hidden'}}>
          <LottieView
            source={require('../../../public/assets/lottie/register/congrats.json')}
            style={{width: 300, height: 300}}
            autoPlay
            loop
          />
        </Box>

        <Gutter size={30} />

        <Text style={style.flatten(['mobile-h1', 'color-text-high'])}>
          You’re all set!
        </Text>

        <Gutter size={20} />

        <Text
          style={StyleSheet.flatten([
            style.flatten(['body1', 'color-text-low', 'padding-10']),
            {textAlign: 'center'},
          ])}>
          Your cosmic interchain journey now begins
        </Text>

        <Gutter size={30} />

        {password && keychainStore.isBiometrySupported ? (
          <XAxis alignY="center">
            <Text
              style={style.flatten([
                'subtitle1',
                'color-text-middle',
                'flex-1',
              ])}>
              Enable Biometric
            </Text>

            <Toggle isOpen={isBiometricOn} setIsOpen={setIsBiometricOn} />
          </XAxis>
        ) : null}

        <Gutter size={50} />

        <Button
          text="Done"
          size="large"
          containerStyle={{width: '100%'}}
          onPress={async () => {
            if (password && isBiometricOn) {
              await keychainStore.turnOnBiometry(password);
            }

            navigation.reset({routes: [{name: 'Home'}]});
          }}
        />
      </Box>
    </Box>
  );
});
