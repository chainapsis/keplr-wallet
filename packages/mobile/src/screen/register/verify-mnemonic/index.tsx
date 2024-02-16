import React, {FunctionComponent, useMemo, useState} from 'react';
import {observer} from 'mobx-react-lite';
import {
  InteractionManager,
  Text,
  TextInput as NativeTextInput,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {RootStackParamList, StackNavProp} from '../../../navigation';
import {FormattedMessage, useIntl} from 'react-intl';
import {useStyle} from '../../../styles';
import {Box} from '../../../components/box';
import {Button} from '../../../components/button';
import {Gutter} from '../../../components/gutter';
import {XAxis} from '../../../components/axis';
import {TextInput} from '../../../components/input';
import {useForm} from 'react-hook-form';
import {Bip44PathView, useBIP44PathState} from '../components/bip-path-44';
import {ScrollViewRegisterContainer} from '../components/scroll-view-register-container';
import {VerticalCollapseTransition} from '../../../components/transition';
import {NamePasswordInput} from '../components/name-password-input';
import {useEffectOnce} from '../../../hooks';

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
    setFocus,
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

  const [inputs, setInputs] = useState<Record<number, string | undefined>>({});
  const [validatingStarted, setValidatingStarted] = useState<boolean>(false);

  const bip44PathState = useBIP44PathState();
  const [isOpenBip44PathView, setIsOpenBip44PathView] = React.useState(false);

  // 그냥 첫번째 word input에 시작시 focus를 준다.
  const firstWordInputRef = React.useRef<NativeTextInput>(null);
  useEffectOnce(() => {
    // XXX: 병맛이지만 RN에서 스크린이 변할때 바로 mount에서 focus를 주면 안드로이드에서 키보드가 안뜬다.
    //      이 경우 settimeout을 쓰라지만... 그냥 스크린이 다 뜨면 포커스를 주는 것으로 한다.
    InteractionManager.runAfterInteractions(() => {
      firstWordInputRef.current?.focus();
    });
  });
  const secondWordInputRef = React.useRef<NativeTextInput>(null);

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
      navigation.reset({
        routes: [
          {
            name: 'Register.FinalizeKey',
            params: {
              name: data.name,
              password: data.password,
              stepPrevious: route.params.stepPrevious + 1,
              stepTotal: route.params.stepTotal,
              mnemonic: {
                value: route.params.mnemonic,
                bip44Path: bip44PathState.getPath(),
                isFresh: true,
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
      })} ${route.params.stepPrevious + 1}/${route.params.stepTotal}`}
      bottomButton={{
        text: intl.formatMessage({
          id: 'button.next',
        }),
        size: 'large',
        onPress: onSubmit,
      }}
      paddingX={20}>
      <Gutter size={12} />

      <Text style={style.flatten(['color-text-low', 'body1', 'text-center'])}>
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
        {verifyingWords.map(({index, word}, i) => {
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
                ref={i === 0 ? firstWordInputRef : secondWordInputRef}
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
                returnKeyType={'next'}
                onSubmitEditing={() => {
                  if (i === 0) {
                    secondWordInputRef.current?.focus();
                  } else {
                    setFocus('name');
                  }
                }}
              />
            </XAxis>
          );
        })}
      </Box>

      <Gutter size={20} />

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
