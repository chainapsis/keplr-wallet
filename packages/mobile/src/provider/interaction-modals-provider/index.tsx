import React, {FunctionComponent, PropsWithChildren} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {SignModal} from '../../screen/sign/sign-modal';

export const InteractionModalsProvider: FunctionComponent<PropsWithChildren> =
  observer(({children}) => {
    const {signInteractionStore} = useStore();

    return (
      <React.Fragment>
        {signInteractionStore.waitingData &&
        !signInteractionStore.waitingData.data.signDocWrapper.isADR36SignDoc ? (
          <SignModal interactionData={signInteractionStore.waitingData} />
        ) : null}
        {children}
      </React.Fragment>
    );
  });
