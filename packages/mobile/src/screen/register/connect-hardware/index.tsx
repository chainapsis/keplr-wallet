import React, {FunctionComponent, useState} from 'react';
import {useIntl} from 'react-intl';
import {observer} from 'mobx-react-lite';
import {useForm} from 'react-hook-form';
import {Button} from '../../../components/button';
import {useStyle} from '../../../styles';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../../navigation';
import {Bip44PathView, useBIP44PathState} from '../components/bip-path-44';
import {InteractionManager, Text} from 'react-native';
import {Gutter} from '../../../components/gutter';
import {Box} from '../../../components/box';
import {App} from '@keplr-wallet/ledger-cosmos';
import {RectButton} from '../../../components/rect-button';
import {XAxis} from '../../../components/axis';
import {ArrowDownFillIcon} from '../../../components/icon/arrow-donw-fill';
import {SelectItemModal} from '../../../components/modal/select-item-modal';
import {ScrollViewRegisterContainer} from '../components/scroll-view-register-container';
import {VerticalCollapseTransition} from '../../../components/transition';
import {NamePasswordInput} from '../components/name-password-input';
import {useEffectOnce} from '../../../hooks';

export const ConnectHardwareWalletScreen: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const navigation = useNavigation<StackNavProp>();

  const bip44PathState = useBIP44PathState();
  const [isOpenBip44PathView, setIsOpenBip44PathView] = React.useState(false);
  const [isOpenSelectItemModal, setIsOpenSelectItemModal] = useState(false);

  const supportedApps: App[] = ['Cosmos', 'Terra', 'Secret'];
  const [selectedApp, setSelectedApp] = React.useState<App>('Cosmos');

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

  useEffectOnce(() => {
    // XXX: 병맛이지만 RN에서 스크린이 변할때 바로 mount에서 focus를 주면 안드로이드에서 키보드가 안뜬다.
    //      이 경우 settimeout을 쓰라지만... 그냥 스크린이 다 뜨면 포커스를 주는 것으로 한다.
    InteractionManager.runAfterInteractions(() => {
      setFocus('name');
    });
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
    <ScrollViewRegisterContainer
      paragraph="Step 1/3"
      bottomButton={{
        text: intl.formatMessage({
          id: 'button.next',
        }),
        size: 'large',
        onPress: onSubmit,
      }}
      paddingX={20}>
      <NamePasswordInput
        control={control}
        errors={errors}
        getValues={getValues}
        setFocus={setFocus}
        onSubmit={onSubmit}
      />

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
          setIsOpenSelectItemModal(true);
        }}>
        <XAxis alignY="center">
          <Text style={style.flatten(['body2', 'color-gray-50', 'flex-1'])}>
            {selectedApp}
            {selectedApp === 'Cosmos' ? ' (Recommended)' : null}
          </Text>

          <ArrowDownFillIcon
            size={24}
            color={style.get('color-gray-300').color}
          />
        </XAxis>
      </RectButton>

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

      <SelectItemModal
        isOpen={isOpenSelectItemModal}
        setIsOpen={setIsOpenSelectItemModal}
        items={supportedApps.map(item => ({
          key: item,
          title: item,
          selected: item === selectedApp,
          onSelect: () => {
            setSelectedApp(item);
            setIsOpenSelectItemModal(false);
          },
        }))}
      />
    </ScrollViewRegisterContainer>
  );
});
