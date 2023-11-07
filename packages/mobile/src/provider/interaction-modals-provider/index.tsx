import React, {FunctionComponent, PropsWithChildren} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {SignModal} from '../../screen/sign/sign-modal';
import {BasicAccessModal} from '../../components/modal/basic-access';
import {SuggestChainModal} from '../../components/modal/suggest-chain';

export const InteractionModalsProvider: FunctionComponent<PropsWithChildren> =
  observer(({children}) => {
    const {signInteractionStore, permissionStore, chainSuggestStore} =
      useStore();

    return (
      <React.Fragment>
        {signInteractionStore.waitingData &&
        !signInteractionStore.waitingData.data.signDocWrapper.isADR36SignDoc ? (
          <SignModal interactionData={signInteractionStore.waitingData} />
        ) : null}

        {permissionStore.waitingPermissionDatas &&
          permissionStore.waitingPermissionDatas.map(data => {
            return <BasicAccessModal key={data.id} />;
          })}

        {chainSuggestStore.waitingSuggestedChainInfo ? (
          <SuggestChainModal />
        ) : null}

        {children}
      </React.Fragment>
    );
  });
