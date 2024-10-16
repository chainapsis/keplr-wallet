import React from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  UseFormGetValues,
  UseFormSetFocus,
} from 'react-hook-form';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../stores';
import {TextInput} from '../../../components/input';
import {Gutter} from '../../../components/gutter';
import {useIntl} from 'react-intl';

export const NamePasswordInput = observer(
  <
    T extends {
      name: string;
      password: string;
      confirmPassword: string;
    },
  >(props: {
    control: Control<T>;
    errors: FieldErrors<T>;
    getValues: UseFormGetValues<T>;
    setFocus: UseFormSetFocus<T>;
    onSubmit: () => void | Promise<void>;

    disableNameInput?: boolean;
  }) => {
    // 먼가 괴랄하긴 한데... react hook form의 타이핑이 어렵기 땜시 그냥 대충 이렇게 처리함
    const control: Control<{
      name: string;
      password: string;
      confirmPassword: string;
    }> = props.control as any;
    const errors: FieldErrors<{
      name: string;
      password: string;
      confirmPassword: string;
    }> = props.errors as any;
    const getValues: UseFormGetValues<{
      name: string;
      password: string;
      confirmPassword: string;
    }> = props.getValues as any;
    const setFocus: UseFormSetFocus<{
      name: string;
      password: string;
      confirmPassword: string;
    }> = props.setFocus as any;
    const onSubmit = props.onSubmit;

    const {keyRingStore} = useStore();
    const needPassword = keyRingStore.keyInfos.length === 0;

    const intl = useIntl();

    return (
      <React.Fragment>
        {!props.disableNameInput ? (
          <Controller
            control={control}
            rules={{
              required: 'Name is required',
            }}
            render={({field: {onChange, onBlur, value, ref}}) => {
              return (
                <TextInput
                  ref={ref}
                  label={intl.formatMessage({
                    id: 'pages.register.components.form.name-password.wallet-name-label',
                  })}
                  placeholder={intl.formatMessage({
                    id: 'pages.register.components.form.name-password.wallet-name-placeholder',
                  })}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.name && errors.name?.message}
                  returnKeyType={needPassword ? 'next' : 'done'}
                  onSubmitEditing={() => {
                    if (needPassword) {
                      setFocus('password');
                    } else {
                      onSubmit();
                    }
                  }}
                />
              );
            }}
            name={'name'}
          />
        ) : null}

        {needPassword ? (
          <React.Fragment>
            <Gutter size={16} />

            <Controller
              control={control}
              rules={{
                required: 'Password is required',
                validate: (password: string): string | undefined => {
                  if (password.length < 8) {
                    return intl.formatMessage({
                      id: 'pages.register.components.form.name-password.short-password-error',
                    });
                  }
                },
              }}
              render={({field: {onChange, onBlur, value, ref}}) => {
                return (
                  <TextInput
                    ref={ref}
                    label={intl.formatMessage({
                      id: 'pages.register.components.form.name-password.password-label',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'pages.register.components.form.name-password.password-placeholder',
                    })}
                    secureTextEntry={true}
                    /* ios의 password generation 기능을 없애기 위한 prop임 */
                    textContentType="oneTimeCode"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.password?.message}
                    returnKeyType={'next'}
                    onSubmitEditing={() => {
                      setFocus('confirmPassword');
                    }}
                  />
                );
              }}
              name={'password'}
            />

            <Gutter size={16} />

            <Controller
              control={control}
              rules={{
                required: 'Password confirm is required',
                validate: (confirmPassword: string): string | undefined => {
                  if (confirmPassword !== getValues('password')) {
                    return intl.formatMessage({
                      id: 'pages.register.components.form.name-password.password-not-match-error',
                    });
                  }
                },
              }}
              render={({field: {onChange, onBlur, value, ref}}) => {
                return (
                  <TextInput
                    ref={ref}
                    label={intl.formatMessage({
                      id: 'pages.register.components.form.name-password.confirm-password-label',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'pages.register.components.form.name-password.confirm-password-placeholder',
                    })}
                    secureTextEntry={true}
                    /* ios의 password generation 기능을 없애기 위한 prop임 */
                    textContentType="oneTimeCode"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.confirmPassword?.message}
                    returnKeyType={'done'}
                    onSubmitEditing={onSubmit}
                  />
                );
              }}
              name={'confirmPassword'}
            />
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  },
);
