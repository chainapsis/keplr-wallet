import React, {FunctionComponent, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {Controller, useForm} from 'react-hook-form';
import {useIntl} from 'react-intl';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '../../../../../stores';
import {Box} from '../../../../../components/box';
import {Stack} from '../../../../../components/stack';
import {TextInput} from '../../../../../components/input';
import {Gutter} from '../../../../../components/gutter';
import {StackNavProp} from '../../../../../navigation';
import {Button} from '../../../../../components/button';
import {Column} from '../../../../../components/column';

interface FormData {
  password: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const SettingSecurityChangePasswordScreen: FunctionComponent = observer(
  () => {
    const {keyRingStore} = useStore();
    const intl = useIntl();
    const navigate = useNavigation<StackNavProp>();
    const [isLoading, setIsLoading] = useState(false);

    const {
      control,
      handleSubmit,
      formState: {errors},
      setFocus,
      getValues,
      setError,
    } = useForm<FormData>({
      defaultValues: {
        password: '',
        newPassword: '',
        confirmNewPassword: '',
      },
    });

    const submit = handleSubmit(async data => {
      setIsLoading(true);
      try {
        await keyRingStore.changeUserPassword(data.password, data.newPassword);
        navigate.reset({routes: [{name: 'Home'}]});
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
      } finally {
        setIsLoading(false);
      }
    });
    return (
      <Box paddingX={12} paddingTop={12} height={'100%'} paddingBottom={28}>
        <Gutter size={25} />
        <Stack gutter={16}>
          <Controller
            name="password"
            control={control}
            render={({field: {value, onChange, onBlur, ref}}) => {
              return (
                <TextInput
                  label={intl.formatMessage({
                    id: 'page.setting.security.change-password.current-password-label',
                  })}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  ref={ref}
                  value={value}
                  returnKeyType="next"
                  secureTextEntry={true}
                  error={errors.password?.message}
                  onSubmitEditing={() => {
                    setFocus('newPassword');
                  }}
                />
              );
            }}
          />

          <Controller
            name="newPassword"
            control={control}
            rules={{
              validate: (password: string): string | undefined => {
                if (password.length < 8) {
                  return intl.formatMessage({
                    id: 'error.password-too-short',
                  });
                }
              },
            }}
            render={({field: {value, onChange, onBlur, ref}}) => {
              return (
                <TextInput
                  label={intl.formatMessage({
                    id: 'page.setting.security.change-password.new-password-label',
                  })}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  ref={ref}
                  value={value}
                  returnKeyType="next"
                  secureTextEntry={true}
                  error={errors.newPassword?.message}
                  onSubmitEditing={() => {
                    setFocus('confirmNewPassword');
                  }}
                />
              );
            }}
          />

          <Controller
            name="confirmNewPassword"
            control={control}
            rules={{
              validate: (confirmPassword: string): string | undefined => {
                if (confirmPassword !== getValues('newPassword')) {
                  return intl.formatMessage({
                    id: 'error.password-should-match',
                  });
                }
              },
            }}
            render={({field: {value, onChange, onBlur, ref}}) => {
              return (
                <TextInput
                  label={intl.formatMessage({
                    id: 'page.setting.security.change-password.confirm-password-label',
                  })}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  ref={ref}
                  value={value}
                  returnKeyType="done"
                  secureTextEntry={true}
                  error={errors.confirmNewPassword?.message}
                  onSubmitEditing={() => {
                    submit();
                  }}
                />
              );
            }}
          />
        </Stack>

        <Column weight={1} />
        <Button
          text={intl.formatMessage({
            id: 'button.confirm',
          })}
          size="large"
          color="secondary"
          onPress={submit}
          loading={isLoading}
        />
      </Box>
    );
  },
);
