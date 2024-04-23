import React, {FunctionComponent} from 'react';
import {observer} from 'mobx-react-lite';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStyle} from '../../../styles';
import {Platform, Text, TextInput as NativeTextInput} from 'react-native';
import {XAxis} from '../../../components/axis';
import {Button} from '../../../components/button';
import {Box} from '../../../components/box';
import {Gutter} from '../../../components/gutter';
import {TextButton} from '../../../components/text-button';
import {Controller, useForm} from 'react-hook-form';
import * as Clipboard from 'expo-clipboard';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation';
import {Bip44PathView, useBIP44PathState} from '../components/bip-path-44';
import {ScrollViewRegisterContainer} from '../components/scroll-view-register-container';
import {VerticalCollapseTransition} from '../../../components/transition';
import {NamePasswordInput} from '../components/name-password-input';
import {useStore} from '../../../stores';
import {isMnemonicWord} from '@keplr-wallet/common';

const bip39 = require('bip39');

function trimWordsStr(str: string): string {
  str = str.trim();
  // Split on the whitespace or new line.
  const splited = str.split(/\s+/);
  const words = splited
    .map(word => word.toLowerCase().trim())
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
  const {uiConfigStore} = useStore();

  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  const bip44PathState = useBIP44PathState();
  const [isOpenBip44PathView, setIsOpenBip44PathView] = React.useState(false);

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
    mode: 'onChange',
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
      recoveryPhrase: '',
    },
  });

  const onSubmit = handleSubmit(data => {
    const recoveryPhrase = trimWordsStr(data.recoveryPhrase);

    if (isPrivateKey(recoveryPhrase)) {
      const privateKey = Buffer.from(
        recoveryPhrase.trim().replace('0x', ''),
        'hex',
      );

      navigation.reset({
        routes: [
          {
            name: 'Register.FinalizeKey',
            params: {
              name: data.name,
              password: data.password,
              stepPrevious: 1,
              stepTotal: 3,
              privateKey: {
                hexValue: privateKey.toString('hex'),
                meta: {},
              },
            },
          },
        ],
      });
    } else {
      navigation.reset({
        routes: [
          {
            name: 'Register.FinalizeKey',
            params: {
              name: data.name,
              password: data.password,
              stepPrevious: 1,
              stepTotal: 3,
              mnemonic: {
                value: recoveryPhrase,
                bip44Path: bip44PathState.getPath(),
              },
            },
          },
        ],
      });
    }
  });

  return (
    <ScrollViewRegisterContainer
      paragraph={`${intl.formatMessage({
        id: 'pages.register.components.header.header-step.title',
      })} 1/3`}
      bottomButton={{
        text: intl.formatMessage({
          id: 'button.next',
        }),
        size: 'large',
        onPress: onSubmit,
      }}
      paddingX={20}>
      <Gutter size={12} />
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
        <Gutter size={8} />
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

      <Gutter size={20} />

      <Text style={style.flatten(['subtitle3', 'color-label-default'])}>
        <FormattedMessage id="pages.register.intro-existing-user.recovery-title" />
      </Text>

      <Gutter size={6} />

      <Controller
        control={control}
        rules={{
          required: 'Mnemonic is required',
          validate: (value: string) => {
            value = trimWordsStr(value);
            if (!isPrivateKey(value)) {
              const split = trimWordsStr(value).split(' ');

              if (split.length < 8) {
                return intl.formatMessage({id: 'error.too-short-mnemonic'});
              }

              const notMnemonicWords: {
                index: number;
                word: string;
              }[] = [];

              for (let i = 0; i < split.length; i++) {
                const word = split[i];
                if (word) {
                  if (!isMnemonicWord(word)) {
                    notMnemonicWords.push({
                      index: i,
                      word: word,
                    });
                  }
                }
              }

              if (notMnemonicWords.length > 0) {
                return intl.formatMessage(
                  {id: 'error.wrong-mnemonic-word'},
                  {
                    index: notMnemonicWords
                      .map(w => `#${w.index + 1}`)
                      .join(', '),
                  },
                );
              }

              if (!bip39.validateMnemonic(split.join(' '))) {
                return intl.formatMessage({id: 'error.invalid-mnemonic'});
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
                  autoComplete="off"
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
                      let wasAutoLockEnabled =
                        uiConfigStore.autoLockConfig.isEnableAutoLock;
                      // ios에서 붙여넣기 할때 native modal이 뜨면서 app state가 background로 바뀌는데
                      // 이때문에 auto lock이 되어버린다.
                      // 일단 대충 이 문제를 해결하기 위해서 ios에서는 붙여넣기 전에 auto lock을 끈다.
                      if (Platform.OS === 'ios') {
                        if (wasAutoLockEnabled) {
                          await uiConfigStore.autoLockConfig.disableAutoLock();
                        }
                      }
                      try {
                        const text = await Clipboard.getStringAsync();
                        if (text) {
                          setValue('recoveryPhrase', text, {
                            shouldValidate: true,
                          });

                          setFocus('name');
                        }
                      } finally {
                        if (Platform.OS === 'ios') {
                          if (wasAutoLockEnabled) {
                            await uiConfigStore.autoLockConfig.enableAutoLock();
                          }
                        }
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

      <NamePasswordInput
        control={control}
        errors={errors}
        getValues={getValues}
        setFocus={setFocus}
        onSubmit={onSubmit}
      />

      <Gutter size={16} />

      <VerticalCollapseTransition collapsed={isOpenBip44PathView}>
        <Box alignX="center">
          <Button
            text={intl.formatMessage({id: 'button.advanced'})}
            size="small"
            color="secondary"
            onPress={() => {
              setIsOpenBip44PathView(true);
            }}
          />
        </Box>
      </VerticalCollapseTransition>
      {
        <VerticalCollapseTransition collapsed={!isOpenBip44PathView}>
          <Bip44PathView
            state={bip44PathState}
            setIsOpen={setIsOpenBip44PathView}
          />
        </VerticalCollapseTransition>
      }

      <Gutter size={16} />
    </ScrollViewRegisterContainer>
  );
});
