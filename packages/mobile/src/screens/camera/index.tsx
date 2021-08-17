import React, { FunctionComponent, useRef } from "react";
import { RNCamera } from "react-native-camera";
import { useStyle } from "../../styles";
import { PageWithView } from "../../components/staging/page";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { useSmartNavigation } from "../../navigation";
import { autorun } from "mobx";

export const CameraScreen: FunctionComponent = observer(() => {
  const { walletConnectStore } = useStore();

  const style = useStyle();

  const smartNavigation = useSmartNavigation();

  const oncePerRead = useRef(false);

  return (
    <PageWithView disableSafeArea={true}>
      <RNCamera
        style={style.flatten(["flex-1"])}
        type={RNCamera.Constants.Type.back}
        barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}
        onBarCodeRead={async ({ data }) => {
          if (!oncePerRead.current) {
            oncePerRead.current = true;

            try {
              if (data.startsWith("wc:")) {
                await walletConnectStore.pair(data);

                const beforeLength =
                  walletConnectStore.pendingProposalApprovals.length;
                // Wait until the pending proposal is actually added.
                await new Promise<void>((resolve) => {
                  const disposer = autorun(() => {
                    if (
                      beforeLength !==
                      walletConnectStore.pendingProposalApprovals.length
                    ) {
                      resolve();
                      if (disposer) {
                        disposer();
                      }
                    }
                  });
                });

                smartNavigation.navigateSmart("Home", {});
              }
            } finally {
              oncePerRead.current = false;
            }
          }
        }}
      />
    </PageWithView>
  );
});
