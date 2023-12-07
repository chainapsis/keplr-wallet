import React, { FunctionComponent, useMemo } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { Text, View } from "react-native";
import { useStyle } from "../../styles";
import { Button } from "../../components/button";
import { useStore } from "../../stores";
import { observer } from "mobx-react-lite";

export const BasicAccessPermissionModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
}> = registerModal(
  observer(() => {
    const style = useStyle();
    const { permissionStore } = useStore();

    const waitingPermission =
      permissionStore.waitingBasicAccessPermissions.length > 0
        ? permissionStore.waitingBasicAccessPermissions[0]
        : undefined;

    const host = useMemo(() => {
      if (waitingPermission) {
        return waitingPermission.data.origins
          .map((origin) => {
            return new URL(origin).host;
          })
          .join(", ");
      } else {
        return "";
      }
    }, [waitingPermission]);

    const chainIds = useMemo(() => {
      if (!waitingPermission) {
        return "";
      }

      return waitingPermission.data.chainIds.join(", ");
    }, [waitingPermission]);

    return (
      <CardModal>
        <View
          style={style.flatten([
            "flex-column",
            "items-center",
            "margin-bottom-40",
          ])}
        >
          <Text style={style.flatten(["h3", "color-text-high"])}>
            Requesting Connection
          </Text>
        </View>

        <Text style={style.flatten(["text-center", "margin-bottom-40"])}>
          <Text
            style={style.flatten(["body2", "color-text-middle", "font-bold"])}
          >
            {host}
          </Text>

          <Text style={style.flatten(["body2", "color-text-middle"])}>
            {" is requesting to connect to your Keplr account on "}
          </Text>

          <Text
            style={style.flatten(["body2", "color-text-middle", "font-bold"])}
          >
            {chainIds}
          </Text>
        </Text>

        <View style={style.flatten(["flex-row"])}>
          <Button
            containerStyle={style.get("flex-1")}
            text="Reject"
            mode="outline"
            color="danger"
            onPress={async () => {
              if (waitingPermission) {
                await permissionStore.reject(waitingPermission.id);
              }
            }}
          />
          <View style={style.get("width-page-pad")} />
          <Button
            containerStyle={style.get("flex-1")}
            text="Approve"
            onPress={async () => {
              if (waitingPermission) {
                await permissionStore.approve(waitingPermission.id);
              }
            }}
          />
        </View>
      </CardModal>
    );
  }),
  {
    disableSafeArea: true,
  }
);
