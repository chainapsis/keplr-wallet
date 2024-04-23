import React, {FunctionComponent, PropsWithChildren, useEffect} from 'react';
import {observer} from 'mobx-react-lite';
import {useStore} from '../../stores';
import {SignModal} from '../../screen/sign/sign-modal';
import {
  BasicAccessModal,
  SuggestChainModal,
  WalletConnectAccessModal,
  GlobalPermissionModal,
  AddTokenModal,
} from '../../components/modal';
import {BackHandler, Platform} from 'react-native';
import {WCMessageRequester} from '../../stores/wallet-connect/msg-requester';
import {ADR36SignModal} from '../../screen/sign/sign-adr36-modal';
import {SignEthereumModal} from '../../screen/sign/sign-ethereum-modal';
import {LoadingModal} from '../../components/modal/loading';

export const InteractionModalsProvider: FunctionComponent<PropsWithChildren> =
  observer(({children}) => {
    const {
      signInteractionStore,
      signEthereumInteractionStore,
      permissionStore,
      chainSuggestStore,
      walletConnectStore,
      keyRingStore,
      tokensStore,
    } = useStore();

    useEffect(() => {
      if (walletConnectStore.needGoBackToBrowser && Platform.OS === 'android') {
        BackHandler.exitApp();
      }
    }, [walletConnectStore.needGoBackToBrowser]);

    const mergedPermissionData = permissionStore.waitingPermissionMergedData;

    return (
      <React.Fragment>
        {signInteractionStore.waitingData &&
        !signInteractionStore.waitingData.data.signDocWrapper.isADR36SignDoc ? (
          <SignModal
            isOpen={true}
            setIsOpen={() => {
              signInteractionStore.rejectWithProceedNext(
                signInteractionStore.waitingData?.id!,
                () => {},
              );
            }}
            interactionData={signInteractionStore.waitingData}
          />
        ) : null}

        {signInteractionStore.waitingData &&
        signInteractionStore.waitingData.data.signDocWrapper.isADR36SignDoc ? (
          <ADR36SignModal
            isOpen={true}
            setIsOpen={() => signInteractionStore.rejectAll()}
          />
        ) : null}

        {signEthereumInteractionStore.waitingData ? (
          <SignEthereumModal
            isOpen={true}
            setIsOpen={() => {
              signEthereumInteractionStore.rejectWithProceedNext(
                signEthereumInteractionStore.waitingData?.id!,
                () => {},
              );
            }}
            interactionData={signEthereumInteractionStore.waitingData}
          />
        ) : null}

        {keyRingStore.status === 'unlocked' &&
        walletConnectStore.isPendingClientFromDeepLink ? (
          <LoadingModal isOpen={true} setIsOpen={() => {}} />
        ) : null}

        {permissionStore.waitingGlobalPermissionData ? (
          <GlobalPermissionModal
            isOpen={true}
            setIsOpen={async () => {
              await permissionStore.rejectGlobalPermissionAll();
            }}
          />
        ) : null}

        {mergedPermissionData
          ? (() => {
              const data = mergedPermissionData;
              if (data.origins.length === 1) {
                if (WCMessageRequester.isVirtualURL(data.origins[0])) {
                  return (
                    <WalletConnectAccessModal
                      isOpen={true}
                      setIsOpen={async () =>
                        await permissionStore.rejectPermissionWithProceedNext(
                          data.ids,
                          () => {},
                        )
                      }
                      key={data.ids.join(',')}
                      data={data}
                    />
                  );
                }
              }

              return (
                <BasicAccessModal
                  isOpen={true}
                  setIsOpen={async () =>
                    await permissionStore.rejectPermissionWithProceedNext(
                      data.ids,
                      () => {},
                    )
                  }
                  key={data.ids.join(',')}
                  data={data}
                />
              );
            })()
          : null}

        {chainSuggestStore.waitingSuggestedChainInfo ? (
          <SuggestChainModal
            isOpen={true}
            setIsOpen={async () => {
              await chainSuggestStore.rejectAll();
            }}
          />
        ) : null}

        {tokensStore.waitingSuggestedToken ? (
          <AddTokenModal
            isOpen={true}
            setIsOpen={async () => {
              await tokensStore.rejectAllSuggestedTokens();
            }}
          />
        ) : null}

        {children}
      </React.Fragment>
    );
  });
