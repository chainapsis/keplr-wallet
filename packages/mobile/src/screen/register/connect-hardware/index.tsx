import React, {FunctionComponent, useRef} from 'react';
import {RegisterContainer} from '../components';
import {useIntl} from 'react-intl';
import {observer} from 'mobx-react-lite';
import {Controller, useForm} from 'react-hook-form';
import {Button} from '../../../components/button';
import {useStyle} from '../../../styles';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation';
import {Bip44PathView, useBIP44PathState} from '../components/bip-path-44';
import {BottomSheetFlatList, BottomSheetModal} from '@gorhom/bottom-sheet';
import {Modal} from '../../../components/modal';
import {ScrollView, Text} from 'react-native';
import {TextInput} from '../../../components/input';
import {Gutter} from '../../../components/gutter';
import {useStore} from '../../../stores';
import {SelectOption} from '../../../components/select-option';
import {Box} from '../../../components/box';
import {App} from '@keplr-wallet/ledger-cosmos';
import {RectButton} from '../../../components/rect-button';
import {XAxis} from '../../../components/axis';
import {ArrowDownFillIcon} from '../../../components/icon/arrow-donw-fill';

export const ConnectHardwareWalletScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  const bip44PathState = useBIP44PathState();
  const [isOpenBip44PathView, setIsOpenBip44PathView] = React.useState(false);

  const selectAppModalRef = useRef<BottomSheetModal>(null);

  const {keyRingStore} = useStore();
  const needPassword = keyRingStore.keyInfos.length === 0;

  const supportedApps: App[] = ['Cosmos', 'Terra', 'Secret'];
  const [selectedApp, setSelectedApp] = React.useState<App>('Cosmos');

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

  const onSubmit = handleSubmit(async data => {
    navigation.navigate('Register.ConnectLedger', {
      name: data.name,
      password: data.password,
      stepPrevious: 1,
      stepTotal: 3,
      bip44Path: bip44PathState.getPath(),
      app: selectedApp,
    });
  });

  return (
    <RegisterContainer
      title={intl.formatMessage({
        id: 'pages.register.connect-hardware.header.title',
      })}
      paragraph={'Step 1/3'}
      bottom={
        <Button
          text={intl.formatMessage({
            id: 'button.next',
          })}
          size="large"
          onPress={onSubmit}
        />
      }>
      <ScrollView style={style.flatten(['padding-x-20', 'flex-1'])}>
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

        <Text style={style.flatten(['subtitle3', 'color-gray-100'])}>
          Connect to
        </Text>

        <Gutter size={6} />

        <RectButton
          style={style.flatten([
            'padding-x-16',
            'padding-y-16',
            'border-width-1',
            'border-color-gray-400',
            'border-radius-8',
          ])}
          onPress={() => {
            selectAppModalRef.current?.present();
          }}>
          <XAxis alignY="center">
            <Text style={style.flatten(['body2', 'color-gray-50', 'flex-1'])}>
              {selectedApp}
              {selectedApp === 'Cosmos' ? ' (Recommend)' : null}
            </Text>

            <ArrowDownFillIcon
              size={24}
              color={style.get('color-gray-300').color}
            />
          </XAxis>
        </RectButton>

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

      <Modal ref={selectAppModalRef} snapPoints={[supportedApps.length * 80]}>
        <BottomSheetFlatList
          data={supportedApps}
          keyExtractor={item => item}
          renderItem={({item}) => {
            return (
              <SelectOption
                key={item}
                title={item}
                selected={item === selectedApp}
                onPress={() => {
                  setSelectedApp(item);
                  selectAppModalRef.current?.dismiss();
                }}
              />
            );
          }}
          ItemSeparatorComponent={() => (
            <Box
              height={1}
              backgroundColor={style.get('color-gray-500').color}
            />
          )}
        />
      </Modal>
    </RegisterContainer>
  );
});
