import React, {FunctionComponent, useEffect, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {useStyle} from '../../../styles';
import {TextInput} from '../../../components/input';
import {Controller, useForm} from 'react-hook-form';
import {useStore} from '../../../stores';
import {Box} from '../../../components/box';
import {Gutter} from '../../../components/gutter';
import {FormattedMessage, useIntl} from 'react-intl';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../navigation';
import LottieView from 'lottie-react-native';
import {InteractionManager, StyleSheet, Text, View} from 'react-native';
import {Column} from '../../../components/column';
import * as Clipboard from 'expo-clipboard';
import {ScrollViewRegisterContainer} from '../../register/components/scroll-view-register-container';
import {TextButton} from '../../../components/text-button';

interface FormData {
  password: string;
}

export const WalletShowSensitiveScreen: FunctionComponent = observer(() => {
  const {keyRingStore, interactionStore} = useStore();
  interactionStore;
  const navigate = useNavigation<StackNavProp>();
  const intl = useIntl();
  const route =
    useRoute<
      RouteProp<RootStackParamList, 'SelectWallet.ViewRecoveryPhrase'>
    >();
  const vaultId = route.params.id;
  const style = useStyle();
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const keyInfo = keyRingStore.keyInfos.find(
      keyInfo => keyInfo.id === vaultId,
    );
    const title = (() => {
      if (keyInfo && keyInfo.type === 'private-key') {
        return intl.formatMessage({
          id: 'page.wallet.keyring-item.dropdown.view-private-key-title',
        });
      }
      return intl.formatMessage({
        id: 'page.wallet.keyring-item.dropdown.view-recovery-path-title',
      });
    })();
    navigate.setOptions({title});
  }, [intl, keyRingStore.keyInfos, navigate, vaultId]);

  const {
    handleSubmit,
    setFocus,
    setError,
    control,
    formState: {errors},
  } = useForm<FormData>({
    defaultValues: {
      password: '',
    },
  });

  const [sensitive, setSensitive] = useState('');

  useEffect(() => {
    InteractionManager.runAfterInteractions(() => {
      setFocus('password');
    });
  }, [setFocus]);

  const submit = handleSubmit(async data => {
    try {
      if (vaultId) {
        const result = await keyRingStore.showKeyRing(vaultId, data.password);
        setSensitive(result);
      }
    } catch (e) {
      console.log('Fail to decrypt: ' + e.message);
      setError('password', {
        type: 'custom',
        message: intl.formatMessage({id: 'error.invalid-password'}),
      });
    }
  });
  return (
    <ScrollViewRegisterContainer
      bottomButtonStyle={{left: 12, right: 12}}
      contentContainerStyle={style.flatten(['flex-grow-1'])}
      bottomButton={
        sensitive === ''
          ? {
              color: 'primary',
              text: intl.formatMessage({
                id: 'button.confirm',
              }),
              size: 'large',
              onPress: submit,
            }
          : {
              color: 'secondary',
              text: intl.formatMessage({
                id: 'button.close',
              }),
              size: 'large',
              onPress: () => {
                navigate.reset({routes: [{name: 'Home'}]});
              },
            }
      }>
      <Box padding={12} paddingTop={8} style={style.flatten(['flex-1'])}>
        {sensitive === '' ? (
          <Box
            alignX="center"
            alignY="center"
            style={style.flatten(['flex-1'])}>
            <LottieView
              source={require('../../../public/assets/lottie/wallet/mnemonic.json')}
              loop
              autoPlay
              style={StyleSheet.flatten([
                style.flatten([
                  'width-136',
                  'height-136',
                  'background-color-gray-600',
                  'border-radius-40',
                ]),
                {
                  height: 180,
                  width: 180,
                },
              ])}
            />
            <Gutter size={33} />
            <Text style={style.flatten(['subtitle3', 'color-gray-200'])}>
              <FormattedMessage id="page.wallet.show-sensitive.paragraph" />
            </Text>
          </Box>
        ) : (
          <Box
            paddingX={28}
            paddingY={20}
            borderRadius={8}
            minHeight={164}
            style={style.flatten([
              'border-width-1',
              'border-color-gray-100',
              'background-color-gray-600',
            ])}>
            <Text
              style={style.flatten([
                'text-center',
                'width-full',
                'subtitle3',
                'color-gray-50',
              ])}>
              {sensitive}
            </Text>
            <Column weight={1} />
            <Box alignX="center">
              <TextButton
                text={
                  isCopied
                    ? intl.formatMessage({
                        id: 'pages.register.components.copy-to-clipboard.button-after',
                      })
                    : intl.formatMessage({
                        id: 'pages.register.components.copy-to-clipboard.button-before',
                      })
                }
                textColor={
                  style.flatten([
                    isCopied ? 'color-green-400' : 'color-gray-50',
                  ]).color
                }
                size="large"
                onPress={async () => {
                  await Clipboard.setStringAsync(sensitive).then(() =>
                    setIsCopied(true),
                  );

                  setIsCopied(true);

                  setTimeout(() => {
                    setIsCopied(false);
                  }, 1000);
                }}
                rightIcon={
                  isCopied ? (
                    <LottieView
                      source={require('../../../public/assets/lottie/register/check-circle-icon.json')}
                      loop={false}
                      autoPlay
                      style={style.flatten(['width-20', 'height-20'])}
                    />
                  ) : undefined
                }
              />
            </Box>
          </Box>
        )}
        <View style={style.flatten(['flex-1'])} />
        <Box>
          {sensitive === '' ? (
            <Controller
              control={control}
              name="password"
              defaultValue=""
              render={({field: {value, onChange, onBlur, ref}}) => {
                return (
                  <TextInput
                    label={intl.formatMessage({
                      id: 'page.wallet.show-sensitive.password-label',
                    })}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    ref={ref}
                    value={value}
                    error={errors.password?.message}
                    returnKeyType="done"
                    secureTextEntry={true}
                    onSubmitEditing={() => {
                      submit();
                    }}
                  />
                );
              }}
            />
          ) : null}
        </Box>
      </Box>
    </ScrollViewRegisterContainer>
  );
});
