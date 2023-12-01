import React, {FunctionComponent, PropsWithChildren, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {SignModal} from '../../screen/sign/sign-modal';
import {BasicAccessModal} from '../../components/modal/basic-access';
import {SuggestChainModal} from '../../components/modal/suggest-chain';
import {BackHandler, Platform} from 'react-native';
import {WCMessageRequester} from '../../stores/wallet-connect/msg-requester';
import {WalletConnectAccessModal} from '../../components/modal/wallet-connect-access';

export const InteractionModalsProvider: FunctionComponent<PropsWithChildren> =
  observer(({children}) => {
    const {
      signInteractionStore,
      permissionStore,
      chainSuggestStore,
      walletConnectStore,
    } = useStore();

    useEffect(() => {
      if (walletConnectStore.needGoBackToBrowser && Platform.OS === 'android') {
        BackHandler.exitApp();
      }
    }, [walletConnectStore.needGoBackToBrowser]);

    return (
      <React.Fragment>
        {signInteractionStore.waitingData &&
        !signInteractionStore.waitingData.data.signDocWrapper.isADR36SignDoc ? (
          <SignModal interactionData={signInteractionStore.waitingData} />
        ) : null}

        {permissionStore.waitingPermissionDatas &&
          permissionStore.waitingPermissionDatas.map(data => {
            if (data.data.origins.length === 1) {
              if (WCMessageRequester.isVirtualURL(data.data.origins[0])) {
                return (
                  <WalletConnectAccessModal
                    isOpen={true}
                    setIsOpen={async () =>
                      await permissionStore.rejectPermissionAll()
                    }
                    key={data.id}
                    id={data.id}
                    data={data.data}
                  />
                );
              }
            }

            return (
              <BasicAccessModal
                isOpen={true}
                setIsOpen={async () =>
                  await permissionStore.rejectPermissionAll()
                }
                key={data.id}
              />
            );
          })}

        {chainSuggestStore.waitingSuggestedChainInfo ? (
          <SuggestChainModal />
        ) : null}

        {children}
      </React.Fragment>
    );
  });
