import React, {FunctionComponent, useRef} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {useStyle} from '../../styles';
import {BaseModalHeader, Modal} from './modal';
import {BottomSheetModal, BottomSheetView} from '@gorhom/bottom-sheet';
import {useEffectOnce} from '../../hooks';
import {useIntl} from 'react-intl';
import {XAxis} from '../axis';
import {Button} from '../button';
import {Gutter} from '../gutter';

// TODO: 디자인이 아직 안나와서 Reject, Approve 버튼만 만들어놨음 -> 이후에 디자인이 나오면 수정해야함
export const SuggestChainModal: FunctionComponent = observer(() => {
  const intl = useIntl();
  const style = useStyle();
  const {chainSuggestStore} = useStore();

  const modalRef = useRef<BottomSheetModal>(null);
  useEffectOnce(() => {
    modalRef.current?.present();
  });

  const waitingData = chainSuggestStore.waitingSuggestedChainInfo;

  if (!waitingData) {
    return null;
  }

  const queryCommunityChainInfo = chainSuggestStore.getCommunityChainInfo(
    waitingData.data.chainInfo.chainId,
  );
  const communityChainInfo = queryCommunityChainInfo.chainInfo;

  const reject = async () => {
    await chainSuggestStore.rejectWithProceedNext(waitingData.id, () => {});
  };

  const approve = async () => {
    const chainInfo = communityChainInfo || waitingData.data.chainInfo;

    await chainSuggestStore.approveWithProceedNext(
      waitingData.id,
      chainInfo,
      () => {},
    );
  };

  return (
    <Modal
      ref={modalRef}
      snapPoints={['50%']}
      enableDynamicSizing={true}
      onDismiss={reject}>
      <BottomSheetView style={style.flatten(['padding-12'])}>
        <BaseModalHeader
          title={intl.formatMessage(
            {
              id: 'page.suggest-chain.title',
            },
            {chainName: waitingData.data.chainInfo.chainName},
          )}
        />

        <XAxis>
          <Button
            size="large"
            text="Reject"
            color="secondary"
            containerStyle={{flex: 1, width: '100%'}}
            onPress={reject}
          />

          <Gutter size={16} />

          <Button
            size="large"
            text="Approve"
            containerStyle={{flex: 1, width: '100%'}}
            onPress={approve}
          />
        </XAxis>
      </BottomSheetView>
    </Modal>
  );
});
