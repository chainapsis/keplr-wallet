import {RouteProp, useNavigation} from '@react-navigation/native';
import {observer} from 'mobx-react-lite';
import React from 'react';
import {Text, View} from 'react-native';
import {useBottomSheet} from '@gorhom/bottom-sheet';
import {useStyle} from '../../styles';
import {useStore} from '../../stores';
import {Column, Columns} from '../../components/column';
import {IconButton} from '../../components/icon-button';
import {ArrowLeftIcon} from '../../components/icon/left-arrow';
import {Box} from '../../components/box';
import {BaseModal} from '../../components/modal/modal';
import {CopyAddressScene} from './components/copy-address-scene';

interface QRSeneProps {
  chainId: string;
  chainName: string;
  bech32Address: string;
}
export type DepositModalNav = {
  List: undefined;
  QR: QRSeneProps;
};

export const DepositModal = () => {
  return (
    <BaseModal
      screenOptions={{
        title: '',
        headerBackTitle: '',
      }}
      initialRouteName="List"
      screenList={[
        {routeName: 'List', scene: () => <CopyAddressScene />},
        {
          routeName: 'QR',
          scene: QRScene,
        },
      ]}
    />
  );
};

//TODO 이후 qr화면을 보여줘야 됨
//NOTE - navigation에서 기본으로 제공해주는 뒤로가기 버튼으로 할때는 뒤로 간뒤 넓어지는 애니메이션이 진행되는데
// 커스텀 버튼을 만들어서 goBack을 실행하면 뒤로 가면서 애니메이션이 실행되서 일단 이렇게 진행
const QRScene = observer(
  ({route}: {route: RouteProp<DepositModalNav, 'QR'>}) => {
    const bottom = useBottomSheet();
    const {chainStore} = useStore();
    const chainInfo = chainStore.getChain(route.params?.chainId);
    bottom.snapToPosition('40%');
    const style = useStyle();
    const nav = useNavigation();

    return (
      <View style={style.flatten(['height-full'])}>
        <Columns sum={2}>
          <IconButton
            onPress={() => {
              nav.goBack();
            }}
            icon={color => <ArrowLeftIcon color={color} size={20} />}
          />
          <Column weight={1} />

          <Text style={style.flatten(['h1'])}>{chainInfo.chainName}</Text>
          <Column weight={1} />
          <Box width={16} height={16} />
        </Columns>
        <Text>{chainInfo.chainName}</Text>
      </View>
    );
  },
);
