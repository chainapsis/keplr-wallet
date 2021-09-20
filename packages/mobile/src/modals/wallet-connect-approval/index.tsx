import React, { FunctionComponent, useMemo } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { Text, View } from "react-native";
import { useStyle } from "../../styles";
import { Button } from "../../components/button";
import { useStore } from "../../stores";
import { PermissionData } from "@keplr-wallet/background";
import { WCMessageRequester } from "../../stores/wallet-connect/msg-requester";
import { WCAppLogoAndName } from "../../components/wallet-connect";

export const WalletConnectApprovalModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  id: string;
  data: PermissionData;
}> = registerModal(
  ({ id, data }) => {
    const { permissionStore, walletConnectStore } = useStore();

    const session = useMemo(() => {
      if (data.origins.length !== 1) {
        throw new Error("Invalid origins");
      }

      return walletConnectStore.getSession(
        WCMessageRequester.getSessionIdFromVirtualURL(data.origins[0])
      )!;
    }, [data.origins, walletConnectStore]);

    const appName =
      session.peerMeta?.name || session.peerMeta?.url || "unknown";

    const style = useStyle();

    return (
      <CardModal title="Wallet Connect">
        <WCAppLogoAndName
          containerStyle={style.flatten(["margin-y-20"])}
          peerMeta={session.peerMeta}
        />
        <Text style={style.flatten(["margin-bottom-40", "text-center"])}>
          <Text
            style={style.flatten([
              "body1",
              "color-text-black-low",
              "font-semibold",
            ])}
          >
            {appName}
          </Text>
          <Text style={style.flatten(["body1", "color-text-black-low"])}>
            {" is requesting to connect to your Keplr account on "}
          </Text>
          <Text
            style={style.flatten([
              "body1",
              "color-text-black-low",
              "font-semibold",
            ])}
          >
            {data.chainIds.join(", ") + "."}
          </Text>
        </Text>
        <View style={style.flatten(["flex-row"])}>
          <Button
            containerStyle={style.get("flex-1")}
            text="Reject"
            mode="outline"
            color="danger"
            onPress={() => {
              permissionStore.reject(id);
            }}
          />
          <View style={style.get("width-page-pad")} />
          <Button
            containerStyle={style.get("flex-1")}
            text="Approve"
            onPress={() => {
              permissionStore.approve(id);
            }}
          />
        </View>
      </CardModal>
    );
  },
  {
    disableSafeArea: true,
  }
);
