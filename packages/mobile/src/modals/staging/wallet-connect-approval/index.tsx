import React, { FunctionComponent } from "react";
import { registerModal } from "../base";
import { CardModal } from "../card";
import { View } from "react-native";
import { ProposalApproval } from "../../../stores/wallet-connect";
import { useStyle } from "../../../styles";
import { Button } from "../../../components/staging/button";

export const WalletConnectApprovalModal: FunctionComponent<{
  isOpen: boolean;
  close: () => void;
  approval: ProposalApproval;
}> = registerModal(
  ({ approval }) => {
    const style = useStyle();

    return (
      <CardModal title="Wallet Connect">
        <View style={style.flatten(["flex-row"])}>
          <Button
            containerStyle={style.get("flex-1")}
            text="Reject"
            mode="light"
            color="danger"
            onPress={() => {
              approval.reject();
            }}
          />
          <View style={style.get("width-page-pad")} />
          <Button
            containerStyle={style.get("flex-1")}
            text="Approve"
            onPress={() => {
              approval.resolve();
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
