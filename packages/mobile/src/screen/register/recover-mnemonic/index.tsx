import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {FormattedMessage, useIntl} from 'react-intl';
import {LegacyRegisterContainer} from '../components';
import {useStyle} from '../../../styles';
import {ScrollView, Text, TextInput as NativeTextInput} from 'react-native';
import {XAxis} from '../../../components/axis';
import {Button} from '../../../components/button';
import {Box} from '../../../components/box';
import {Gutter} from '../../../components/gutter';
import {TextButton} from '../../../components/text-button';
import {useStore} from '../../../stores';
import {Controller, useForm} from 'react-hook-form';
import {TextInput} from '../../../components/input';
import * as Clipboard from 'expo-clipboard';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation';
import {Bip44PathView, useBIP44PathState} from '../components/bip-path-44';

const bip39 = require('bip39');

function trimWordsStr(str: string): string {
  str = str.trim();
  // Split on the whitespace or new line.
  const splited = str.split(/\s+/);
  const words = splited
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

export const RecoverMnemonicScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  const bip44PathState = useBIP44PathState();
  const [isOpenBip44PathView, setIsOpenBip44PathView] = React.useState(false);

  const {keyRingStore} = useStore();
  const needPassword = keyRingStore.keyInfos.length === 0;

  const {
    control,
    handleSubmit,
    setFocus,
    setValue,
    getValues,
    formState: {errors},
  } = useForm<{
    name: string;
    password: string;
    confirmPassword: string;
    recoveryPhrase: string;
  }>({
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
      recoveryPhrase: '',
    },
  });

  const onSubmit = handleSubmit(async data => {
    const recoveryPhrase = trimWordsStr(data.recoveryPhrase);

    if (isPrivateKey(recoveryPhrase)) {
      const privateKey = Buffer.from(
        recoveryPhrase.trim().replace('0x', ''),
        'hex',
      );

      navigation.navigate('Register.FinalizeKey', {
        name: data.name,
        password: data.password,
        stepPrevious: 1,
        stepTotal: 3,
        privateKey: {
          value: privateKey,
          meta: {},
        },
      });
    } else {
      navigation.navigate('Register.FinalizeKey', {
        name: data.name,
        password: data.password,
        stepPrevious: 1,
        stepTotal: 3,
        mnemonic: {
          value: recoveryPhrase,
          bip44Path: bip44PathState.getPath(),
        },
      });
    }
  });

  return (
    <LegacyRegisterContainer
      paragraph="Step 1/3"
      bottom={
        <Button
          text={intl.formatMessage({
            id: 'button.next',
          })}
          size="large"
          onPress={onSubmit}
        />
      }>
      <ScrollView style={style.flatten(['padding-x-20'])}>
        <Box paddingX={8}>
          <XAxis>
            <Text
              style={style.flatten([
                'body1',
                'color-text-low',
                'margin-right-4',
              ])}>
              •
            </Text>
            <Text style={style.flatten(['body1', 'color-text-low'])}>
              <FormattedMessage id="pages.register.recover-mnemonic.paragraph-1" />
            </Text>
          </XAxis>

          <XAxis>
            <Text
              style={style.flatten([
                'body1',
                'color-text-low',
                'margin-right-4',
              ])}>
              •
            </Text>
            <Text style={style.flatten(['body1', 'color-text-low'])}>
              <FormattedMessage id="pages.register.recover-mnemonic.paragraph-2" />
            </Text>
          </XAxis>
        </Box>

        <Gutter size={12} />

        <Text style={style.flatten(['subtitle3', 'color-label-default'])}>
          Recovery Phrase
        </Text>

        <Gutter size={6} />

        <Controller
          control={control}
          rules={{
            required: 'Mnemonic is required',
            validate: (value: string) => {
              value = trimWordsStr(value);
              if (!isPrivateKey(value)) {
                if (value.split(' ').length < 8) {
                  return 'Too short mnemonic';
                }

                if (!bip39.validateMnemonic(value)) {
                  return 'Invalid mnemonic';
                }
              } else {
                value = value.replace('0x', '');
                if (value.length !== 64) {
                  return 'Invalid length of private key';
                }

                try {
                  if (
                    Buffer.from(value, 'hex').toString('hex').toLowerCase() !==
                    value.toLowerCase()
                  ) {
                    return 'Invalid private key';
                  }
                } catch {
                  return 'Invalid private key';
                }
              }
            },
          }}
          render={({field: {onChange, onBlur, value}}) => {
            return (
              <React.Fragment>
                <Box
                  borderWidth={
                    errors.recoveryPhrase && errors.recoveryPhrase?.message
                      ? 1
                      : 0
                  }
                  borderColor={
                    errors.recoveryPhrase && errors.recoveryPhrase?.message
                      ? style.get('color-yellow-400').color
                      : undefined
                  }
                  backgroundColor={style.get('color-gray-600').color}
                  padding={16}
                  borderRadius={8}>
                  <NativeTextInput
                    returnKeyType="next"
                    multiline={true}
                    numberOfLines={6}
                    textAlignVertical="top"
                    placeholder="Type your recovery phrase or private key"
                    placeholderTextColor={style.get('color-gray-300').color}
                    autoCorrect={false}
                    autoCapitalize="none"
                    underlineColorAndroid="transparent"
                    style={{
                      minHeight: 120,
                      color: style.get('color-text-high').color,
                    }}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />

                  <Box
                    paddingRight={9}
                    paddingBottom={16}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                    }}>
                    <TextButton
                      text={'Paste'}
                      size="large"
                      onPress={async () => {
                        const text = await Clipboard.getStringAsync();
                        if (text) {
                          setValue('recoveryPhrase', text, {
                            shouldValidate: true,
                          });

                          setFocus('name');
                        }
                      }}
                    />
                  </Box>
                </Box>

                {errors.recoveryPhrase && errors.recoveryPhrase?.message ? (
                  <Text
                    style={style.flatten([
                      'text-caption2',
                      'color-yellow-400',
                      'padding-top-4',
                      'padding-left-6',
                    ])}>
                    {errors.recoveryPhrase?.message}
                  </Text>
                ) : null}
              </React.Fragment>
            );
          }}
          name="recoveryPhrase"
        />

        <Gutter size={16} />

        <Controller
          control={control}
          rules={{
            required: 'Name is required',
          }}
          render={({field: {onChange, onBlur, value}}) => {
            return (
              <TextInput
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
              />
            );
          }}
          name={'name'}
        />

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
              render={({field: {onChange, onBlur, value}}) => {
                return (
                  <TextInput
                    label={intl.formatMessage({
                      id: 'pages.register.components.form.name-password.password-label',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'pages.register.components.form.name-password.password-placeholder',
                    })}
                    secureTextEntry={true}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.password?.message}
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
              render={({field: {onChange, onBlur, value}}) => {
                return (
                  <TextInput
                    label={intl.formatMessage({
                      id: 'pages.register.components.form.name-password.confirm-password-label',
                    })}
                    placeholder={intl.formatMessage({
                      id: 'pages.register.components.form.name-password.confirm-password-placeholder',
                    })}
                    secureTextEntry={true}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    error={errors.confirmPassword?.message}
                  />
                );
              }}
              name={'confirmPassword'}
            />
          </React.Fragment>
        ) : null}

        <Gutter size={16} />

        {isOpenBip44PathView ? (
          <Bip44PathView
            state={bip44PathState}
            setIsOpen={setIsOpenBip44PathView}
          />
        ) : (
          <Box alignX="center">
            <Button
              text={intl.formatMessage({id: 'button.advanced'})}
              size="small"
              color="secondary"
              disabled={
                !bip44PathState.isAccountValid() ||
                !bip44PathState.isChangeValid() ||
                !bip44PathState.isAddressIndexValid()
              }
              onPress={() => {
                setIsOpenBip44PathView(true);
              }}
            />
          </Box>
        )}

        <Gutter size={32} />
      </ScrollView>
    </LegacyRegisterContainer>
  );
});
