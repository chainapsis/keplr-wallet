import React, { FunctionComponent, useMemo } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { Image, Text, View } from "react-native";
import { useStyle } from "../../styles";
import { Button } from "../../components/button";
import { WalletConnectIcon } from "../../components/icon";
import { useStore } from "../../stores";
import { PermissionData } from "@keplr-wallet/background";
import { WCMessageRequester } from "../../stores/wallet-connect/msg-requester";

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

    const style = useStyle();

    return (
      <CardModal title="Wallet Connect">
        <Text style={style.flatten(["margin-bottom-44"])}>
          <Text
            style={style.flatten([
              "body1",
              "color-text-black-medium",
              "font-semibold",
            ])}
          >
            {session.peerMeta!.url}
          </Text>
          <Text style={style.flatten(["body1", "color-text-black-medium"])}>
            {" is requesting to connect to your Keplr account on "}
          </Text>
          <Text
            style={style.flatten([
              "body1",
              "color-text-black-medium",
              "font-semibold",
            ])}
          >
            {data.chainIds.join(", ") + "."}
          </Text>
        </Text>
        <View style={style.flatten(["items-center"])}>
          <View style={style.flatten(["margin-bottom-8"])}>
            <WalletConnectIcon height={32} />
          </View>
          <Image
            style={style.flatten(["height-74", "margin-bottom-68"])}
            resizeMode="contain"
            source={require("../../assets/image/wallet-connection.png")}
          />
        </View>
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
