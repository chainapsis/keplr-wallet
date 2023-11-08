import React, {FunctionComponent, useMemo, useRef} from 'react';
import {observer} from 'mobx-react-lite';
import {useStyle} from '../../styles';
import {PageWithScrollView} from '../../components/page';
import {Platform, Text} from 'react-native';
import {useStore} from '../../stores';
import {Dec} from '@keplr-wallet/unit';
import {Box} from '../../components/box';
import FastImage from 'react-native-fast-image';
import {ViewToken} from '../../components/token-view';
import {Gutter} from '../../components/gutter';
import {useNavigation} from '@react-navigation/native';
import {StackNavProp} from '../../navigation';
import {TextButton} from '../../components/text-button';
import {ArrowRightIcon} from '../../components/icon/arrow-right';
import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {Modal} from '../../components/modal';
import {
  GovSelectChainModal,
  SelectModalItem,
} from './components/select-modal-gov';

export const GovernanceScreen: FunctionComponent = observer(() => {
  const style = useStyle();
  const {hugeQueriesStore} = useStore();
  const selectChainModalRef = useRef<BottomSheetModal>(null);
  const navigation = useNavigation<StackNavProp>();
  const delegations: ViewToken[] = useMemo(
    () =>
      hugeQueriesStore.delegations.filter(token => {
        return token.token.toDec().gt(new Dec(0));
      }),
    [hugeQueriesStore.delegations],
  );
  const modalItems: SelectModalItem[] = useMemo(() => {
    return hugeQueriesStore.stakables.map(viewToken => {
      return {
        key: viewToken.chainInfo.chainId,
        label: viewToken.chainInfo.chainName,
        imageUrl: viewToken.chainInfo.chainSymbolImageUrl,
      } as SelectModalItem;
    });
  }, [hugeQueriesStore.stakables]);
  return (
    <PageWithScrollView backgroundMode={'default'}>
      <TextButton
        text="전체 체인의 프로포절들 보기"
        size="large"
        color="faint"
        containerStyle={style.flatten(['padding-x-12', 'padding-y-6'])}
        onPress={() => {
          selectChainModalRef.current?.present();
        }}
        rightIcon={
          <ArrowRightIcon size={18} color={style.get('color-text-low').color} />
        }
      />
      <Gutter size={12} />
      {delegations.map(token => {
        return (
          <React.Fragment key={token.chainInfo.chainId}>
            <Box
              padding={16}
              backgroundColor={style.get('color-gray-600').color}
              onClick={() =>
                navigation.navigate('Governance', {
                  screen: 'Governance.list',
                  params: {chainId: token.chainInfo.chainId},
                })
              }>
              <FastImage source={{uri: token.chainInfo.chainSymbolImageUrl}} />
              <Text style={style.flatten(['h4', 'color-text-high'])}>
                {token.chainInfo.chainName}
              </Text>
            </Box>
            <Gutter size={12} />
          </React.Fragment>
        );
      })}
      <Modal
        ref={selectChainModalRef} //NOTE BottomSheetTextInput가 안드로이드일때 올바르게 동작 하지 않고
        //같은 50% 일때 키보드가 있을시 모달 크기가 작아서 안드로이드 일때만 70% 으로 설정
        snapPoints={Platform.OS === 'android' ? ['70%'] : ['50%']}>
        <GovSelectChainModal
          items={modalItems}
          placeholder="search for chain"
          onSelect={({key}) => {
            navigation.navigate('Governance', {
              screen: 'Governance.list',
              params: {chainId: key},
            });
          }}
        />
      </Modal>
    </PageWithScrollView>
  );
});
