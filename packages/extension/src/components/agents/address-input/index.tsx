import { userDetails } from "@chatStore/user-slice";
import { useNotification } from "@components/notification";
import { deliverMessages } from "@graphQL/messages-api";
import React, { FunctionComponent, useMemo } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router";

import { useStore } from "../../../stores";
import style from "./style.module.scss";
import { Button } from "reactstrap";
import { AddressInput } from "@components/form";
import { useSendTxConfig } from "@keplr-wallet/hooks";
import { observer } from "mobx-react-lite";

export const RecipientAddressInput: FunctionComponent<{
  label: string;
  disabled: boolean;
}> = observer(({ label, disabled }) => {
  const { chainStore, accountStore, queriesStore, uiConfigStore } = useStore();
  const current = chainStore.current;
  const accountInfo = accountStore.getAccount(current.chainId);
  const history = useHistory();
  const targetAddress = history.location.pathname.split("/")[3];

  const user = useSelector(userDetails);
  const notification = useNotification();
  const sendConfigs = useSendTxConfig(
    chainStore,
    queriesStore,
    accountStore,
    current.chainId,
    accountInfo.bech32Address,
    {
      allowHexAddressOnEthermint: true,
      icns: uiConfigStore.icnsInfo,
      computeTerraClassicTax: true,
    }
  );

  const error = sendConfigs.recipientConfig.error;
  const errorText: boolean | undefined = useMemo(() => {
    if (error) {
      if (error.constructor) {
        return true;
      }
    }
    return false;
  }, [error]);

  const sendAddressDetails = async () => {
    try {
      const messagePayload = sendConfigs.recipientConfig.recipient;
      await deliverMessages(
        user.accessToken,
        current.chainId,
        messagePayload,
        accountInfo.bech32Address,
        targetAddress
      );
    } catch (e) {
      console.log(e);
      notification.push({
        type: "warning",
        placement: "top-center",
        duration: 5,
        content: `Failed to send provided Address`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    }
  };

  const cancel = async () => {
    try {
      await deliverMessages(
        user.accessToken,
        current.chainId,
        "/cancel",
        accountInfo.bech32Address,
        targetAddress
      );
    } catch (e) {
      console.log(e);
      notification.push({
        type: "warning",
        placement: "top-center",
        duration: 5,
        content: `Failed to cancel Operation`,
        canDelete: true,
        transition: {
          duration: 0.25,
        },
      });
    }
  };

  return (
    <div className={style.message}>
      <AddressInput
        recipientConfig={sendConfigs.recipientConfig}
        memoConfig={sendConfigs.memoConfig}
        label={label}
        value={""}
        disabled={disabled}
        disableAddressBook={disabled}
      />
      <Button
        type="button"
        color="primary"
        size="sm"
        disabled={disabled || !!errorText}
        onClick={() => sendAddressDetails()}
      >
        Proceed
      </Button>
      <Button
        type="button"
        color="secondary"
        size="sm"
        disabled={disabled}
        onClick={() => cancel()}
      >
        Cancel
      </Button>
    </div>
  );
});
