import React, { FunctionComponent } from "react";
import { observer } from "mobx-react-lite";
import { useStore } from "../../stores";
import { PageWithScrollView } from "../../components/page";
import { RectButton } from "../../components/rect-button";
import { Text } from "react-native";

export const ManageWalletConnectScreen: FunctionComponent = observer(() => {
  const { walletConnectStore } = useStore();

  return (
    <PageWithScrollView>
      {walletConnectStore.sessions.map((session) => {
        return (
          <RectButton
            key={session.key}
            onPress={() => {
              console.log(session.key);
              walletConnectStore.disconnect(session.key);
            }}
          >
            <Text>{session.peerMeta?.name}</Text>
          </RectButton>
        );
      })}
    </PageWithScrollView>
  );
});
