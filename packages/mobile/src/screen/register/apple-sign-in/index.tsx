import React, {FunctionComponent, useEffect} from 'react';
import {useForm} from 'react-hook-form';
import {useIntl} from 'react-intl';
import {useStyle} from '../../../styles';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation';
import {ScrollViewRegisterContainer} from '../components/scroll-view-register-container';
import {NamePasswordInput} from '../components/name-password-input';
import {Box} from '../../../components/box';
import {SVGLoadingIcon} from '../../../components/spinner';
import {getAppleSignInPrivateKey} from 'keplr-wallet-mobile-private';
import {Buffer} from 'buffer/';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../../stores';
import {Platform} from 'react-native';

export const RegisterAppleSignInScreen: FunctionComponent = observer(() => {
  const {uiConfigStore} = useStore();

  const intl = useIntl();
  const style = useStyle();
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

  const [key, setKey] = React.useState<{
    privateKey: Uint8Array;
    email: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      let wasAutoLockEnabled = uiConfigStore.autoLockConfig.isEnableAutoLock;
      // ios에서 붙여넣기 할때 native modal이 뜨면서 app state가 background로 바뀌는데
      // 이때문에 auto lock이 되어버린다.
      // 일단 대충 이 문제를 해결하기 위해서 ios에서는 붙여넣기 전에 auto lock을 끈다.
      if (Platform.OS === 'ios') {
        if (wasAutoLockEnabled) {
          await uiConfigStore.autoLockConfig.disableAutoLock();
        }
      }
      try {
        const res = await getAppleSignInPrivateKey();
        console.log(res);
        setKey(res);
      } catch (e) {
        console.log(e);
        navigation.goBack();
      } finally {
        if (Platform.OS === 'ios') {
          if (wasAutoLockEnabled) {
            await uiConfigStore.autoLockConfig.enableAutoLock();
          }
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (key) {
      setFocus('name');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const onSubmit = handleSubmit(async data => {
    if (key) {
      navigation.navigate('Register.BackupPrivateKey', {
        name: data.name,
        password: data.password,
        stepPrevious: 1,
        stepTotal: 3,
        privateKey: {
          hexValue: Buffer.from(key.privateKey).toString('hex'),
          meta: {
            web3Auth: {
              email: key.email,
              type: 'apple',
            },
          },
        },
      });
    }
  });

  return (
    <ScrollViewRegisterContainer
      contentContainerStyle={{
        flexGrow: 1,
      }}
      paragraph="Step 1/3"
      bottomButton={{
        text: intl.formatMessage({
          id: 'button.next',
        }),
        size: 'large',
        disabled: key == null,
        onPress: onSubmit,
      }}
      paddingX={20}>
      {key ? (
        <NamePasswordInput
          control={control}
          errors={errors}
          getValues={getValues}
          setFocus={setFocus}
          onSubmit={onSubmit}
        />
      ) : (
        <Box
          style={{
            flex: 1,
          }}
          alignX="center"
          alignY="center">
          <SVGLoadingIcon color={style.get('color-gray-300').color} size={20} />
        </Box>
      )}
    </ScrollViewRegisterContainer>
  );
});
