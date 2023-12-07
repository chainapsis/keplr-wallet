import React, {
  FunctionComponent,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import {observer} from 'mobx-react-lite';
import {ScrollView, Text} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../navigation';
import {RegisterContainer} from '../components';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {Button} from '../../../components/button';
import {Gutter} from '../../../components/gutter';
import {XAxis} from '../../../components/axis';
import {TextInput} from '../../../components/input';
import {Controller, useForm} from 'react-hook-form';
import {Bip44PathView, useBIP44PathState} from '../components/bip-path-44';
import {useStore} from '../../../stores';

export const VerifyMnemonicScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const route =
    useRoute<RouteProp<RootStackParamList, 'Register.VerifyMnemonic'>>();

  const navigation = useNavigation<StackNavProp>();

  const {
    control,
    handleSubmit,
    getValues,
    formState: {errors},
  } = useForm<{
    name: string;
    password: string;
    confirmPassword: string;
  }>({
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
    },
  });

  //Todo: Component로 빼야함
  const {keyRingStore} = useStore();
  const needPassword = keyRingStore.keyInfos.length === 0;

  const [inputs, setInputs] = useState<Record<number, string | undefined>>({});
  const [validatingStarted, setValidatingStarted] = useState<boolean>(false);

  const bip44PathState = useBIP44PathState();
  const [isOpenBip44PathView, setIsOpenBip44PathView] = React.useState(false);

  const verifyingWords = useMemo(() => {
    if (route.params.mnemonic?.trim() === '') {
      throw new Error(
        intl.formatMessage({
          id: 'pages.register.verify-mnemonic.mnemonic-empty-error',
        }),
      );
    }

    const words = route.params.mnemonic?.split(' ').map(w => w.trim()) ?? [];
    const num = words.length;
    const one = Math.floor(Math.random() * num);
    const two = (() => {
      let r = Math.floor(Math.random() * num);
      while (r === one) {
        r = Math.floor(Math.random() * num);
      }
      return r;
    })();

    return [
      {
        index: one,
        word: words[one],
      },
      {
        index: two,
        word: words[two],
      },
    ].sort((word1, word2) => {
      return word1.index < word2.index ? -1 : 1;
    });
  }, [intl, route.params.mnemonic]);

  const validate = () => {
    setValidatingStarted(true);

    for (const word of verifyingWords) {
      if (inputs[word.index]?.trim() !== word.word) {
        return false;
      }
    }

    return true;
  };

  const onSubmit = handleSubmit(data => {
    if (validate()) {
      navigation.navigate('Register.FinalizeKey', {
        name: data.name,
        password: data.password,
        stepPrevious: route.params.stepPrevious + 1,
        stepTotal: route.params.stepTotal,
        mnemonic: {
          value: route.params.mnemonic,
          bip44Path: bip44PathState.getPath(),
          isFresh: true,
        },
      });
    }
  });

  useLayoutEffect(() => {
    navigation.setParams({
      paragraph: `Step ${route.params.stepPrevious + 1}/${
        route.params.stepTotal
      }`,
    });
  }, [navigation, route.params.stepPrevious, route.params.stepTotal]);

  return (
    <RegisterContainer
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
        <Text style={style.flatten(['color-text-low', 'body1'])}>
          <FormattedMessage id="pages.register.verify-mnemonic.paragraph" />
        </Text>

        <Gutter size={12} />

        <Box
          width="100%"
          alignX="center"
          alignY="center"
          paddingX={55}
          paddingY={25}
          backgroundColor={style.get('color-gray-600').color}
          borderRadius={8}
          style={{gap: 16}}>
          {verifyingWords.map(({index, word}) => {
            return (
              <XAxis alignY="center" key={index}>
                <Text style={style.flatten(['subtitle2', 'color-gray-100'])}>
                  <FormattedMessage
                    id="pages.register.verify-mnemonic.verifying-box.word"
                    values={{index: index + 1}}
                  />
                </Text>

                <Gutter size={16} />

                <TextInput
                  autoCapitalize="none"
                  containerStyle={{width: 120}}
                  onChangeText={text => {
                    setInputs({
                      ...inputs,
                      [index]: text,
                    });
                  }}
                  errorBorder={(() => {
                    if (validatingStarted) {
                      return inputs[index]?.trim() !== word;
                    }
                    return false;
                  })()}
                />
              </XAxis>
            );
          })}
        </Box>

        <Gutter size={20} />

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
      </ScrollView>
    </RegisterContainer>
  );
});
