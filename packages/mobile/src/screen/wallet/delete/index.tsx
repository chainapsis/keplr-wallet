import React, {FunctionComponent, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {useStyle} from '../../../styles';
import {TextInput} from '../../../components/input';
import {useStore} from '../../../stores';
import {Controller, useForm} from 'react-hook-form';
import {FormattedMessage, useIntl} from 'react-intl';
import {Button} from '../../../components/button';
import {Box} from '../../../components/box';
import {Gutter} from '../../../components/gutter';
import {Text} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import {RootStackParamList} from '../../../navigation';
import {GuideBox} from '../../../components/guide-box';
import {Column} from '../../../components/column';
import {PageWithScrollView} from '../../../components/page';

interface FormData {
  password: string;
}

export const WalletDeleteScreen: FunctionComponent = observer(() => {
  const {keyRingStore} = useStore();

  const navigate = useNavigation();
  const intl = useIntl();
  const style = useStyle();
  const route =
    useRoute<RouteProp<RootStackParamList, 'SelectWallet.Delete'>>();
  const vaultId = route.params.id;

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

  const submit = handleSubmit(async data => {
    try {
      if (vaultId) {
        await keyRingStore.deleteKeyRing(vaultId, data.password);
        navigate.goBack();
      }
    } catch (e) {
      console.log('Fail to decrypt: ' + e.message);
      setError('password', {
        type: 'custom',
        message: intl.formatMessage({id: 'error.invalid-password'}),
      });
    }
  });
  useEffect(() => {
    setFocus('password');
  }, [setFocus]);

  return (
    <PageWithScrollView
      backgroundMode={'default'}
      style={style.flatten(['height-full'])}
      contentContainerStyle={style.flatten(['flex-grow-1'])}>
      <Box style={style.flatten(['height-full'])}>
        <Box>
          {(() => {
            const keyInfo = keyRingStore.keyInfos.find(
              keyInfo => keyInfo.id === vaultId,
            );
            if (!keyInfo) {
              return null;
            }

            if (keyInfo.type === 'mnemonic' || keyInfo.type === 'private-key') {
              return (
                <GuideBox
                  color="warning"
                  title={intl.formatMessage({
                    id: 'page.wallet.delete.warning-title',
                  })}
                  paragraph={intl.formatMessage({
                    id: 'page.wallet.delete.warning-paragraph',
                  })}
                  bottom={
                    <Text
                      style={style.flatten([
                        'text-underline',
                        'color-yellow-400',
                        'subtitle4',
                      ])}>
                      <FormattedMessage id="page.wallet.delete.warning-link-text" />
                    </Text>
                  }
                />
              );
            }

            return null;
          })()}
          <LottieView
            source={require('../../../public/assets/lottie/wallet/delete.json')}
            loop
            autoPlay
            style={style.flatten(['width-full', 'height-116'])}
          />
          <Text
            style={style.flatten([
              'subtitle3',
              'color-gray-300',
              'text-center',
              'padding-x-8',
            ])}>
            <FormattedMessage id="page.wallet.delete.paragraph" />
          </Text>
        </Box>
        <Column weight={1} />
        <Box>
          <Controller
            control={control}
            name="password"
            defaultValue=""
            render={({field: {value, onChange, onBlur, ref}}) => {
              return (
                <TextInput
                  label={intl.formatMessage({
                    id: 'page.wallet.delete.password-input-label',
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
          <Gutter size={12} />
          <Button
            text={intl.formatMessage({id: 'button.confirm'})}
            color="secondary"
            size="large"
            onPress={submit}
          />
        </Box>
      </Box>
    </PageWithScrollView>
  );
});
