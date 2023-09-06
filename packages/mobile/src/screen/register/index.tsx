import {observer} from 'mobx-react-lite';
import React, {FunctionComponent} from 'react';
import {View} from 'react-native';
import {useStyle} from '../../styles';
import {TextInput} from '../../components/input/input';
import {Button} from '../../components/button';
import {useStore} from '../../stores';
import {Controller, useForm} from 'react-hook-form';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../navigation';
import {useNavigation, StackActions} from '@react-navigation/native';

const bip39 = require('bip39');

interface FormData {
  mnemonic: string;
  name: string;
  password: string;
  confirmPassword: string;
}

function trimMnemonicOrStr(str: string): string {
  str = str.trim();
  // Split on the whitespace or new line.
  const strList = str.split(/\s+/);
  const words = strList
    .map(word => word.trim())
    .filter(word => word.trim().length > 0);
  return words.join(' ');
}

function isPrivateKey(str: string): boolean {
  if (str.startsWith('0x')) {
    return true;
  }

  if (str.length === 64) {
    try {
      return Buffer.from(str, 'hex').length === 32;
    } catch {
      return false;
    }
  }
  return false;
}

function validatePrivateKey(value: string): boolean {
  if (isPrivateKey(value)) {
    value = value.replace('0x', '');
    if (value.length !== 64) {
      return false;
    }
    return (
      Buffer.from(value, 'hex').toString('hex').toLowerCase() ===
      value.toLowerCase()
    );
  }
  return false;
}

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
}
export const RegisterScreen: FunctionComponent<RegisterScreenProps> = observer(
  () => {
    const navigation = useNavigation();
    const {keyRingStore} = useStore();
    const style = useStyle();
    const status = keyRingStore.status;

    const isNeedPassword = status === 'empty';

    const {
      control,
      formState: {errors},
      handleSubmit,
      setFocus,
      getValues,
    } = useForm<FormData>();

    const submit = handleSubmit(async data => {
      const {mnemonic, name, password} = data;
      const trimmedMnemonic = trimMnemonicOrStr(mnemonic);
      const defaultBIP44 = {
        account: 0,
        change: 0,
        addressIndex: 0,
      };

      if (isNeedPassword) {
        await keyRingStore.newMnemonicKey(
          trimmedMnemonic,
          defaultBIP44,
          name,
          password,
        );
        navigation.dispatch({
          ...StackActions.replace('Home'),
        });
        return;
      }

      await keyRingStore.newMnemonicKey(
        trimmedMnemonic,
        defaultBIP44,
        name,
        undefined,
      );
      navigation.dispatch({
        ...StackActions.replace('Home'),
      });
    });

    return (
      <React.Fragment>
        <View>
          <Controller
            control={control}
            name="mnemonic"
            defaultValue=""
            rules={{
              required: 'Mnemonic is required',
              validate: (value: string) => {
                const str = trimMnemonicOrStr(value);
                if (!isPrivateKey(str)) {
                  if (str.split(' ').length < 12) {
                    return 'Too short mnemonic';
                  }

                  if (!bip39.validateMnemonic(str)) {
                    return 'Invalid mnemonic';
                  }
                }

                if (validatePrivateKey(str)) {
                  return 'Invalid privateKey';
                }
              },
            }}
            render={({field: {value, onChange, onBlur, ref}}) => {
              return (
                <TextInput
                  label="Mnemonic seed"
                  multiline={true}
                  numberOfLines={4}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  returnKeyType="next"
                  style={
                    (style.flatten(['h6', 'color-text-middle']),
                    {
                      minHeight: 20 * 4,
                      textAlignVertical: 'top',
                    })
                  }
                  onSubmitEditing={() => {
                    setFocus('name');
                  }}
                  error={errors.mnemonic?.message}
                  ref={ref}
                />
              );
            }}
          />

          <Controller
            control={control}
            rules={{required: 'Name is required'}}
            name="name"
            defaultValue=""
            render={({field: {value, onChange, onBlur, ref}}) => {
              return (
                <TextInput
                  label="Wallet nickname"
                  style={style.flatten(['color-text-middle'])}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  ref={ref}
                  error={errors.name?.message}
                  onSubmitEditing={() => {
                    if (!isNeedPassword) {
                      submit();
                      return;
                    }
                    setFocus('password');
                  }}
                />
              );
            }}
          />

          {isNeedPassword && (
            <React.Fragment>
              <Controller
                control={control}
                rules={{
                  required: 'Password is required',
                  validate: (value: string) => {
                    if (value.length < 8) {
                      return 'Password must be longer than 8 characters';
                    }
                  },
                }}
                name="password"
                defaultValue=""
                render={({field: {value, onChange, onBlur, ref}}) => {
                  return (
                    <TextInput
                      label="Create Keplr Password"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      ref={ref}
                      value={value}
                      error={errors.password?.message}
                      returnKeyType="next"
                      secureTextEntry={true}
                      onSubmitEditing={() => {
                        setFocus('confirmPassword');
                      }}
                    />
                  );
                }}
              />
              <Controller
                control={control}
                name="confirmPassword"
                defaultValue=""
                rules={{
                  required: 'Password is required',
                  validate: (value: string) => {
                    if (value.length < 8) {
                      return 'Password must be longer than 8 characters';
                    }

                    if (getValues('password') !== value) {
                      return "Password doesn't match";
                    }
                  },
                }}
                render={({field: {value, onChange, onBlur, ref}}) => {
                  return (
                    <TextInput
                      label="Confirm Keplr Password"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      ref={ref}
                      value={value}
                      error={errors.confirmPassword?.message}
                      returnKeyType="done"
                      secureTextEntry={true}
                      onSubmitEditing={() => {
                        submit();
                      }}
                    />
                  );
                }}
              />
            </React.Fragment>
          )}

          <Button text="Next" size="large" onPress={submit} />
        </View>
      </React.Fragment>
    );
  },
);
