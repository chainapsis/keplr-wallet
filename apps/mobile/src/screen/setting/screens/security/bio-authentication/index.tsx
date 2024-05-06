import React, {FunctionComponent, useEffect} from 'react';
import {observer} from 'mobx-react-lite';

import {useStore} from '../../../../../stores';
import {Box} from '../../../../../components/box';

import {useStyle} from '../../../../../styles';
import {useNavigation} from '@react-navigation/native';
import {FormattedMessage, useIntl} from 'react-intl';
import {Controller, useForm} from 'react-hook-form';
import {TextInput} from '../../../../../components/input';
import {Button} from '../../../../../components/button';
import {Stack} from '../../../../../components/stack';
import * as ExpoImage from 'expo-image';
import {Platform, Text} from 'react-native';
import {Gutter} from '../../../../../components/gutter';
import {StackNavProp} from '../../../../../navigation';
import {PageWithScrollView} from '../../../../../components/page';

interface FormData {
  password: string;
}

export const SettingSecurityBio: FunctionComponent = observer(() => {
  const {keychainStore} = useStore();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();
  const intl = useIntl();

  useEffect(() => {
    if (keychainStore.isBiometryOn) {
      navigation.setOptions({
        title: intl.formatMessage({
          id: 'page.setting.security.disable-bio-authentication-title',
        }),
      });
    }
  }, [intl, keychainStore.isBiometryOn, navigation]);

  const {
    control,
    handleSubmit,
    formState: {errors},

    setError,
  } = useForm<FormData>({
    defaultValues: {
      password: '',
    },
  });

  const submit = handleSubmit(async data => {
    try {
      if (keychainStore.isBiometryOn) {
        keychainStore.turnOffBiometryWithPassword(data.password);
        navigation.goBack();
        return;
      }
      await keychainStore.turnOnBiometry(data.password);
      navigation.goBack();
    } catch (e) {
      setError(
        'password',
        {
          type: 'custom',
          message: intl.formatMessage({id: 'error.invalid-password'}),
        },
        {
          shouldFocus: true,
        },
      );
    }
  });

  return (
    <PageWithScrollView
      backgroundMode="default"
      contentContainerStyle={style.flatten(['flex-grow-1', 'padding-x-12'])}>
      <Box
        alignX="center"
        alignY="center"
        height={'100%'}
        style={style.flatten(['flex-1'])}>
        {Platform.OS === 'ios' ? (
          <ExpoImage.Image
            style={{width: 180, height: 180}}
            source={require('../../../../../public/assets/img/bio-ios.png')}
          />
        ) : (
          <ExpoImage.Image
            style={{width: 180, height: 180}}
            source={require('../../../../../public/assets/img/bio-android.png')}
          />
        )}
        <Gutter size={35} />
        <Text style={style.flatten(['body2', 'color-text-middle'])}>
          <FormattedMessage id="page.setting.security.bio-authentication.guide-text" />
        </Text>
      </Box>
      <Stack gutter={35}>
        <Controller
          name="password"
          control={control}
          render={({field: {value, onChange, onBlur, ref}}) => {
            return (
              <TextInput
                label={intl.formatMessage({
                  id: 'page.setting.security.bio-authentication.password-label',
                })}
                onChangeText={onChange}
                onBlur={onBlur}
                ref={ref}
                value={value}
                returnKeyType="done"
                secureTextEntry={true}
                error={errors.password?.message}
                onSubmitEditing={() => {
                  submit();
                }}
                placeholder={intl.formatMessage({
                  id: 'page.setting.security.bio-authentication.password-placeholder',
                })}
              />
            );
          }}
        />
        <Button
          size="large"
          color="primary"
          text={intl.formatMessage({
            id: 'button.confirm',
          })}
          onPress={submit}
        />
      </Stack>
      <Gutter size={19} />
    </PageWithScrollView>
  );
});
