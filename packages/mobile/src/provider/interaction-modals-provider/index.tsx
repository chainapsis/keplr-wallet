import React, {FunctionComponent, PropsWithChildren, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {SignModal} from '../../screen/sign/sign-modal';
import {
  BasicAccessModal,
  SuggestChainModal,
  WalletConnectAccessModal,
  GlobalPermissionModal,
} from '../../components/modal';
import {BackHandler, Platform} from 'react-native';
import {WCMessageRequester} from '../../stores/wallet-connect/msg-requester';

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

        {permissionStore.waitingGlobalPermissionData ? (
          <GlobalPermissionModal
            isOpen={true}
            setIsOpen={async () => {
              await permissionStore.rejectGlobalPermissionAll();
            }}
          />
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
          <SuggestChainModal
            isOpen={true}
            setIsOpen={async () => {
              await chainSuggestStore.rejectAll();
            }}
          />
        ) : null}

        {children}
      </React.Fragment>
    );
  });
